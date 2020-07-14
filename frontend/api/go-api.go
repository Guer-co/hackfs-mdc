package main

import (
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"github.com/gin-gonic/gin"
	shell "github.com/ipfs/go-ipfs-api"
	"net/http"
	"os"
)

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

func main() {

	fmt.Println("start go server")

	gin.SetMode(gin.ReleaseMode)
	router := gin.Default()

	router.GET("/api/ping", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"message": "pong",
		})
	})

	router.POST("/api/encrypt", func(c *gin.Context) {
	})

	router.POST("/api/decrypt", func(c *gin.Context) {
	})

	router.POST("/api/ipfs", func(c *gin.Context) {
		fmt.Println("goipfs")
		file, header, err := c.Request.FormFile("file")
		fmt.Println(header)
		sh := shell.NewShell("https://ipfs.infura.io:5001")
		cid, err := sh.Add(file)
		if err != nil {
			fmt.Fprintf(os.Stderr, "error: %s", err)
			os.Exit(1)
		}
		c.JSON(http.StatusOK, cid)
	})

	router.Run(":8888")
}
