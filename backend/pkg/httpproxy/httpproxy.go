package httpproxy

import (
	//"crypto/sha256"
	//"encoding/hex"
	//shell "github.com/ipfs/go-ipfs-api"
	"fmt"
	commontools "github.com/Guer-co/hackfs-mdc/backend/pkg/common"
	"github.com/Guer-co/hackfs-mdc/backend/pkg/libp2pnode"
	pb "github.com/Guer-co/hackfs-mdc/backend/pkg/libp2pnode/pb"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/libp2p/go-libp2p-core/peer"
	"io/ioutil"
	"net/http"
)

var logger = commontools.Logger

/*
type smtpServer struct {
	host string
	port string
}

func (s *smtpServer) Address() string {
	return s.host + ":" + s.port
}

func createHash(key string) string {
	hasher := sha256.New()
	hasher.Write([]byte(key))
	return hex.EncodeToString(hasher.Sum(nil))
}
*/

func Run(node *libp2pnode.Node, serverAddrInfo *peer.AddrInfo) {

	fmt.Println("start go server")

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
		}
		logger.Infof("len(fileBytes): %+v", len(fileBytes))

		uploadData := pb.UploadData{
			OwnerId:              "testowner01",
			FileName:             header.Filename,
			FileType:             "image",
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
		} else {
			logger.Infof("msgId: %+v, waiting for response", msgId)
			//c.JSON(http.StatusOK, cid)

			//TODO check if msgId match
			resp := <-node.UploadResponseCh
			logger.Infof("received response: %+v", resp)

			if resp.ResponseData.Code != http.StatusOK {
				c.JSON(int(resp.ResponseData.Code), resp.ResponseData.Err)
			} else {
				c.JSON(int(resp.ResponseData.Code), resp.ContentData.PreviewUrl)
			}
		}
	})

	/*
	curl -X POST http://localhost:8888/api/download/testrequester01/bafzbeibbpbqs6oizlyg7dh7tkjxmlldp3l2xdg5yghbtw4ehxl2xiwkyba

	*/
	router.POST("/api/download/:requesterid/:bucketkey", func(c *gin.Context) {
		requesterId := c.Param("requesterid")
		bucketKey := c.Param("bucketkey")
		logger.Infof("processing POST requesterId: %+v, bucketKey: %+v", requesterId, bucketKey)

		if len(requesterId) == 0 || len(bucketKey) == 0 {
			err := commontools.Errorf(nil, "invalid input")
			logger.Errorf("%+v", err)
			c.JSON(http.StatusInternalServerError, err)
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
		} else {
			logger.Infof("msgId: %+v, waiting for response", msgId)

			//TODO check if msgId match
			resp := <-node.DownloadResponseCh
			logger.Infof("received response: %+v", resp.ResponseData)

			if resp.ResponseData.Code != http.StatusOK {
				c.JSON(int(resp.ResponseData.Code), resp.ResponseData.Err)
			} else {
				c.JSON(int(resp.ResponseData.Code), resp)
			}
		}
	})

	router.POST("/api/encrypt", func(c *gin.Context) {
	})

	router.POST("/api/decrypt", func(c *gin.Context) {
	})

	logger.Infof("httpproxy running at :8888")
	router.Run(":8888")
}

