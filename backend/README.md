For now, this is just a simple libp2p based server node.

Build
```
cd cmd/server
go generate
go build
```

Start the server node
```
./server
2020-07-16T08:12:15.268-0700	INFO	server	server/server.go:37	host.ID: QmeJ4nc8NZSiJhAM4gPA6chzdhjMFzhC51j5WLz5XA5pJn
2020-07-16T08:12:15.269-0700	INFO	server	server/server.go:38	host.Addrs: [/ip4/127.0.0.1/tcp/62451 /ip6/::1/tcp/62452 /ip6/fe80::f1cb:8f59:5bee:341b/tcp/62452]
...
2020-07-16T08:12:16.272-0700	INFO	server	server/server.go:86	Searching for other peers with rend: pay3-rendezvous-01EDC2XSADF7CRB5AJ6SCNWHCG
```

On another terminal, start a test client with the "rend" shown on the terminal i.e. pay3-rendezvous-01EDC2XSADF7CRB5AJ6SCNWHCG, and a test file to upload
```
./server -rend [rend output from server] -testfile upload.go
...
2020-07-16T08:13:03.095-0700	INFO	server	server/server.go:96	Found peer:{QmeJ4nc8NZSiJhAM4gPA6chzdhjMFzhC51j5WLz5XA5pJn: [/ip6/fe80::f1cb:8f59:5bee:341b/tcp/62452 /ip4/99.102.91.69/tcp/62451 /ip4/127.0.0.1/tcp/62451 /ip6/::1/tcp/62452]}
2020/07/16 08:13:03 QmTtEaWEKicVSNdg8cNVaSkD2MJxYBzq8DJGYTiw3bNEMx: Sending upload request to: QmeJ4nc8NZSiJhAM4gPA6chzdhjMFzhC51j5WLz5XA5pJn....
2020/07/16 08:13:03 QmTtEaWEKicVSNdg8cNVaSkD2MJxYBzq8DJGYTiw3bNEMx: Done sending request to: QmeJ4nc8NZSiJhAM4gPA6chzdhjMFzhC51j5WLz5XA5pJn. Message Id: 961731e9-9686-4ef9-93fd-b6c1d23da936, Message: Upload request from QmTtEaWEKicVSNdg8cNVaSkD2MJxYBzq8DJGYTiw3bNEMx
2020/07/16 08:13:03 QmTtEaWEKicVSNdg8cNVaSkD2MJxYBzq8DJGYTiw3bNEMx: Received upload response from QmeJ4nc8NZSiJhAM4gPA6chzdhjMFzhC51j5WLz5XA5pJn. Message id:961731e9-9686-4ef9-93fd-b6c1d23da936. Msg: File size received: 4321.
```
It would take a few sec to discovery the server node,
then upload the test file,
and get a response from the server node about the file size received.