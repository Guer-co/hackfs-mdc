package models

import (
	core "github.com/textileio/go-threads/core/db"
)

type ContentData struct {
	Id      core.InstanceID `json:"_id"`
	OwnerId string `json:"ownerId,omitempty"`
	FileName string `json:"fileName,omitempty"`
	FileType string `json:"fileType,omitempty"`
	FileSize int64 `json:"fileSize,omitempty"`
	Description string `json:"description,omitempty"`
	ThreadKey string `json:"threadKey,omitempty"`
	BucketKey string `json:"bucketKey,omitempty"`
	EncryptedUrl string `json:"encryptedUrl,omitempty"`
	PreviewUrl string `json:"previewUrl,omitempty"`
	ReceivedAt int64 `json:"receivedAt,omitempty"`
	UpdatedAt int64 `json:"updatedAt,omitempty"`
}

//ContentData implement Instanceable
func (c *ContentData) GetCollectionName() string {
	return ContentDataCollectionName
}

//https://jsonschema.net/home

/*
Example content data in JSON
{
	"_id": "bafktw6svx7iwwtrzcnyzdmuc3yfzbvmdgg6td7cezp7cp7bye4hmzkq",
	"ownerId": "bafk4v4bqp7x3ytfjvh7b73vwq5s62gyenlh6jr3d7g52klfjg2h3yvy",
	"fileName": "test01.png",
	"fileType": "image",
	"fileSize": 5000,
	"description": "this is a test",
	"threadKey": "bafktw6svx7iwwtrzcnyzdmuc3yfzbvmdgg6td7cezp7cp7bye4hmzkq",
	"bucketKey": "bafzbeiay356ciqdgtkpkzc66b2pswn6arohbzrpztewj3q3bne77macne4",
	"encryptedUrl": "https://hub.textile.io/ipns/bafzbeiay356ciqdgtkpkzc66b2pswn6arohbzrpztewj3q3bne77macne4",
	"previewUrl": "https://hub.textile.io/ipns/bafzbeiay356ciqdgtkpkzc66b2pswn6arohbzrpztewj3q3bne77macne4",
	"receivedAt": 1595137568000,
	"updatedAt": 1595137568200
}
 */

const (
	ContentDataCollectionName = "ContentData"
	ContentDataSchema =
		`{
    "$schema": "http://json-schema.org/draft-07/schema",
    "$id": "http://example.com/example.json",
    "type": "object",
    "title": "ContentData",
    "description": "The ContentData schema comprises the entire JSON document.",
    "default": {},
    "examples": [
        {
            "_id": "bafktw6svx7iwwtrzcnyzdmuc3yfzbvmdgg6td7cezp7cp7bye4hmzkq",
            "ownerId": "bafk4v4bqp7x3ytfjvh7b73vwq5s62gyenlh6jr3d7g52klfjg2h3yvy",
            "fileName": "test01.png",
            "fileType": "image",
            "fileSize": 5000,
            "description": "this is a test",
            "threadKey": "bafktw6svx7iwwtrzcnyzdmuc3yfzbvmdgg6td7cezp7cp7bye4hmzkq",
            "bucketKey": "bafzbeiay356ciqdgtkpkzc66b2pswn6arohbzrpztewj3q3bne77macne4",
            "encryptedUrl": "https://hub.textile.io/ipns/bafzbeiay356ciqdgtkpkzc66b2pswn6arohbzrpztewj3q3bne77macne4",
            "previewUrl": "https://hub.textile.io/ipns/bafzbeiay356ciqdgtkpkzc66b2pswn6arohbzrpztewj3q3bne77macne4",
            "receivedAt": 1595137568000,
            "updatedAt": 1595137568200
        }
    ],
    "required": [
        "_id",
        "ownerId",
        "fileName",
        "fileType",
        "fileSize",
        "description",
        "threadKey",
        "bucketKey",
        "encryptedUrl",
        "previewUrl",
        "receivedAt",
        "updatedAt"
    ],
    "additionalProperties": true,
    "properties": {
        "_id": {
            "$id": "#/properties/_id",
            "type": "string",
            "title": "The _id schema",
            "description": "An explanation about the purpose of this instance.",
            "default": "",
            "examples": [
                "bafktw6svx7iwwtrzcnyzdmuc3yfzbvmdgg6td7cezp7cp7bye4hmzkq"
            ]
        },
        "ownerId": {
            "$id": "#/properties/ownerId",
            "type": "string",
            "title": "The ownerId schema",
            "description": "An explanation about the purpose of this instance.",
            "default": "",
            "examples": [
                "bafk4v4bqp7x3ytfjvh7b73vwq5s62gyenlh6jr3d7g52klfjg2h3yvy"
            ]
        },
        "fileName": {
            "$id": "#/properties/fileName",
            "type": "string",
            "title": "The fileName schema",
            "description": "An explanation about the purpose of this instance.",
            "default": "",
            "examples": [
                "test01.png"
            ]
        },
        "fileType": {
            "$id": "#/properties/fileType",
            "type": "string",
            "title": "The fileType schema",
            "description": "An explanation about the purpose of this instance.",
            "default": "",
            "examples": [
                "image"
            ]
        },
        "fileSize": {
            "$id": "#/properties/fileSize",
            "type": "integer",
            "title": "The fileSize schema",
            "description": "An explanation about the purpose of this instance.",
            "default": 0,
            "examples": [
                5000
            ]
        },
        "description": {
            "$id": "#/properties/description",
            "type": "string",
            "title": "The description schema",
            "description": "An explanation about the purpose of this instance.",
            "default": "",
            "examples": [
                "this is a test"
            ]
        },
        "threadKey": {
            "$id": "#/properties/threadKey",
            "type": "string",
            "title": "The threadKey schema",
            "description": "An explanation about the purpose of this instance.",
            "default": "",
            "examples": [
                "bafktw6svx7iwwtrzcnyzdmuc3yfzbvmdgg6td7cezp7cp7bye4hmzkq"
            ]
        },
        "bucketKey": {
            "$id": "#/properties/bucketKey",
            "type": "string",
            "title": "The bucketKey schema",
            "description": "An explanation about the purpose of this instance.",
            "default": "",
            "examples": [
                "bafzbeiay356ciqdgtkpkzc66b2pswn6arohbzrpztewj3q3bne77macne4"
            ]
        },
        "encryptedUrl": {
            "$id": "#/properties/encryptedUrl",
            "type": "string",
            "title": "The encryptedUrl schema",
            "description": "An explanation about the purpose of this instance.",
            "default": "",
            "examples": [
                "https://hub.textile.io/ipns/bafzbeiay356ciqdgtkpkzc66b2pswn6arohbzrpztewj3q3bne77macne4"
            ]
        },
        "previewUrl": {
            "$id": "#/properties/previewUrl",
            "type": "string",
            "title": "The previewUrl schema",
            "description": "An explanation about the purpose of this instance.",
            "default": "",
            "examples": [
                "https://hub.textile.io/ipns/bafzbeiay356ciqdgtkpkzc66b2pswn6arohbzrpztewj3q3bne77macne4"
            ]
        },
        "receivedAt": {
            "$id": "#/properties/receivedAt",
            "type": "integer",
            "title": "The receivedAt schema",
            "description": "An explanation about the purpose of this instance.",
            "default": 0,
            "examples": [
                1595137568000
            ]
        },
        "updatedAt": {
            "$id": "#/properties/updatedAt",
            "type": "integer",
            "title": "The updatedAt schema",
            "description": "An explanation about the purpose of this instance.",
            "default": 0,
            "examples": [
                1595137568200
            ]
        }
    }
}`
)