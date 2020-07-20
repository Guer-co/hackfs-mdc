package main

import (
	"flag"
	"strings"

	"github.com/Guer-co/hackfs-mdc/backend/pkg/common"
	dht "github.com/libp2p/go-libp2p-kad-dht"
	maddr "github.com/multiformats/go-multiaddr"
)

// A new type we need for writing a custom flag parser
type addrList []maddr.Multiaddr

func (al *addrList) String() string {
	strs := make([]string, len(*al))
	for i, addr := range *al {
		strs[i] = addr.String()
	}
	return strings.Join(strs, ",")
}

func (al *addrList) Set(value string) error {
	addr, err := maddr.NewMultiaddr(value)
	if err != nil {
		return err
	}
	*al = append(*al, addr)
	return nil
}

func StringsToAddrs(addrStrings []string) (maddrs []maddr.Multiaddr, err error) {
	for _, addrString := range addrStrings {
		addr, err := maddr.NewMultiaddr(addrString)
		if err != nil {
			return maddrs, err
		}
		maddrs = append(maddrs, addr)
	}
	return
}

type Config struct {
	RendezvousString string
	BootstrapPeers   addrList
	ListenAddresses  addrList
	TestFilePath string
	IsClientMode bool
}

func ParseFlags() Config {
	cfg := Config{}
	randomStr := common.GetUlid().String()
	defaultRendezvous := "pay3-rendezvous-" + randomStr
	flag.StringVar(&cfg.RendezvousString, "rend", defaultRendezvous,
		"Unique string to identify group of nodes. Share this with client nodes")
	flag.Var(&cfg.BootstrapPeers, "peer", "Adds a peer multiaddress to the bootstrap list")
	flag.Var(&cfg.ListenAddresses, "listen", "Adds a multiaddress to the listen list")
	flag.StringVar(&cfg.TestFilePath, "testfile", "",
		"a test file to be uploaded")
	flag.BoolVar(&cfg.IsClientMode, "client", false, "true to enable client mode")
	flag.Parse()
	if len(cfg.BootstrapPeers) == 0 {
		cfg.BootstrapPeers = dht.DefaultBootstrapPeers
	}

	if cfg.IsClientMode && len(cfg.TestFilePath) == 0 {
		logger.Fatalf("Please specify a test file with -testfile with client mode")
	}

	return cfg
}
