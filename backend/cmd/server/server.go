package main

import (
	"context"
	"github.com/Guer-co/hackfs-mdc/backend/pkg/common"
	"github.com/Guer-co/hackfs-mdc/backend/pkg/libp2pnode"
	"github.com/Guer-co/hackfs-mdc/backend/pkg/textilehelper"
	"github.com/libp2p/go-libp2p"
	"github.com/libp2p/go-libp2p-core/peer"
	discovery "github.com/libp2p/go-libp2p-discovery"
	dht "github.com/libp2p/go-libp2p-kad-dht"
	multiaddr "github.com/multiformats/go-multiaddr"
	"sync"
)

//go:generate protoc ../../pkg/libp2pnode/pb/p2p.proto -I../../pkg/libp2pnode/. --gofast_out=../../pkg/libp2pnode/.

var logger = common.Logger
var config Config

func main() {
	common.SetupLogger()
	ctx := context.Background()
	textilehelper.Setup(ctx)

	//read config from args
	config = ParseFlags()

	// libp2p.New constructs a new libp2p Host. Other options can be added here.
	host, err := libp2p.New(ctx,
		libp2p.ListenAddrs([]multiaddr.Multiaddr(config.ListenAddresses)...),
	)
	if err != nil {
		panic(err)
	}
	logger.Info("host.ID: ", host.ID())
	logger.Info("host.Addrs: ", host.Addrs())

	//TODO: pass ctx to node, close the node upon ctx.Done()
	//create new node
	node := libp2pnode.NewNode(host)

	// Start a DHT, for use in peer discovery. We can't just make a new DHT
	// client because we want each peer to maintain its own local copy of the
	// DHT, so that the bootstrapping node of the DHT can go down without
	// inhibiting future peer discovery.
	kademliaDHT, err := dht.New(ctx, host)
	if err != nil {
		panic(err)
	}

	// Bootstrap the DHT. In the default configuration, this spawns a Background
	// thread that will refresh the peer table every five minutes.
	logger.Debug("Bootstrapping the DHT")
	if err = kademliaDHT.Bootstrap(ctx); err != nil {
		panic(err)
	}

	// Let's connect to the bootstrap nodes first. They will tell us about the
	// other nodes in the network.
	var wg sync.WaitGroup
	for _, peerAddr := range config.BootstrapPeers {
		peerinfo, _ := peer.AddrInfoFromP2pAddr(peerAddr)
		wg.Add(1)
		go func() {
			defer wg.Done()
			if err := host.Connect(ctx, *peerinfo); err != nil {
				logger.Errorf("host.Connect failed: %+v", err)
			} else {
				logger.Info("Connection established with bootstrap node:", *peerinfo)
			}
		}()
	}
	wg.Wait()

	// We use a rendezvous point "meet me here" to announce our location.
	// This is like telling your friends to meet you at the Eiffel Tower.
	routingDiscovery := discovery.NewRoutingDiscovery(kademliaDHT)

	if config.IsClientMode {
		go runClientModeWith(ctx, routingDiscovery, host, node)
	} else {
		logger.Infof("Announcing this server node with rendezvous string: %+v", config.RendezvousString)
		discovery.Advertise(ctx, routingDiscovery, config.RendezvousString)
	}

	select {}
}