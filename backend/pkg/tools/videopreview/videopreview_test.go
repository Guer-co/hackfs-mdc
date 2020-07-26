package videopreview_test

import (
	commontools "github.com/Guer-co/hackfs-mdc/backend/pkg/common"
	. "github.com/Guer-co/hackfs-mdc/backend/pkg/tools/videopreview"
	. "github.com/onsi/ginkgo"
	. "github.com/onsi/gomega"
	"io/ioutil"
	"os"
)

var logger = commontools.Logger

var _ = Describe("Videopreview", func() {
	commontools.SetupLogger()
	XDescribe("GetGifFromBytes", func() {
		It("Should generate gif correctly", func() {
			logger.Info("loading test video file")
			fileBytes, err := ioutil.ReadFile("../samplemedia/testVideo01.mov")
			Expect(err).To(BeNil())
			outputBytes, err := GetGifFromBytes(fileBytes, "testVideo01.mov")
			Expect(err).To(BeNil())
			Expect(outputBytes).ShouldNot(BeNil())
			Expect(len(outputBytes)).Should(BeNumerically(">", 0))
			f, err := os.Create("testVideo01.gif")
			Expect(err).To(BeNil())
			defer f.Close()
			_, err = f.Write(outputBytes)
			Expect(err).To(BeNil())
		})
	})
})
