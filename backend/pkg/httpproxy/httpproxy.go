package httpproxy

import (
	"bytes"
	"fmt"
	commontools "github.com/Guer-co/hackfs-mdc/backend/pkg/common"
	"github.com/Guer-co/hackfs-mdc/backend/pkg/libp2pnode"
	pb "github.com/Guer-co/hackfs-mdc/backend/pkg/libp2pnode/pb"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/libp2p/go-libp2p-core/peer"
	"github.com/zRedShift/mimemagic"
	"io/ioutil"
	"net/http"
)

var logger = commontools.Logger

func Run(node *libp2pnode.Node, serverAddrInfo *peer.AddrInfo) {
	fmt.Println("start go server")

	/*
	cacheDir, err := ioutil.TempDir("", "cacheDir")
	if err != nil {
		logger.Fatalf("ioutil.TempDir failed: %+v", err)
	}
	defer os.RemoveAll(cacheDir) // clean up
	*/

	gin.SetMode(gin.ReleaseMode)
	router := gin.Default()
	router.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:3000"},
		AllowMethods:     []string{"PUT", "PATCH", "GET", "POST", "OPTIONS"},
		AllowHeaders:     []string{"Origin"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		AllowOriginFunc: func(origin string) bool {
			return origin == "http://localhost:3000"
		},
		//MaxAge: 12 * time.Hour,
	}))

	router.GET("/api/ping", func(c *gin.Context) {
		fmt.Println("ping hit")
		c.JSON(200, gin.H{
			"message": "pong",
		})
	})

	/*
	curl -X POST http://localhost:8888/api/ipfs \
	  -F "file=@/Users/sing.yiu/Playground/hackfs/hackfs-mdc/backend/pkg/textilehelper/test01.png" \
	  -H "Content-Type: multipart/form-data"
	 */
	router.POST("/api/ipfs", func(c *gin.Context) {
		logger.Infof("processing POST /api/ipfs")
		file, header, err := c.Request.FormFile("file")
		logger.Infof("Filename: %+v, Size: %+v", header.Filename, header.Size)

		fileBytes, err := ioutil.ReadAll(file)
		if err != nil {
			logger.Errorf("ioutil.ReadAll failed: %+v", err)
			c.JSON(http.StatusInternalServerError, err)
			return
		}
		logger.Infof("len(fileBytes): %+v", len(fileBytes))

		uploadData := pb.UploadData{
			OwnerId:              "testowner01",
			FileName:             header.Filename,
			FileType:             "",
			FileSize:             int64(len(fileBytes)),
			Description:          "test01",
			FileBytes:            fileBytes,
			GeneratePreview:      true,
			PreviewBytes:         nil,
		}
		msgId, err := node.UploadTo(serverAddrInfo.ID, &uploadData)
		if err != nil {
			logger.Error(commontools.Errorf(err, "node.UploadTo failed"))
			c.JSON(http.StatusInternalServerError, err)
			return
		}

		logger.Infof("msgId: %+v, waiting for response", msgId)
		resp := <-node.UploadResponseCh
		for ; resp.MessageData.Id != msgId; resp = <-node.UploadResponseCh {
		}
		logger.Infof("received response: %+v", resp)

		if resp.ResponseData.Code != http.StatusOK {
			c.JSON(int(resp.ResponseData.Code), resp.ResponseData.Err)
			return
		}
		c.JSON(int(resp.ResponseData.Code), resp.ContentData.PreviewUrl)
		return
	})

	/*
		curl -X POST http://localhost:8888/api/upload \
		  -F "file=@/Users/sing.yiu/Playground/hackfs/hackfs-mdc/backend/pkg/textilehelper/test01.png" \
		  -F "ownerId=testowner02" \
		  -F "description=testdescription02" \
		  -H "Content-Type: multipart/form-data"
	*/
	router.POST("/api/upload", func(c *gin.Context) {
		logger.Infof("processing POST /api/upload")
		file, header, err := c.Request.FormFile("file")
		logger.Infof("Filename: %+v, Size: %+v", header.Filename, header.Size)

		fileBytes, err := ioutil.ReadAll(file)
		if err != nil {
			logger.Errorf("ioutil.ReadAll failed: %+v", err)
			c.JSON(http.StatusInternalServerError, err)
			return
		}
		logger.Infof("len(fileBytes): %+v", len(fileBytes))

		ownerId := c.DefaultPostForm("ownerId", "testowner01")
		description := c.DefaultPostForm("description", "test description 01")

		uploadData := pb.UploadData{
			OwnerId:              ownerId,
			FileName:             header.Filename,
			FileType:             "",
			FileSize:             int64(len(fileBytes)),
			Description:          description,
			FileBytes:            fileBytes,
			GeneratePreview:      true,
			PreviewBytes:         nil,
		}
		msgId, err := node.UploadTo(serverAddrInfo.ID, &uploadData)
		if err != nil {
			logger.Error(commontools.Errorf(err, "node.UploadTo failed"))
			c.JSON(http.StatusInternalServerError, err)
			return
		}

		logger.Infof("msgId: %+v, waiting for response", msgId)
		resp := <-node.UploadResponseCh
		for ; resp.MessageData.Id != msgId; resp = <-node.UploadResponseCh {
		}
		logger.Infof("received response: %+v", resp)

		if resp.ResponseData.Code != http.StatusOK {
			c.JSON(int(resp.ResponseData.Code), resp.ResponseData.Err)
			return
		}
		c.JSON(int(resp.ResponseData.Code), resp.ContentData)
		return
	})

	/*
	curl -X GET http://localhost:8888/api/download/testrequester01/bafzbeibbpbqs6oizlyg7dh7tkjxmlldp3l2xdg5yghbtw4ehxl2xiwkyba
	http://localhost:8888/api/download/testrequester01/bafzbeibbpbqs6oizlyg7dh7tkjxmlldp3l2xdg5yghbtw4ehxl2xiwkyba

	*/
	router.GET("/api/download/:requesterid/:bucketkey", func(c *gin.Context) {
		requesterId := c.Param("requesterid")
		bucketKey := c.Param("bucketkey")
		logger.Infof("processing POST requesterId: %+v, bucketKey: %+v", requesterId, bucketKey)

		if len(requesterId) == 0 || len(bucketKey) == 0 {
			err := commontools.Errorf(nil, "invalid input")
			logger.Errorf("%+v", err)
			c.JSON(http.StatusInternalServerError, err)
			return
		}

		downloadData := pb.DownloadData{
			RequesterId:          requesterId,
			BucketKey:            bucketKey,
			PreviewUrl:           "",
			CreatedAt:            commontools.GetTimeStampMillisecond(),
		}
		msgId, err := node.DownloadFrom(serverAddrInfo.ID, &downloadData)
		if err != nil {
			logger.Error(commontools.Errorf(err, "node.DownloadFrom failed"))
			c.JSON(http.StatusInternalServerError, err)
			return
		}

		logger.Infof("msgId: %+v, waiting for response", msgId)
		resp := <-node.DownloadResponseCh
		for ; resp.MessageData.Id != msgId; resp = <-node.DownloadResponseCh {
		}
		logger.Infof("received response: %+v", resp.ResponseData)

		if resp.ResponseData.Code != http.StatusOK {
			c.JSON(int(resp.ResponseData.Code), resp.ResponseData.Err)
			return
		}

		//c.JSON(int(resp.ResponseData.Code), resp)
		contentLength := resp.ContentData.FileSize
		mimeType := mimemagic.Match(resp.ContentDeliveryData.FileBytes, resp.ContentData.FileName, -1)
		contentType := mimeType.MediaType()
		reader := bytes.NewReader(resp.ContentDeliveryData.FileBytes)
		extraHeaders := map[string]string{
			//"Content-Disposition": `attachment; filename="` + resp.ContentData.FileName + `"`,
			"Content-Disposition": `inline`,
		}
		c.DataFromReader(http.StatusOK, contentLength, contentType, reader, extraHeaders)

		return
	})

	/*
	Query
	curl -i -k -H "Content-Type: application/json" -d '{"requesterId":"testRequester01", "type":"query", "jsonInput":"{\"collection\":\"ContentData\", \"fieldPath\":\"ownerId\", \"operation\":\"Eq\", \"value\":\"testowner01\"}"}' http://localhost:8888/api/json
	Download
	curl -i -k -H "Content-Type: application/json" -d '{"requesterId":"testRequester01", "type":"download", "jsonInput":"{\"requesterId\":\"testRequester01\", \"bucketKey\":\"bafzbeibbpbqs6oizlyg7dh7tkjxmlldp3l2xdg5yghbtw4ehxl2xiwkyba\"}"}' http://localhost:8888/api/json
	curl -i -k -H "Content-Type: application/json" -d '{"requesterId":"testRequester01", "type":"download", "jsonInput":"{\"requesterId\":\"testRequester01\", \"previewUrl\":\"https:\/\/hub.textile.io\/ipns\/bafzbeics7vq3bg4tufogmczwtzsdb5cfvbxc3lz7ismpom3bqpagnslpry\/thumbnail.jpg\"}"}' http://localhost:8888/api/json
	*/
	router.POST("/api/json", func(c *gin.Context) {
		var jsonData pb.JsonData
		if err := c.ShouldBindJSON(&jsonData); err != nil {
			err = commontools.Errorf(err, "c.ShouldBindJSON failed")
			logger.Error(err)
			c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
			return
		}

		logger.Infof("jsonData: %+v", jsonData.Type)
		if jsonData.Type == "upload2" {
			_, header, err := c.Request.FormFile("file")
			if err != nil {
				logger.Error(err)
			}
			logger.Infof("Filename: %+v, Size: %+v", header.Filename, header.Size)
			return
		}

		msgId, err := node.SendJsonAPITo(serverAddrInfo.ID, &jsonData)
		if err != nil {
			err = commontools.Errorf(err, "node.SendJsonAPITo failed")
			logger.Error(err)
			c.JSON(http.StatusInternalServerError, err)
			return
		}

		logger.Infof("msgId: %+v, waiting for response", msgId)
		resp := <-node.JsonResponseCh
		for ; resp.MessageData.Id != msgId; resp = <-node.JsonResponseCh {
		}
		logger.Infof("received response: %+v", resp.ResponseData)

		if resp.ResponseData.Code != http.StatusOK {
			c.JSON(int(resp.ResponseData.Code), resp.ResponseData.Err)
			return
		}
		c.JSON(int(resp.ResponseData.Code), resp)
		return
	})

	logger.Infof("httpproxy running at :8888")
	router.Run(":8888")
}

