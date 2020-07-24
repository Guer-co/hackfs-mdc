package imagepreview_test

import (
	. "github.com/Guer-co/hackfs-mdc/backend/pkg/tools/imagepreview"
	. "github.com/onsi/ginkgo"
	. "github.com/onsi/gomega"
	"io/ioutil"
)

var _ = Describe("Imagepreview", func() {
	Describe("GetThumbnailFromBytes", func() {
		It("Should generate thumbnail correctly", func() {
			fileBytes, err := ioutil.ReadFile("../../textilehelper/test01.png")
			Expect(err).To(BeNil())
			outputBytes, err := GetThumbnailFromBytes(fileBytes)
			Expect(err).To(BeNil())
			Expect(len(outputBytes)).Should(BeNumerically("<", len(fileBytes)))
			//f, err := os.Create("test01.jpg")
			//Expect(err).To(BeNil())
			//_, err = f.Write(outputBytes)
			//Expect(err).To(BeNil())
			//f.Close()
		})
	})
})
