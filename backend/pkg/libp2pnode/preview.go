package libp2pnode

import (
	"fmt"
	commontools "github.com/Guer-co/hackfs-mdc/backend/pkg/common"
	pb "github.com/Guer-co/hackfs-mdc/backend/pkg/libp2pnode/pb"
	"github.com/Guer-co/hackfs-mdc/backend/pkg/textilehelper"
	"github.com/Guer-co/hackfs-mdc/backend/pkg/tools/imagepreview"
	"github.com/Guer-co/hackfs-mdc/backend/pkg/tools/videopreview"
	"github.com/zRedShift/mimemagic"
)

func GeneratePreviewFrom(bucketName string, bucketFileName string, fileBytes []byte) (string, error) {
	_, _, previewUrl, err := textilehelper.CreateBucketAndPushData(bucketName, bucketFileName, fileBytes, false)
	if err != nil {
		return "", commontools.Errorf(err, "textilehelper.CreateBucketAndPushData failed")
	}
	return previewUrl + "/" + bucketFileName, nil
}

func GenerateFakePreviewFrom(data *pb.UploadData) (string, string, error) {
	url, err := GeneratePreviewFrom(data.OwnerId+"."+commontools.GetUlid().String(), data.FileName, data.FileBytes)
	return url, data.FileType, err
}

func GenerateImagePreviewFrom(data *pb.UploadData) (string, string, error) {
	thumbnailBytes, err := imagepreview.GetThumbnailFromBytes(data.FileBytes)
	if err != nil {
		return "", data.FileType, commontools.Errorf(err, "imagepreview.GetThumbnailFromBytes failed")
	}
	url, err := GeneratePreviewFrom(data.OwnerId+"."+commontools.GetUlid().String(), "thumbnail.jpg", thumbnailBytes)
	return url, "image", err
}

func GenerateVideoPreviewFrom(data *pb.UploadData) (string, string, error) {
	previewBytes, err := videopreview.GetGifFromBytes(data.FileBytes, data.FileName)
	if err != nil {
		return "", data.FileType, commontools.Errorf(err, "videopreview.GetGifFromBytes failed")
	}
	url, err := GeneratePreviewFrom(data.OwnerId+"."+commontools.GetUlid().String(), "preview.gif", previewBytes)
	return url, "video", err
}

//return previewUrl, fileType, err
func GetPreviewFrom(data *pb.UploadData) (string, string, error) {
	//skip generating preview if the GeneratePreview field is false
	if !data.GeneratePreview {
		return "", data.FileType, nil
	}

	//generate preview with user supplied preview data
	if data.PreviewBytes != nil && len(data.PreviewBytes) > 0 {
		url, err := GeneratePreviewFrom(data.OwnerId+"."+commontools.GetUlid().String(), data.FileName, data.PreviewBytes)
		return url, data.FileType, err
	}

	//If FileType is already provided
	if len(data.FileType) > 0 {
		switch data.FileType {
		case "image":
			return GenerateImagePreviewFrom(data)
		case "video":
			return GenerateVideoPreviewFrom(data)
		}
	}

	//Check the file type automatically
	mimeType := mimemagic.Match(data.FileBytes, data.FileName, -1)
	logger.Infof("%s is a %s", data.FileName, mimeType.Media)
	switch mimeType.Media {
	case "image":
		return GenerateImagePreviewFrom(data)
	case "video":
		return GenerateVideoPreviewFrom(data)
	case "audio":
		fmt.Println("This is an audio file.")
	case "application":
		fmt.Println("This is an application.")
	default:
		fmt.Printf("This is a(n) %s.", mimeType.Media)
	}

	//Fall back to fake preview for now
	//TODO: remove fake preview
	return GenerateFakePreviewFrom(data)
}
