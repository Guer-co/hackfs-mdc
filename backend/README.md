For now, this is just a simple libp2p based server node,
which accept a libp2p UploadRequest protocol for pushing file into Textile Bucket securely.

Install protoc
https://github.com/protocolbuffers/protobuf/releases/tag/v3.12.3

ENV
```
export TEXTILE_HUB_USER_KEY=XXX
export TEXTILE_HUB_USER_SECRET=XXX
export TEXTILE_DB_THREAD_ID=XXX
export TEXTILE_TEST_DB_THREAD_ID=XXX
```

Start the server node
```
cd cmd/server
go generate
go build
./server
2020-07-20T08:12:15.268-0700	INFO	server	server/server.go:37	host.ID: QmeJ4nc8NZSiJhAM4gPA6chzdhjMFzhC51j5WLz5XA5pJn
...
2020-07-20T07:14:25.268-0700	INFO	common	server/server.go:80	Announcing this server node with rendezvous string: pay3-rendezvous-01EDC2XSADF7CRB5AJ6SCNWHCG
```

On another terminal, start the proxy client with the "rend" value shown above i.e. pay3-rendezvous-01EDC2XSADF7CRB5AJ6SCNWHCG
It would take a few sec to discovery the server node, then starting the httpproxy.
```
cd ../proxyclient
go build
./proxyclient -rend [rend output from server]
...
2020-07-22T08:13:39.977-0700	INFO	common	proxyclient/proxyclient.go:78	Searching for server node with rend: pay3-rendezvous-01EDVHC0XY5G0JKEVM8C79N95Q
2020-07-22T08:13:46.893-0700	INFO	common	proxyclient/proxyclient.go:90	serverAddrInfo: {QmcnVnqUQpbjWGbnm2LUEeFFQLiCeywysWm3rLMa2k4DNZ: [/ip4/127.0.0.1/tcp/60327 /ip4/192.168.86.193/tcp/60327 /ip6/::1/tcp/60328 /ip6/fe80::4088:f00d:bb5:5545/tcp/60328 /ip4/99.102.91.69/tcp/60327]}, p: {QmcnVnqUQpbjWGbnm2LUEeFFQLiCeywysWm3rLMa2k4DNZ: [/ip4/127.0.0.1/tcp/60327 /ip4/192.168.86.193/tcp/60327 /ip6/::1/tcp/60328 /ip6/fe80::4088:f00d:bb5:5545/tcp/60328 /ip4/99.102.91.69/tcp/60327]}
start go server
2020-07-22T08:13:46.893-0700	INFO	common	httpproxy/httpproxy.go:115	httpproxy running at :8888
```

Upload test
On another terminal
```
	curl -X POST http://localhost:8888/api/ipfs \
	  -F "file=@../../pkg/textilehelper/test01.png" \
	  -H "Content-Type: multipart/form-data"
```
