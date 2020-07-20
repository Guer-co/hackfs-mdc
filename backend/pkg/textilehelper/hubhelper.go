package textilehelper

import (
	"github.com/Guer-co/hackfs-mdc/backend/pkg/common"
	"os/exec"
)

var logger = common.Logger

func RunHubCommand(parameter string, workingDir string) ([]byte, error) {
	exePath, _ := exec.LookPath( "hub" )
	c := &exec.Cmd {
		Path: exePath,
		Args: []string{ exePath, parameter },
		Dir: workingDir,
	}
	return c.Output()
}

func HubWhoAmI() {
	outputBytes, err := RunHubCommand("whoami", "")
	logger.Infof("HubWhoAmI: %s", outputBytes)
	if err != nil {
		logger.Error(err)
	}
}