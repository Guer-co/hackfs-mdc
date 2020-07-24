package libp2pnode_test

import (
	"testing"

	. "github.com/onsi/ginkgo"
	. "github.com/onsi/gomega"
)

func TestLibp2pnode(t *testing.T) {
	RegisterFailHandler(Fail)
	RunSpecs(t, "Libp2pnode Suite")
}
