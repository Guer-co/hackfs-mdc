package libp2pnode

import (
	"encoding/json"
	commontools "github.com/Guer-co/hackfs-mdc/backend/pkg/common"
	pb "github.com/Guer-co/hackfs-mdc/backend/pkg/libp2pnode/pb"
	"github.com/Guer-co/hackfs-mdc/backend/pkg/models/jsonapi"
	"github.com/Guer-co/hackfs-mdc/backend/pkg/textilehelper"
	"github.com/gogo/protobuf/proto"
	"github.com/libp2p/go-libp2p-core/network"
	"github.com/libp2p/go-libp2p-core/peer"
	"io/ioutil"
	"net/http"
)

// pattern: /protocol-name/request-or-response-message/version
const jsonRequestProtocolName = "/hackfspay3/jsonrequest/0.0.1"
const jsonResponseProtocolName = "/hackfspay3/jsonresponse/0.0.1"

type JsonProtocol struct {
	node     *Node                          // local host
	requests map[string]*pb.JsonRequest   // used to access request data from response handlers
	JsonResponseCh chan *pb.JsonResponse      // channel for outputting response
}

func NewJsonProtocol(node *Node) *JsonProtocol {
	e := JsonProtocol{node: node, requests: make(map[string]*pb.JsonRequest), JsonResponseCh: make(chan *pb.JsonResponse)}
	node.SetStreamHandler(jsonRequestProtocolName, e.onJsonRequest)
	node.SetStreamHandler(jsonResponseProtocolName, e.onJsonResponse)

	// design note: to implement fire-and-forget style messages you may just skip specifying a response callback.
	// a fire-and-forget message will just include a request and not specify a response object
	return &e
}

func (e *JsonProtocol) getJsonResponseWithError(req *pb.JsonRequest, code int32, err error) *pb.JsonResponse {
	return &pb.JsonResponse{
		MessageData:          e.node.NewMessageData(req.MessageData.Id, false),
		ResponseData:         &pb.ResponseData{
			Code:                 code,
			Err:                  err.Error(),
		},
		JsonData:             &pb.JsonData{},
	}
}

func (e *JsonProtocol) getJsonResponseWithJsonOutput(req *pb.JsonRequest, jsonOutput []byte) *pb.JsonResponse {
	//TODO: save a record in DB
	return &pb.JsonResponse{
		MessageData:          e.node.NewMessageData(req.MessageData.Id, false),
		ResponseData:         &pb.ResponseData{
			Code:                 http.StatusOK,
			Err:                  "",
		},
		JsonData:             &pb.JsonData{
			RequesterId:          req.JsonData.RequesterId,
			Type:                 req.JsonData.Type,
			JsonOutput:           string(jsonOutput),
			ReceivedAt:           req.JsonData.ReceivedAt,
			UpdatedAt:            commontools.GetTimeStampMillisecond(),
		},
	}
}

func (e *JsonProtocol) processJsonRequestQuery(req *pb.JsonRequest) *pb.JsonResponse {
	jq := jsonapi.Query{}
	err := json.Unmarshal([]byte(req.JsonData.JsonInput), &jq)
	if err != nil {
		return e.getJsonResponseWithError(req, http.StatusInternalServerError, commontools.Errorf(err, "json.Unmarshal failed"))
	}
	res, err := textilehelper.QueryWithJsonApiQuery(jq)
	if err != nil {
		return e.getJsonResponseWithError(req, http.StatusInternalServerError, commontools.Errorf(err, "textilehelper.QueryWithJsonApiQuery failed"))
	}
	datas, ok := res.([]*pb.ContentData)
	if !ok {
		return e.getJsonResponseWithError(req, http.StatusInternalServerError, commontools.Errorf(nil, "res casting to ContentData failed"))
	}
	jsonOutput, err := json.Marshal(datas)
	if err != nil {
		return e.getJsonResponseWithError(req, http.StatusInternalServerError, commontools.Errorf(err, "json.Marshal failed"))
	}
	return e.getJsonResponseWithJsonOutput(req, jsonOutput)
}

func (e *JsonProtocol) processJsonRequestDownload(req *pb.JsonRequest) *pb.JsonResponse {
	data := pb.DownloadData{}
	err := json.Unmarshal([]byte(req.JsonData.JsonInput), &data)

	//Look up ContentData from Thread
	contentData, err := GetContentDataRecordWithDownloadData(&data)
	if err != nil {
		return e.getJsonResponseWithError(req, http.StatusInternalServerError, commontools.Errorf(err, "GetContentDataRecordWithDownloadData failed"))
	}
	//TODO: check smart contract for access control
	//Pull bucket to bytes
	outputBytes, err := textilehelper.PullBytesFromBucket(contentData.BucketKey, contentData.FileName)
	if err != nil {
		return e.getJsonResponseWithError(req, http.StatusInternalServerError, commontools.Errorf(err, "textilehelper.PullBytesFromBucket failed"))
	}
	if int64(len(outputBytes)) < contentData.FileSize {
		return e.getJsonResponseWithError(req, http.StatusInternalServerError, commontools.Errorf(err, "bytes size %v not matching the expected size %v in contentData record", len(outputBytes), contentData.FileSize))
	}
	jsonOutput, err := json.Marshal(outputBytes)
	if err != nil {
		return e.getJsonResponseWithError(req, http.StatusInternalServerError, commontools.Errorf(err, "json.Marshal failed"))
	}
	return e.getJsonResponseWithJsonOutput(req, jsonOutput)
}

func (e *JsonProtocol) processJsonRequestUpload(req *pb.JsonRequest) *pb.JsonResponse {
	data := pb.UploadData{}
	err := json.Unmarshal([]byte(req.JsonData.JsonInput), &data)

	receivedFileSize := len(data.FileBytes)
	logger.Infof("receivedFileSize: %+v, expectedFileSize %+v", receivedFileSize, data.FileSize)
	if int64(receivedFileSize) < data.FileSize {
		return e.getJsonResponseWithError(req, http.StatusInternalServerError, commontools.Errorf(nil, "receivedFileSize not match"))
	}

	//create a new bucket and push the file into it.
	//response with IPNS links or err
	threadKey, bucketKey, encryptedUrl, err := textilehelper.CreateBucketAndPushData(data.OwnerId+"."+commontools.GetUlid().String(), data.FileName, data.FileBytes, true)
	if err != nil {
		return e.getJsonResponseWithError(req, http.StatusInternalServerError, commontools.Errorf(err, "textilehelper.CreateBucketAndPushData failed"))
	}

	//generate preview according to fileType, or figure out the fileType automatically
	previewUrl, previewFileType, err := GetPreviewFrom(&data)
	if err != nil {
		return e.getJsonResponseWithError(req, http.StatusInternalServerError, commontools.Errorf(err, "GetPreviewFrom failed"))
	}
	if len(previewFileType) == 0 {
		previewFileType = "unknown"
	}

	description := data.Description
	if len(description) == 0 {
		description = "no description"
	}

	contentData := pb.ContentData{
		//Id:                 "",   //to be generated by textile
		OwnerId:              data.OwnerId,
		FileName:             data.FileName,
		FileType:             previewFileType,
		FileSize:             data.FileSize,
		Description:          description,
		ThreadKey:            threadKey,
		BucketKey:            bucketKey,
		EncryptedUrl:         encryptedUrl,
		PreviewUrl:           previewUrl,
		ReceivedAt:           req.JsonData.ReceivedAt,
		UpdatedAt:            commontools.GetTimeStampMillisecond(),
	}
	logger.Infof("Saving contentData to DB: %+v", contentData)
	_, err = textilehelper.InsertToContentDB(&contentData)
	if err != nil {
		return e.getJsonResponseWithError(req, http.StatusInternalServerError, commontools.Errorf(err, "textilehelper.InsertToContentDB failed"))
	}

	jsonOutput, err := json.Marshal(contentData)
	if err != nil {
		return e.getJsonResponseWithError(req, http.StatusInternalServerError, commontools.Errorf(err, "json.Marshal failed"))
	}
	return e.getJsonResponseWithJsonOutput(req, jsonOutput)
}

func (e *JsonProtocol) processJsonRequest(req *pb.JsonRequest) *pb.JsonResponse {
	req.JsonData.ReceivedAt = commontools.GetTimeStampMillisecond()

	switch req.JsonData.Type {
	case "query":
		return e.processJsonRequestQuery(req)
	case "download":
		return e.processJsonRequestDownload(req)
	case "upload":
		return e.processJsonRequestUpload(req)
	default:
		return e.getJsonResponseWithError(req, http.StatusInternalServerError, commontools.Errorf(nil, "Not supported Json API type: %s", req.JsonData.Type))
	}
}

// remote peer requests handler
func (e *JsonProtocol) onJsonRequest(s network.Stream) {
	// get request data
	req := &pb.JsonRequest{}
	buf, err := ioutil.ReadAll(s)
	if err != nil {
		s.Reset()
		logger.Error(err)
		return
	}
	s.Close()

	// unmarshal it
	proto.Unmarshal(buf, req)
	if err != nil {
		logger.Error(err)
		return
	}
	logger.Infof("%s Received json request from %s: %+v", s.Conn().LocalPeer(), s.Conn().RemotePeer(), req.JsonData.Type)

	//authenticateMessage
	valid := e.node.authenticateMessage(req, req.MessageData)
	if !valid {
		logger.Errorf("Failed to authenticate message")
		return
	}

	// process request with textile
	resp := e.processJsonRequest(req)

	// sign the data
	signature, err := e.node.signProtoMessage(resp)
	if err != nil {
		logger.Errorf("failed to sign response")
		return
	}
	// add the signature to the message
	resp.MessageData.Sign = signature

	// send the response
	ok := e.node.sendProtoMessage(s.Conn().RemotePeer(), jsonResponseProtocolName, resp)
	if ok {
		logger.Infof("%s done sending response to %s", s.Conn().LocalPeer().String(), s.Conn().RemotePeer().String())
	}
}

// json response handler
func (e *JsonProtocol) onJsonResponse(s network.Stream) {
	resp := &pb.JsonResponse{}
	buf, err := ioutil.ReadAll(s)
	if err != nil {
		s.Reset()
		logger.Error(err)
		return
	}
	s.Close()

	// unmarshal it
	proto.Unmarshal(buf, resp)
	if err != nil {
		logger.Error(err)
		return
	}

	// authenticate message content
	valid := e.node.authenticateMessage(resp, resp.MessageData)

	if !valid {
		logger.Errorf("Failed to authenticate message")
		return
	}

	// locate request data and remove it if found
	_, ok := e.requests[resp.MessageData.Id]
	if ok {
		// remove request from map as we have processed it here
		delete(e.requests, resp.MessageData.Id)
	} else {
		logger.Errorf("Failed to locate request data object for response")
		return
	}

	logger.Infof("%s Received json response from %s. Message id:%s. resp: %+v", s.Conn().LocalPeer(), s.Conn().RemotePeer(), resp.MessageData.Id, resp.ResponseData)

	e.JsonResponseCh <- resp
}

//return (req.MessageData.Id, error)
func (e *JsonProtocol) SendJsonAPITo(peerId peer.ID, jsonData *pb.JsonData) (string, error) {
	logger.Infof("%s sending json request to %s", e.node.ID(), peerId)

	// create message data
	req := &pb.JsonRequest{
		MessageData:      e.node.NewMessageData(commontools.GetUlid().String(), false),
		JsonData:         jsonData,
	}

	signature, err := e.node.signProtoMessage(req)
	if err != nil {
		logger.Errorf("failed to sign message")
		return "", err
	}

	// add the signature to the message
	req.MessageData.Sign = signature

	ok := e.node.sendProtoMessage(peerId, jsonRequestProtocolName, req)
	if !ok {
		return "", commontools.Errorf(nil, "e.node.sendProtoMessage failed")
	}

	// store request so response handler has access to it
	e.requests[req.MessageData.Id] = req
	logger.Infof("%s Done sending request to %s. req.MessageData.Id: %s", e.node.ID(), peerId, req.MessageData.Id)
	return req.MessageData.Id, nil
}
