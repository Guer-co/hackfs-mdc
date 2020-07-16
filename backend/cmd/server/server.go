package main

import (
	"context"
	"github.com/ipfs/go-log"
	"github.com/libp2p/go-libp2p"
	"github.com/libp2p/go-libp2p-core/peer"
	discovery "github.com/libp2p/go-libp2p-discovery"
	dht "github.com/libp2p/go-libp2p-kad-dht"
	multiaddr "github.com/multiformats/go-multiaddr"
	"io/ioutil"
	"sync"
)

var logger = log.Logger("server")

func main() {
	log.SetAllLoggers(log.LevelWarn)
	_ = log.SetLogLevel("server", "info")

	//read config from args
	config, err := ParseFlags()
	if err != nil {
		panic(err)
	}

	ctx := context.Background()

	// libp2p.New constructs a new libp2p Host. Other options can be added
	// here.
	host, err := libp2p.New(ctx,
		libp2p.ListenAddrs([]multiaddr.Multiaddr(config.ListenAddresses)...),
	)
	if err != nil {
		panic(err)
	}
	logger.Info("host.ID: ", host.ID())
	logger.Info("host.Addrs: ", host.Addrs())

	//TODO: pass ctx to node, close the node upon ctx.Done()
	//create new server node
	node := NewNode(host)

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
	logger.Info("Announcing ourselves...")
	routingDiscovery := discovery.NewRoutingDiscovery(kademliaDHT)
	discovery.Advertise(ctx, routingDiscovery, config.RendezvousString)
	logger.Debug("Successfully announced!")

	// Now, look for others who have announced
	// This is like your friend telling you the location to meet you.
	logger.Info("Searching for other peers with rend: ", config.RendezvousString)
	peerChan, err := routingDiscovery.FindPeers(ctx, config.RendezvousString)
	if err != nil {
		panic(err)
	}

	for p := range peerChan {
		if p.ID == host.ID() {
			continue
		}
		logger.Info("Found peer:", p)

		//test upload
		if len(config.TestFilePath) > 0 {
			fileBytes, err := ioutil.ReadFile(config.TestFilePath)
			if err != nil {
				logger.Errorf("ioutil.ReadFile failed: %+v", err)
				continue
			}
			//N.B. if one kill this server and start again quickly, its old ID will be found as a peer here, and connection will fail
			node.UploadTo(p.ID, fileBytes)
		}
	}

	logger.Info("routingDiscovery ended")

	select {}
}