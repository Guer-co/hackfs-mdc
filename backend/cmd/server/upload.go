package main

import (
	"fmt"
	"io/ioutil"
	"log"

	pb "github.com/Guer-co/hackfs-mdc/backend/cmd/server/pb"
	"github.com/gogo/protobuf/proto"
	uuid "github.com/google/uuid"
	"github.com/libp2p/go-libp2p-core/network"
	"github.com/libp2p/go-libp2p-core/peer"
)

// pattern: /protocol-name/request-or-response-message/version
const uploadRequestProtocolName = "/hackfspay3/uploadrequest/0.0.1"
const uploadResponseProtocolName = "/hackfspay3/uploadresponse/0.0.1"

type UploadProtocol struct {
	node     *Node                          // local host
	requests map[string]*pb.UploadRequest   // used to access request data from response handlers
}

func NewUploadProtocol(node *Node) *UploadProtocol {
	e := UploadProtocol{node: node, requests: make(map[string]*pb.UploadRequest)}
	node.SetStreamHandler(uploadRequestProtocolName, e.onUploadRequest)
	node.SetStreamHandler(uploadResponseProtocolName, e.onUploadResponse)

	// design note: to implement fire-and-forget style messages you may just skip specifying a response callback.
	// a fire-and-forget message will just include a request and not specify a response object
	return &e
}

// remote peer requests handler
func (e *UploadProtocol) onUploadRequest(s network.Stream) {

	// get request data
	data := &pb.UploadRequest{}
	buf, err := ioutil.ReadAll(s)
	if err != nil {
		s.Reset()
		log.Println(err)
		return
	}
	s.Close()

	// unmarshal it
	proto.Unmarshal(buf, data)
	if err != nil {
		log.Println(err)
		return
	}

	log.Printf("%s: Received upload request from %s. Msg: %s", s.Conn().LocalPeer(), s.Conn().RemotePeer(), data.Msg)

	valid := e.node.authenticateMessage(data, data.MessageData)

	if !valid {
		log.Println("Failed to authenticate message")
		return
	}

	log.Printf("%s: Sending response to %s. Message id: %s...", s.Conn().LocalPeer(), s.Conn().RemotePeer(), data.MessageData.Id)

	//TODO: response with upload result
	resp := &pb.UploadResponse{
		MessageData: e.node.NewMessageData(data.MessageData.Id, false),
		Msg: fmt.Sprintf("File size received: %v", len(data.FileBytes)),
		Code: 200}

	// sign the data
	signature, err := e.node.signProtoMessage(resp)
	if err != nil {
		log.Println("failed to sign response")
		return
	}

	// add the signature to the message
	resp.MessageData.Sign = signature

	ok := e.node.sendProtoMessage(s.Conn().RemotePeer(), uploadResponseProtocolName, resp)

	if ok {
		log.Printf("%s: done sending response to %s sent.", s.Conn().LocalPeer().String(), s.Conn().RemotePeer().String())
	}
}

// upload response handler
func (e *UploadProtocol) onUploadResponse(s network.Stream) {

	data := &pb.UploadResponse{}
	buf, err := ioutil.ReadAll(s)
	if err != nil {
		s.Reset()
		log.Println(err)
		return
	}
	s.Close()

	// unmarshal it
	proto.Unmarshal(buf, data)
	if err != nil {
		log.Println(err)
		return
	}

	// authenticate message content
	valid := e.node.authenticateMessage(data, data.MessageData)

	if !valid {
		log.Println("Failed to authenticate message")
		return
	}

	// locate request data and remove it if found
	_, ok := e.requests[data.MessageData.Id]
	if ok {
		// remove request from map as we have processed it here
		delete(e.requests, data.MessageData.Id)
	} else {
		log.Println("Failed to locate request data object for response")
		return
	}

	log.Printf("%s: Received upload response from %s. Message id:%s. Msg: %s.", s.Conn().LocalPeer(), s.Conn().RemotePeer(), data.MessageData.Id, data.Msg)
}

func (e *UploadProtocol) UploadTo(peerId peer.ID, fileBytes []byte) bool {
	log.Printf("%s: Sending upload request to: %s....", e.node.ID(), peerId)

	// create message data
	req := &pb.UploadRequest{
		MessageData: e.node.NewMessageData(uuid.New().String(), false),
		Msg:     fmt.Sprintf("Upload request from %s", e.node.ID()),
		FileBytes: fileBytes,
	}

	signature, err := e.node.signProtoMessage(req)
	if err != nil {
		log.Println("failed to sign message")
		return false
	}

	// add the signature to the message
	req.MessageData.Sign = signature

	ok := e.node.sendProtoMessage(peerId, uploadRequestProtocolName, req)

	if !ok {
		return false
	}

	// store request so response handler has access to it
	e.requests[req.MessageData.Id] = req
	log.Printf("%s: Done sending request to: %s. Message Id: %s, Message: %s", e.node.ID(), peerId, req.MessageData.Id, req.Msg)
	return true
}
