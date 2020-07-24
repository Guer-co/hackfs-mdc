package libp2pnode_test

import (
	"context"
	commontools "github.com/Guer-co/hackfs-mdc/backend/pkg/common"
	. "github.com/Guer-co/hackfs-mdc/backend/pkg/libp2pnode"
	pb "github.com/Guer-co/hackfs-mdc/backend/pkg/libp2pnode/pb"
	"github.com/Guer-co/hackfs-mdc/backend/pkg/textilehelper"
	. "github.com/onsi/ginkgo"
	. "github.com/onsi/gomega"
	"io/ioutil"
)

var logger = commontools.Logger

var _ = Describe("Libp2pnode", func() {
	commontools.SetupLogger()
	textilehelper.Setup(context.Background())
	textilehelper.SetupTesting() //changing clients.DBThreadId to testDBThreadId

	fileBytes, _ := ioutil.ReadFile("../textilehelper/test01.png")
	testUploadData := &pb.UploadData{
		OwnerId:              "testowner01",
		FileName:             "test01.png",
		FileType:             "",
		FileSize:             500269,
		Description:          "test image",
		FileBytes:            fileBytes,
		GeneratePreview:      true,
		PreviewBytes:         nil,
	}

	Describe("GetPreviewFrom", func() {
		It("Should generate the image preview correctly", func() {
			previewUrl, fileType, err := GetPreviewFrom(testUploadData)
			Expect(err).To(BeNil())
			Expect(previewUrl).NotTo(BeNil())
			Expect(fileType).To(Equal("image"))
			Expect(len(previewUrl)).Should(BeNumerically(">", 0))
			logger.Infof("previewUrl: %+v", previewUrl)
		})
	})
})
