# S.I.M.P.L.E.

Logos here???

[![Build Status](https://travis-ci.org/joemccann/dillinger.svg?branch=master)](https://travis-ci.org/joemccann/dillinger)

S.I.M.P.L.E. is :  **S**ervices for **I**nformation and **M**edia **P**ayments, **L**egitimacy and **E**ncryption
## PAYWALL
-- Smart-contract system that lives apart from a) digital identity b) access management, and facilitates frictionless end-user experience when subscribing/consuming/paying for published content. We imagine three models 1) pay-as-you-go/budgeted spend 2) recurring subscription 3) Subsidized access
## SERVER-SIDE ENCRYPTION
-- Building a decentralized, serverless protocol to facilitate server-side encryption/decryption prior to storing on IPFS / Filecoin. Likely leveraging EVM or Ethereum-pinned Layer 2 for virtualization along with either Intel SGX / OpenEnclave for remote, trustless keygen + distribution.
## CONTENT AUTHENTICATION
-- Guarantee provenance and authenticity of delivered content using Hash-based Message Authentication Codes (HMAC) and/or a Zero-knowledge Scheme

## Built with
* [Truffle](https://www.google.com)
* [Solidity](https://www.google.com)
* [IPFS](https://www.google.com)
* [FileCoin](https://www.google.com)
* [Textile](https://www.google.com)
* [React](https://www.google.com)


### Getting started for dev

* **clone the repo:** git clone https://github.com/Guer-co/hackfs-mdc.git
* **open the dir:** cd /whateverdirectoryyoucloneditin

(Backend)
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
cd backend/cmd/server
go generate
go build
./server
...
2020-07-20T07:14:25.268-0700	INFO	common	server/server.go:80	Announcing this server node with rendezvous string: pay3-rendezvous-01EDC2XSADF7CRB5AJ6SCNWHCG
```

On another terminal, start the proxy client with the "rend" value shown from the server terminal i.e. pay3-rendezvous-01EDC2XSADF7CRB5AJ6SCNWHCG
It would take a few sec to discovery the server node
```
cd ../proxyclient
go build
./proxyclient -rend [rend output from server]
...
2020-07-22T08:13:46.893-0700	INFO	common	httpproxy/httpproxy.go:115	httpproxy running at :8888
```

Upload test
On another terminal
```
curl -X POST http://localhost:8888/api/ipfs \
	  -F "file=@../../pkg/textilehelper/test01.png" \
	  -H "Content-Type: multipart/form-data"
```

Download test
On another terminal
```
curl -X POST http://localhost:8888/api/download/testrequester01/bafzbeibbpbqs6oizlyg7dh7tkjxmlldp3l2xdg5yghbtw4ehxl2xiwkyba
```


(Blockchain)
* **install Truffle:** npm install -g truffle
* **install Ganache (local ethereum blockchain):** [https://www.trufflesuite.com/ganache](https://www.trufflesuite.com/ganache) and run it
* **BUILD:** truffle build --network development --reset    (I like doing reset each time)

(Frontend)
* //once you are in the directory
* cd frontend
* npm i
* npm run dev

(Other)
* ??????
