package common

import (
	"github.com/kelseyhightower/envconfig"
)

// LoadConfig load defaults and the environment into the config variable
// FatalOnError
func LoadConfig(prefix string, ptrToConfigVariable interface{}) {
	err := envconfig.Process(prefix, ptrToConfigVariable)
	FatalOnError(err, "envconfig.Process failed")
}
