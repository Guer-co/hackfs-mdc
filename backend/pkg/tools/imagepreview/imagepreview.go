package imagepreview

import (
	"bytes"
	commontools "github.com/Guer-co/hackfs-mdc/backend/pkg/common"
	"github.com/disintegration/imaging"
	"image"
	"image/jpeg"
)

const (
	THUMBNAIL_DEFAULT_WIDTH = 256
)

func GetThumbnailFromBytes(inputBytes []byte) ([]byte, error) {
	img, _, err := image.Decode(bytes.NewReader(inputBytes))
	if err != nil {
		return nil, commontools.Errorf(err, "image.Decode failed")
	}
	thumbnailImg := imaging.Resize(img, THUMBNAIL_DEFAULT_WIDTH, 0, imaging.Lanczos)

	buf := new(bytes.Buffer)
	err = jpeg.Encode(buf, thumbnailImg, nil)
	if err != nil {
		return nil, commontools.Errorf(err, "jpeg.Encode failed")
	}
	return buf.Bytes(), nil
}