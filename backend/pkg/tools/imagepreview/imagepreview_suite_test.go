package imagepreview_test

import (
	"testing"

	. "github.com/onsi/ginkgo"
	. "github.com/onsi/gomega"
)

func TestImagepreview(t *testing.T) {
	RegisterFailHandler(Fail)
	RunSpecs(t, "Imagepreview Suite")
}
