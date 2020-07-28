## Backend
A libp2p based micro-service node, which provide service for storing, encrypting and decrypting contents.

### Install protoc
https://github.com/protocolbuffers/protobuf/releases/tag/v3.12.3

### Install ffmpeg
https://ffmpeg.org/download.html

### ENV
```
export TEXTILE_HUB_USER_KEY=XXX
export TEXTILE_HUB_USER_SECRET=XXX
export TEXTILE_DB_THREAD_ID=XXX
export TEXTILE_TEST_DB_THREAD_ID=XXX
```

### Start the server node
```
cd cmd/server
go generate
go build
./server
2020-07-20T08:12:15.268-0700	INFO	server	server/server.go:37	host.ID: QmeJ4nc8NZSiJhAM4gPA6chzdhjMFzhC51j5WLz5XA5pJn
...
2020-07-20T07:14:25.268-0700	INFO	common	server/server.go:80	Announcing this server node with rendezvous string: pay3-rendezvous-01EDC2XSADF7CRB5AJ6SCNWHCG
```

### Start the proxy client
* On another terminal, start the proxy client with the "rend" value shown above i.e. pay3-rendezvous-01EDC2XSADF7CRB5AJ6SCNWHCG
* It would take a few sec to discovery the server node, then starting the httpproxy.
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

### Upload test
```
curl -X POST http://localhost:8888/api/ipfs \
    -F "file=@../../pkg/textilehelper/test01.png" \
    -H "Content-Type: multipart/form-data"
```
```
curl -X POST http://localhost:8888/api/ipfs \
    -F "file=@../../pkg/tools/samplemedia/testVideo01.mov" \
    -H "Content-Type: multipart/form-data"
```
```
curl -X POST http://localhost:8888/api/upload \
    -F "file=@/Users/sing.yiu/Playground/hackfs/hackfs-mdc/backend/pkg/textilehelper/test01.png" \
    -F "ownerId=testowner02" \
    -F "description=testdescription02" \
    -H "Content-Type: multipart/form-data"

return
{"ownerId":"testowner02","fileName":"test01.png","fileType":"image","fileSize":500269,"description":"testdescription02","threadKey":"bafkqyvemctry6u5zbmzdmws5ubgwnnmitniribu7xe2qudfvhaqffka","bucketKey":"bafzbeihebjpoa6cj7j4nuqidgjxdatqep5f54nfta3oq543ij26y7i453u","encryptedUrl":"https://hub.textile.io/ipns/bafzbeihebjpoa6cj7j4nuqidgjxdatqep5f54nfta3oq543ij26y7i453u","previewUrl":"https://hub.textile.io/ipns/bafzbeics7vq3bg4tufogmczwtzsdb5cfvbxc3lz7ismpom3bqpagnslpry/thumbnail.jpg","receivedAt":1595814840773,"updatedAt":1595814843631}
```

### Download test
```
curl -X POST http://localhost:8888/api/download/testrequester01/bafzbeibbpbqs6oizlyg7dh7tkjxmlldp3l2xdg5yghbtw4ehxl2xiwkyba
```
```
Using bucketKey 
curl -i -k -H "Content-Type: application/json" -d '{"requesterId":"testRequester01", "type":"download", "jsonInput":"{\"requesterId\":\"testRequester01\", \"bucketKey\":\"bafzbeibbpbqs6oizlyg7dh7tkjxmlldp3l2xdg5yghbtw4ehxl2xiwkyba\"}"}' http://localhost:8888/api/json

Using previewUrl
curl -i -k -H "Content-Type: application/json" -d '{"requesterId":"testRequester01", "type":"download", "jsonInput":"{\"requesterId\":\"testRequester01\", \"previewUrl\":\"https:\/\/hub.textile.io\/ipns\/bafzbeics7vq3bg4tufogmczwtzsdb5cfvbxc3lz7ismpom3bqpagnslpry\/thumbnail.jpg\"}"}' http://localhost:8888/api/json

return
{"messageData":{"clientVersion":"pay3-server-node/0.0.1","timestamp":1595816668,"id":"01EE71BTQ9VPZF36XBHT7E6F9S","nodeId":"QmR4adopEs97RKS737SCaT6jfCaPExbAN2ohE7nzhyLyLu","nodePubKey":"CAASpgIwggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQC51cbCBoEhvZt61FmlGgWcbS7A3jPJuWRY0RZN8UKDkn79vkSubywbZQ4QUh9ivsKiIV82UE5p8qsJ7dtEFN1Jde+u3PtEeLhwLb5iwqumUO80Kjg6bkWsGG2v1vyAGu3VqqVNTmQ/JQ7xQ6yhcIXleFM61+wXHJMa9p5EA0dh9SAjILBHnlZIQqzsRDjLqWdaDwYiP96DltiGNtj3RhxTuHgUCHSJF5FI4x9dQMpAewqsdwhZC461g8RGMqUpopLDhflyZWLfzmLQ5XP6Xcl9EiwsB2kG8Dn/XBLeq1qDZlM6A8XVKL8MRGT8oybUOcNHkhnfkFwLExe3cC6AQeZzAgMBAAE=","sign":"KNq/vGDvNgChD5aGJZ7X0PYNaczrNhb79PdK7IdzO3AbFNo8feol7m8O/qxIknK0ChDeILqLZjNo3yvglYpy3d5H3wqa3/CT2NLFKJLlhArj8BCgxRYOQnlkBdDGMlvFfIyQI46wUBpJGtfBEp4u4ij/JJB86Xlw+scDmMzZXpRpRJWmAMGAF+mdqETLmVvqezaN8+jx40TbjsWfW0612BBow/GJ5xcrwdifs7H2yAz9wbDb2cZ0zSiLFDYVj3JYKoPbnnN07IUEQJdsffAER+2VXCRNwelC3/ibgAocc+mgxJimpbLeuoPYTC/DdP/lsvv5R2Cb16+/LOhZNln1gg=="},"responseData":{"code":200},"jsonData":{"requesterId":"testRequester01","type":"download","jsonOutput":"\"...\"","receivedAt":1595816667883,"updatedAt":1595816668276}}
```

### Database API
* JSON query: i.e. query all ContentData records with field "ownerId" equals "testowner02"
* N.B. the field "jsonInput" where the query parameters go into, is an escaped Json String !
```
curl -i -k -H "Content-Type: application/json" -d '{"requesterId":"testRequester01", "type":"query", "jsonInput":"{\"collection\":\"ContentData\", \"fieldPath\":\"ownerId\", \"operation\":\"Eq\", \"value\":\"testowner01\"}"}' http://localhost:8888/api/json

return
{"messageData":{"clientVersion":"pay3-server-node/0.0.1","timestamp":1595816336,"id":"01EE711Q5KJGJ2BB58SER22WJ0","nodeId":"QmR4adopEs97RKS737SCaT6jfCaPExbAN2ohE7nzhyLyLu","nodePubKey":"CAASpgIwggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQC51cbCBoEhvZt61FmlGgWcbS7A3jPJuWRY0RZN8UKDkn79vkSubywbZQ4QUh9ivsKiIV82UE5p8qsJ7dtEFN1Jde+u3PtEeLhwLb5iwqumUO80Kjg6bkWsGG2v1vyAGu3VqqVNTmQ/JQ7xQ6yhcIXleFM61+wXHJMa9p5EA0dh9SAjILBHnlZIQqzsRDjLqWdaDwYiP96DltiGNtj3RhxTuHgUCHSJF5FI4x9dQMpAewqsdwhZC461g8RGMqUpopLDhflyZWLfzmLQ5XP6Xcl9EiwsB2kG8Dn/XBLeq1qDZlM6A8XVKL8MRGT8oybUOcNHkhnfkFwLExe3cC6AQeZzAgMBAAE=","sign":"M1ZvcQDIM50Iooh2ulnaeciR3Z2yQ1PnyXW4Tr2xw6wcN8RF1g0i7keRHakVm36WYnfNvm1nPDeyckYCOXRdbB3WBxQc8JUoj4I2/v01Z9BgwXrXK+Nk1E1rY7Gc/yzP3iSZPv4QGgRKAUIiBtQcp2w+lEcXUoSQCtV449swpJbo1mw1jwU5dplKtlt+eoDMmAHke4V1U4ZKrUzkCZMl0YU7BmHSlR/eC+EMPKrxdrJrZwhX6eg4FraMFLHJ03t3w5jLAv5E13PYPi+TvJ7JW+Yw7Un/zgV/kjHRlWnpAss+KM0zx9798YjXt/S8ZYWZAAPfPnsr28a+0FGqvRl3Fg=="},"responseData":{"code":200},"jsonData":{"requesterId":"testRequester01","type":"query","jsonOutput":"[{\"ownerId\":\"testowner01\",\"fileName\":\"test01.png\",\"fileType\":\"image\",\"fileSize\":500269,\"description\":\"test01\",\"threadKey\":\"bafkqyvemctry6u5zbmzdmws5ubgwnnmitniribu7xe2qudfvhaqffka\",\"bucketKey\":\"bafzbeig57kazgtszsil3vjk64ccgmtf34hqu43yqzdzzgqu45dy3edi3bu\",\"encryptedUrl\":\"https://hub.textile.io/ipns/bafzbeig57kazgtszsil3vjk64ccgmtf34hqu43yqzdzzgqu45dy3edi3bu\",\"previewUrl\":\"https://hub.textile.io/ipns/bafzbeidfjtnkf6dp472oxixfsdxksyivrysulmlomgfyq5gqumuuvxj5ui/test01.png\",\"receivedAt\":1595254379594,\"updatedAt\":1595254383095},...]","receivedAt":1595816336565,"updatedAt":1595816336728}}
```
