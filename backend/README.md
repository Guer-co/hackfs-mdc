For now, this is just a simple libp2p based server node,
which accept a libp2p UploadRequest protocol for pushing file into Textile Bucket securely.

ENV
```
export TEXTILE_HUB_USER_KEY=XXX
export TEXTILE_HUB_USER_SECRET=XXX
export TEXTILE_DB_THREAD_ID=XXX
export TEXTILE_TEST_DB_THREAD_ID=XXX
```

Build
```
cd cmd/server
go generate
go build
```

Start the server node
```
./server
2020-07-20T08:12:15.268-0700	INFO	server	server/server.go:37	host.ID: QmeJ4nc8NZSiJhAM4gPA6chzdhjMFzhC51j5WLz5XA5pJn
2020-07-20T08:12:15.269-0700	INFO	server	server/server.go:38	host.Addrs: [/ip4/127.0.0.1/tcp/62451 /ip6/::1/tcp/62452 /ip6/fe80::f1cb:8f59:5bee:341b/tcp/62452]
...
2020-07-20T07:14:25.268-0700	INFO	common	server/server.go:80	Announcing this server node with rendezvous string: pay3-rendezvous-01EDC2XSADF7CRB5AJ6SCNWHCG
```

On another terminal, start a test client with the "rend" value shown above i.e. pay3-rendezvous-01EDC2XSADF7CRB5AJ6SCNWHCG, and the following flags
```
./server -client true -testfile ../../pkg/textilehelper/test01.png -rend [rend output from server]
...
2020-07-20T07:14:59.986-0700	INFO	common	server/clientmode.go:17	Searching for server node with rend: pay3-rendezvous-01EDP96QGG965N0GK95MV7PQ7Q
2020-07-20T07:15:13.819-0700	INFO	common	server/clientmode.go:28	Server node found:{QmWDL75BnA36frp2WzYTCqvwcj7PgQrqB8dekRUs9o7JHq: [/ip6/fe80::aede:48ff:fe00:1122/tcp/61222 /ip4/99.102.91.69/tcp/61221 /ip4/127.0.0.1/tcp/61221 /ip6/::1/tcp/61222]}
2020-07-20T07:15:13.819-0700	INFO	common	server/clientmode.go:32	Testing upload with test file: /Users/sing.yiu/Downloads/test01.png
2020-07-20T07:15:16.130-0700	INFO	common	server/upload.go:204	QmY8Xwo9VGpjwfov2apN4YiSqbBUT64Sxmu1vUBjq2V5FE Received upload response from QmWDL75BnA36frp2WzYTCqvwcj7PgQrqB8dekRUs9o7JHq. Message id:01EDP98852WHGZWTEF14R7C1WM. resp: messageData:<clientVersion:"pay3-server-node/0.0.1" timestamp:1595254516 id:"01EDP98852WHGZWTEF14R7C1WM" nodeId:"QmWDL75BnA36frp2WzYTCqvwcj7PgQrqB8dekRUs9o7JHq" nodePubKey:"34\244&\234\32522cf@g\2672;)%\224j$e\327\236i\341\023}\265\0136\203\206\330\016\261\210X\373UG\002\250\205\014_`^\273m\007\034%cC\017+J\255&\254f\017\317^\240\372MEG\343h\033\t>\302\006x\360\212\305;j\023\352\224T};\204\200\224\354\330\205\341\321\273`\272\276\365\027k\335\307\002\003\001\000\001" sign:"h\3216\327\347V\211\336\212P\020j\372\243\021v|\222\377IWq\344*\326\375\204\374\271\304\3057|i\254\246@\372\275\352l\2646\360\244\214\353>0?\334\023\321\217M\344\034;@\207\342r*\325\351\355\341q\251d\031\245!OM9tG\367\276M%j\211pE\303\36234\357\002\340\3716\314ai\232\303\331\r<\0275\"\242\330z\030\002\312\n\257ONNMz\322I\316\370\261\233\337\311\031X8\221\\\206\373\230\354KPO\251<\2435\254\227\261\364V\300{\201\034p\001\013\312\225\202\3750\032v\212\3662\324\354\3278\366\002\341\207\252\004\215+sm\342\243\213\357@\035%\213\340\026\225\201F\010" > 
responseData:<code:200 > contentData:<id:"01edp98adnvvphw0y4tsq8xrx6" ownerId:"testowner01" fileName:"test01.png" fileType:"image" fileSize:500269 description:"test01" threadKey:"bafkqyvemctry6u5zbmzdmws5ubgwnnmitniribu7xe2qudfvhaqffka" bucketKey:"bafzbeiaswjfdvicdsuzd2y7nd6g4wqrvwn73hahn4fsdzfflbvnwpmlijy" 
encryptedUrl:"https://hub.textile.io/ipns/bafzbeiaswjfdvicdsuzd2y7nd6g4wqrvwn73hahn4fsdzfflbvnwpmlijy" 
previewUrl:"https://hub.textile.io/ipns/bafzbeiaoadamxhid3fedqumcpnkevhxfc7ulm4ddqwoxb6ydqysd6fcxwi/test01.png" receivedAt:1595254513841 updatedAt:1595254516125 >
```
It would take a few sec to discovery the server node,
then upload the test file,
and get a response from the server node with IPNS link to the encrypted content and preview.
(For now, the preview is simply a duplicated copy of the uploaded content in plain)
