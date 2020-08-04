package libp2pnode

import (
	commontools "github.com/Guer-co/hackfs-mdc/backend/pkg/common"
	pb "github.com/Guer-co/hackfs-mdc/backend/pkg/libp2pnode/pb"
	"github.com/Guer-co/hackfs-mdc/backend/pkg/textilehelper"
	"github.com/gogo/protobuf/proto"
	"github.com/libp2p/go-libp2p-core/network"
	"github.com/libp2p/go-libp2p-core/peer"
	"github.com/textileio/go-threads/db"
	"io/ioutil"
	"net/http"
)

// pattern: /protocol-name/request-or-response-message/version
const downloadRequestProtocolName = "/hackfspay3/downloadrequest/0.0.1"
const downloadResponseProtocolName = "/hackfspay3/downloadresponse/0.0.1"

type DownloadProtocol struct {
	node     *Node                          // local host
	requests map[string]*pb.DownloadRequest   // used to access request data from response handlers
	DownloadResponseCh chan *pb.DownloadResponse      // channel for outputting response
}

func NewDownloadProtocol(node *Node) *DownloadProtocol {
	e := DownloadProtocol{node: node, requests: make(map[string]*pb.DownloadRequest), DownloadResponseCh: make(chan *pb.DownloadResponse)}
	node.SetStreamHandler(downloadRequestProtocolName, e.onDownloadRequest)
	node.SetStreamHandler(downloadResponseProtocolName, e.onDownloadResponse)

	// design note: to implement fire-and-forget style messages you may just skip specifying a response callback.
	// a fire-and-forget message will just include a request and not specify a response object
	return &e
}

func (e *DownloadProtocol) getDownloadResponseWithError(req *pb.DownloadRequest, code int32, err error) *pb.DownloadResponse {
	return &pb.DownloadResponse{
		MessageData:          e.node.NewMessageData(req.MessageData.Id, false),
		ResponseData:         &pb.ResponseData{
			Code:                 code,
			Err:                  err.Error(),
		},
		ContentData:          &pb.ContentData{},
		ContentDeliveryData:  &pb.ContentDeliveryData{},
	}
}

func GetContentDataRecordWithDownloadData(data *pb.DownloadData) (*pb.ContentData, error) {
	dummy := &pb.ContentData{}
	var res interface{}
	var err error

	if len(data.BucketKey) > 0 {
		q := db.Where("bucketKey").Eq(data.BucketKey)
		res, err = textilehelper.QueryContentDB(q, dummy)
	} else if len(data.PreviewUrl) > 0 {
		q := db.Where("previewUrl").Eq(data.PreviewUrl)
		res, err = textilehelper.QueryContentDB(q, dummy)
	}

	if err != nil {
		return nil, err
	}
	if res == nil {
		return nil, commontools.Errorf(nil, "res is nil")
	}
	datas, ok := res.([]*pb.ContentData)
	if !ok {
		return nil, commontools.Errorf(nil, "res is not []*pb.ContentData")
	}
	if len(datas) == 0 {
		return nil, commontools.Errorf(nil, "no ContentData found")
	}

	//TODO: sort, identify the correct data to return if there is more than one
	return datas[0], nil
}

func (e *DownloadProtocol) processDownloadRequest(req *pb.DownloadRequest) *pb.DownloadResponse {
	receivedAt := commontools.GetTimeStampMillisecond()

	//Look up ContentData from Thread
	contentData, err := GetContentDataRecordWithDownloadData(req.DownloadData)
	if err != nil {
		return e.getDownloadResponseWithError(req, http.StatusInternalServerError, commontools.Errorf(err, "e.GetContentDataRecordWithDownloadData failed"))
	}

	//TODO: check smart contract for access control

	//Pull bucket to bytes
	bytes, err := textilehelper.PullBytesFromBucket(contentData.BucketKey, contentData.FileName)
	if err != nil {
		return e.getDownloadResponseWithError(req, http.StatusInternalServerError, commontools.Errorf(err, "textilehelper.PullBytesFromBucket failed"))
	}
	if int64(len(bytes)) < contentData.FileSize {
		return e.getDownloadResponseWithError(req, http.StatusInternalServerError, commontools.Errorf(err, "bytes size %v not matching the expected size %v in contentData record", len(bytes), contentData.FileSize))
	}

	//TODO: save a record in DB

	//all done, return a success response
	return &pb.DownloadResponse{
		MessageData:          e.node.NewMessageData(req.MessageData.Id, false),
		ResponseData:         &pb.ResponseData{
			Code:                 http.StatusOK,
			Err:                  "",
		},
		ContentData:          contentData,
		ContentDeliveryData:  &pb.ContentDeliveryData{
			Id:                   commontools.GetUlid().String(),
			RequesterId:          req.DownloadData.RequesterId,
			FileBytes:            bytes,
			ReceivedAt:           receivedAt,
			UpdatedAt:            commontools.GetTimeStampMillisecond(),
		},
	}
}

// remote peer requests handler
func (e *DownloadProtocol) onDownloadRequest(s network.Stream) {
	// get request data
	req := &pb.DownloadRequest{}
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
	logger.Infof("%s Received download request from %s: %+v", s.Conn().LocalPeer(), s.Conn().RemotePeer(), req)

	//authenticateMessage
	valid := e.node.authenticateMessage(req, req.MessageData)
	if !valid {
		logger.Errorf("Failed to authenticate message")
		return
	}

	// process request with textile
	resp := e.processDownloadRequest(req)

	// sign the data
	signature, err := e.node.signProtoMessage(resp)
	if err != nil {
		logger.Errorf("failed to sign response")
		return
	}
	// add the signature to the message
	resp.MessageData.Sign = signature

	// send the response
	ok := e.node.sendProtoMessage(s.Conn().RemotePeer(), downloadResponseProtocolName, resp)
	if ok {
		logger.Infof("%s done sending response to %s", s.Conn().LocalPeer().String(), s.Conn().RemotePeer().String())
	}
}

// download response handler
func (e *DownloadProtocol) onDownloadResponse(s network.Stream) {
	resp := &pb.DownloadResponse{}
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

	logger.Infof("%s Received download response from %s. Message id:%s. resp: %+v", s.Conn().LocalPeer(), s.Conn().RemotePeer(), resp.MessageData.Id, resp.ResponseData)

	e.DownloadResponseCh <- resp
}

//return (req.MessageData.Id, error)
func (e *DownloadProtocol) DownloadFrom(peerId peer.ID, downloadData *pb.DownloadData) (string, error) {
	logger.Infof("%s sending download request to %s", e.node.ID(), peerId)

	// create message data
	req := &pb.DownloadRequest{
		MessageData:          e.node.NewMessageData(commontools.GetUlid().String(), false),
		DownloadData:         downloadData,
	}

	signature, err := e.node.signProtoMessage(req)
	if err != nil {
		logger.Errorf("failed to sign message")
		return "", err
	}

	// add the signature to the message
	req.MessageData.Sign = signature

	ok := e.node.sendProtoMessage(peerId, downloadRequestProtocolName, req)
	if !ok {
		return "", commontools.Errorf(nil, "e.node.sendProtoMessage failed")
	}

	// store request so response handler has access to it
	e.requests[req.MessageData.Id] = req
	logger.Infof("%s Done sending request to %s. req.MessageData.Id: %s", e.node.ID(), peerId, req.MessageData.Id)
	return req.MessageData.Id, nil
}
