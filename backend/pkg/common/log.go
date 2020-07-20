package common

import (
	"github.com/ipfs/go-log"
)

var Logger = log.Logger("common")

func SetupLogger() {
	log.SetAllLoggers(log.LevelWarn)
	_ = log.SetLogLevel("common", "info")
}