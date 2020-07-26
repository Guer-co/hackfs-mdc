package videopreview_test

import (
	"testing"

	. "github.com/onsi/ginkgo"
	. "github.com/onsi/gomega"
)

func TestVideopreview(t *testing.T) {
	RegisterFailHandler(Fail)
	RunSpecs(t, "Videopreview Suite")
}
