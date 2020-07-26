package videopreview

import (
	commontools "github.com/Guer-co/hackfs-mdc/backend/pkg/common"
	"github.com/singyiu/goffmpeg/transcoder"
	"io/ioutil"
	"os"
	"path/filepath"
	"sync"
)

var logger = commontools.Logger

func GetGifFromBytes(inputBytes []byte, fileName string) ([]byte, error) {
	logger.Infof("len(inputBytes): %v", len(inputBytes))
	trans := new(transcoder.Transcoder)
	err := trans.InitializeEmptyTranscoder()
	if err != nil {
		return nil, commontools.Errorf(err, "trans.InitializeEmptyTranscoder failed")
	}

	dir, err := ioutil.TempDir("", "videopreview")
	if err != nil {
		return nil, commontools.Errorf(err, "ioutil.TempDir failed")
	}
	defer os.RemoveAll(dir) // clean up
	tmpFileName := filepath.Join(dir, fileName)
	err = ioutil.WriteFile(tmpFileName, inputBytes, 0644)
	if err != nil {
		return nil, commontools.Errorf(err, "ioutil.WriteFile failed")
	}

	err = trans.SetInputPath(tmpFileName)
	if err != nil {
		return nil, commontools.Errorf(err, "trans.SetInputPath failed")
	}

	/*
	w, err := trans.CreateInputPipe()
	if err != nil {
		return nil, commontools.Errorf(err, "trans.CreateInputPipe failed")
	}
	 */
	r, err := trans.CreateOutputPipe("gif")
	if err != nil {
		return nil, commontools.Errorf(err, "trans.CreateOutputPipe failed")
	}

	wg := &sync.WaitGroup{}
	wg.Add(1)
	var data []byte
	go func() {
		defer r.Close()
		defer wg.Done()

		// Read data from output pipe
		//logger.Info("reading the output")
		data, err = ioutil.ReadAll(r)
		if err != nil {
			logger.Errorf("ioutil.ReadAll failed: %+v", err)
		}
	}()

	/*
	go func() {
		defer w.Close()
		logger.Infof("writing into the input pipe")
		_, err = w.Write(inputBytes)
		if err != nil {
			logger.Errorf("w.Write failed: %+v", err)
		}
	}()
	*/

	//trans.ExtraCommandOptions = []string{"-analyzeduration 10m", "-probesize 10M"}
	trans.MediaFile().SetDurationInput("3")
	trans.MediaFile().SetFrameRate(10)
	trans.MediaFile().SetFilter("scale=w=512:h=-1")

	//logger.Info("going to run ffmpeg")
	// Start transcoder process without checking progress
	done := trans.Run(true)

	progress := trans.Output()
	//printing transcoding progress
	for msg := range progress {
		logger.Info(msg)
	}

	logger.Info("waiting for ffmpeg to be done")
	// This channel is used to wait for the transcoding process to end
	err = <-done
	if err != nil {
		return nil, commontools.Errorf(err, "trans.Run failed")
	}

	wg.Wait()

	return data, nil
}
