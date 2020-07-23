package textilehelper_test

import (
	"context"
	"github.com/Guer-co/hackfs-mdc/backend/pkg/common"
	"github.com/Guer-co/hackfs-mdc/backend/pkg/models"
	"github.com/Guer-co/hackfs-mdc/backend/pkg/textilehelper"
	. "github.com/onsi/ginkgo"
	. "github.com/onsi/gomega"
	"github.com/textileio/go-threads/db"
	"io/ioutil"
)

var logger = common.Logger

var _ = Describe("Textilehelper", func() {
	common.SetupLogger()
	textilehelper.Setup(context.Background())
	textilehelper.SetupTesting() //changing clients.DBThreadId to testDBThreadId

	testContentData := models.ContentData{
		OwnerId:      "testowner01",
		FileName:     "test01.png",
		FileType:     "image",
		FileSize:     500,
		Description:  "test image",
		ThreadKey:    "bafktw6svx7iwwtrzcnyzdmuc3yfzbvmdgg6td7cezp7cp7bye4hmzkq",
		BucketKey:    "bafzbeiay356ciqdgtkpkzc66b2pswn6arohbzrpztewj3q3bne77macne4",
		EncryptedUrl: "https://hub.textile.io/ipns/bafzbeiay356ciqdgtkpkzc66b2pswn6arohbzrpztewj3q3bne77macne4",
		PreviewUrl:   "https://hub.textile.io/ipns/bafzbeiay356ciqdgtkpkzc66b2pswn6arohbzrpztewj3q3bne77macne4",
		ReceivedAt:   1595137568000,
		UpdatedAt:    1595137568200,
	}

	XDescribe("CreateThreadDB", func () {
		//Expect error if the thread name already exist
		It("Should create DB correctly", func() {
			dbThreadId, err := textilehelper.CreateThreadDB("pay3DB")
			Expect(err).To(BeNil())
			logger.Infof("dbThreadId: %+v", dbThreadId)
		})
	})
	Describe("InsertToContentDB", func() {
		It("Should insert instance correctly", func() {
			instanceId, err := textilehelper.InsertToContentDB(&testContentData)
			Expect(err).To(BeNil())
			Expect(instanceId).NotTo(BeNil())
			logger.Infof("instanceId: %+v", instanceId)
		})
	})
	Describe("QueryContentDB", func() {
		It("Should return instances from query correctly", func() {
			q := db.Where("ownerId").Eq(testContentData.OwnerId)
			dummy := &models.ContentData{}
			res, err := textilehelper.QueryContentDB(q, dummy)
			Expect(err).To(BeNil())
			Expect(res).NotTo(BeNil())
			datas, ok := res.([]*models.ContentData)
			Expect(ok).To(BeTrue())
			Expect(len(datas)).Should(BeNumerically(">", 0))
			logger.Infof("len %d, data0: %+v", len(datas), datas[0])
		})
	})
	Describe("CreateBucketAndPushData", func() {
		It("Should return the bucket ipns link correctly", func() {
			threadKey, bucketKey, ipnsLink, err := textilehelper.CreateBucketAndPushData(common.GetUlid().String(), "test01.txt", []byte("testData01"), true)
			Expect(err).To(BeNil())
			Expect(len(threadKey)).Should(BeNumerically(">", 0))
			Expect(len(bucketKey)).Should(BeNumerically(">", 0))
			Expect(len(ipnsLink)).Should(BeNumerically(">", 0))
			logger.Infof("threadKey: %v, bucketKey: %v, ipnsLink: %v", threadKey, bucketKey, ipnsLink)
		})
		It("Should push the test file correctly", func() {
			fileBytes, err := ioutil.ReadFile("./test01.png")
			Expect(err).To(BeNil())
			threadKey, bucketKey, ipnsLink, err := textilehelper.CreateBucketAndPushData(common.GetUlid().String(), "test01.png", fileBytes, true)
			Expect(err).To(BeNil())
			Expect(len(threadKey)).Should(BeNumerically(">", 0))
			Expect(len(bucketKey)).Should(BeNumerically(">", 0))
			Expect(len(ipnsLink)).Should(BeNumerically(">", 0))
			logger.Infof("threadKey: %v, bucketKey: %v, ipnsLink: %v", threadKey, bucketKey, ipnsLink)
		})
	})
	Describe("PullBytesFromBucket", func() {
		It("Should return the bucket file in bytes correctly", func() {
			fileBytes, err := ioutil.ReadFile("./test01.png")
			Expect(err).To(BeNil())
			_, bucketKey, _, err := textilehelper.CreateBucketAndPushData(common.GetUlid().String(), "test01.png", fileBytes, true)
			Expect(err).To(BeNil())
			bytes, err := textilehelper.PullBytesFromBucket(bucketKey, "test01.png")
			Expect(err).To(BeNil())
			Expect(len(bytes)).To(Equal(500269))
		})
	})
	/*
	Describe("CreateIdentity", func() {
		It("Should create id correctly", func() {
			id, err := textilehelper.CreateIdentity()
			//logger.Infof("id: %+v", id)
			Expect(err).To(BeNil())
			Expect(id).NotTo(BeNil())
		})
	})
	Describe("Authenticate", func() {
		It("Should return ctx correctly", func() {
			ctx := context.Background()
			ctx01, err := textilehelper.Authenticate(ctx, config.UserKey, config.UserSecret)
			Expect(err).To(BeNil())
			Expect(ctx01).NotTo(BeNil())
		})
	})
	Describe("AuthorizeUser", func() {
		It("Should return ctx correctly", func() {
			ctx02, err := textilehelper.AuthorizeUser(testCtx, testId)
			Expect(err).To(BeNil())
			Expect(ctx02).NotTo(BeNil())
		})
	})
	Describe("CreateThreadDB and CreateBucket and PushFileToBucket", func() {
		It("Should work correctly", func() {
			threadId, err := textilehelper.CreateThreadDB(testCtx, "testthread01")
			Expect(err).To(BeNil())
			logger.Infof("threadId: %+v", threadId)
			Expect(len(threadId)).Should(BeNumerically(">", 0))

			bucketKey, err := textilehelper.CreateBucket(testCtx, threadId, "testbucket01", false)
			Expect(err).To(BeNil())
			logger.Infof("bucketKey: %+v", bucketKey)
			Expect(len(bucketKey)).Should(BeNumerically(">", 0))

			err = textilehelper.PushFileToBucket()
			Expect(err).To(BeNil())
		})
	})
	 */
})
