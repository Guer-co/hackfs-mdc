package main

import (
	"context"
	commontools "github.com/Guer-co/hackfs-mdc/backend/pkg/common"
	"github.com/Guer-co/hackfs-mdc/backend/pkg/libp2pnode"
	pb "github.com/Guer-co/hackfs-mdc/backend/pkg/libp2pnode/pb"
	"github.com/libp2p/go-libp2p-core/host"
	discovery "github.com/libp2p/go-libp2p-discovery"
	"io/ioutil"
	"path/filepath"
)

func runClientModeWith(ctx context.Context, routingDiscovery *discovery.RoutingDiscovery, host host.Host, node *libp2pnode.Node) {
	logger.Info("Running in client mode")
	// Now, look for others who have announced
	// This is like your friend telling you the location to meet you.
	logger.Info("Searching for server node with rend: ", config.RendezvousString)
	peerChan, err := routingDiscovery.FindPeers(ctx, config.RendezvousString)
	if err != nil {
		panic(err)
	}

	//N.B. if one kill server node and start it again with the same rend, its old ID will be found as a peer here, and connection will fail
	for p := range peerChan {
		if p.ID == host.ID() {
			continue
		}
		logger.Info("Server node found:", p)

		//test upload
		if len(config.TestFilePath) > 0 {
			logger.Infof("Testing upload with test file: %+v", config.TestFilePath)
			fileBytes, err := ioutil.ReadFile(config.TestFilePath)
			if err != nil {
				logger.Errorf("ioutil.ReadFile failed: %+v", err)
				continue
			}
			uploadData := pb.UploadData{
				OwnerId:              "testowner01",
				FileName:             filepath.Base(config.TestFilePath),
				FileType:             "image",
				FileSize:             int64(len(fileBytes)),
				Description:          "test01",
				FileBytes:            fileBytes,
				GeneratePreview:      true,
				PreviewBytes:         nil,
			}
			msgId, err := node.UploadTo(p.ID, &uploadData)
			if err != nil {
				logger.Error(commontools.Errorf(err, "node.UploadTo failed"))
			} else {
				logger.Infof("msgId: %+v", msgId)
			}
		}
	}

	logger.Info("Searching server node with routingDiscovery ended")
}
