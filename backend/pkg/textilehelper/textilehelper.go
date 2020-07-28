package textilehelper

import (
	"bytes"
	"context"
	crand "crypto/rand"
	"crypto/tls"
	commontools "github.com/Guer-co/hackfs-mdc/backend/pkg/common"
	pb "github.com/Guer-co/hackfs-mdc/backend/pkg/libp2pnode/pb"
	"github.com/Guer-co/hackfs-mdc/backend/pkg/models"
	"github.com/Guer-co/hackfs-mdc/backend/pkg/models/jsonapi"
	"github.com/libp2p/go-libp2p-core/crypto"
	tc "github.com/textileio/go-threads/api/client"
	"github.com/textileio/go-threads/core/thread"
	"github.com/textileio/go-threads/db"
	"github.com/textileio/go-threads/util"

	//"github.com/textileio/go-threads/db"
	//"github.com/textileio/go-threads/util"
	bc "github.com/textileio/textile/api/buckets/client"
	"github.com/textileio/textile/api/common"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials"
	"os"
	"strings"
	"time"
)

//var HUB_API = "hub.next.textile.io:3007" //next hub
//var HUB_API = "api.textile.io:443"

type Config struct {
	UserKey string `envconfig:"TEXTILE_HUB_USER_KEY" required:"true" split_words:"true"`
	UserSecret string `envconfig:"TEXTILE_HUB_USER_SECRET" required:"true" split_words:"true"`
	DBThreadId string `envconfig:"TEXTILE_DB_THREAD_ID" required:"true" split_words:"true"`
	TestDBThreadId string `envconfig:"TEXTILE_TEST_DB_THREAD_ID" required:"true" split_words:"true"`
	HubApi string `envconfig:"TEXTILE_HUB_API" default:"api.textile.io:443" split_words:"true"`
}

// Clients wraps some clients.
type Clients struct {
	Threads *tc.Client
	Buckets *bc.Client
	DBThreadId thread.ID
	ContextWithDBThreadId context.Context
	//Hub     *hc.Client
	//Users   *uc.Client
}

var clients Clients
var config Config

func Setup(ctx context.Context) {
	commontools.LoadConfig("textile", &config)

	clients = NewClients(config.HubApi)
	randomId, err := CreateIdentity()
	commontools.FatalOnError(err, "CreateIdentity failed")
	ctx, err = Authenticate(ctx, config.UserKey, config.UserSecret)
	commontools.FatalOnError(err, "Authenticate failed")
	ctx, err = AuthorizeUser(ctx, randomId)
	commontools.FatalOnError(err, "AuthorizeUser failed")

	clients.DBThreadId, err = thread.Decode(config.DBThreadId)
	commontools.FatalOnError(err, "thread.Decode failed")
	clients.ContextWithDBThreadId = common.NewThreadIDContext(ctx, clients.DBThreadId)

	SetupSchema()
	/*
	bucketKey, err := CreateBucket(ctx, bucketThreadId, "test03", true)
	commontools.FatalOnError(err, "CreateBucket failed")
	logger.Infof("bucketKey: %+v", bucketKey)

	err = PushFileToBucket(ctx, bucketKey, "test01.png", "/Users/sing.yiu/Downloads/test01.png")
	commontools.FatalOnError(err, "PushFileToBucket failed")
	*/
	/*
	//bucketKey := "bafzbeiay356ciqdgtkpkzc66b2pswn6arohbzrpztewj3q3bne77macne4"
	bucketKey := "bafzbeibuq6nqv5z3bsugrfmrsqhva532pc7oacpgk7uifnvpkuz7soawa4"
	err = PullFileFromBucket(ctx, bucketKey, "test01.png", "/Users/sing.yiu/Downloads/test03_pulled_02.png")
	commontools.FatalOnError(err, "PullFileFromBucket failed")

	links, err := clients.Buckets.Links(ctx, bucketKey)
	commontools.FatalOnError(err, "clients.Buckets.Links failed")
	logger.Infof("links: %+v", links)
	*/
	/*
	cInfo, err := clients.Threads.GetCollectionInfo(ctx, contentDBThreadId, models.ContentDataCollectionName)
	commontools.FatalOnError(err, "clients.Threads.GetCollectionInfo failed")
	logger.Infof("cInfo: %+v", cInfo)
	 */
	/*
	instanceIds, err := clients.Threads.Create(ctx, contentDBThreadId, models.ContentDataCollectionName, tc.Instances{&testContentData})
	commontools.FatalOnError(err, "clients.Threads.Create failed")
	logger.Infof("instanceIds: %+v", instanceIds)
	 */
}

func SetupTesting() {
	testDBThreadId, err := thread.Decode(config.TestDBThreadId)
	commontools.FatalOnError(err, "thread.Decode failed")
	clients.DBThreadId = testDBThreadId

	commontools.FatalOnError(err, "thread.Decode failed")
	clients.ContextWithDBThreadId = common.NewThreadIDContext(clients.ContextWithDBThreadId, testDBThreadId)

	SetupSchema()
}

func SetupSchema() {
	//error is expected as the collection should already exist
	err := clients.Threads.NewCollection(clients.ContextWithDBThreadId, clients.DBThreadId, db.CollectionConfig{
		Name:    models.ContentDataCollectionName,
		Schema:  util.SchemaFromSchemaString(models.ContentDataSchema),
	})
	if err != nil {
		logger.Error(err)
	}
}

func GetGrpcDialOptionsFromTarget(target string) []grpc.DialOption {
	var opts []grpc.DialOption
	auth := common.Credentials{}
	if strings.Contains(target, "443") {
		creds := credentials.NewTLS(&tls.Config{})
		opts = append(opts, grpc.WithTransportCredentials(creds))
		auth.Secure = true
	} else {
		opts = append(opts, grpc.WithInsecure())
	}
	opts = append(opts, grpc.WithPerRPCCredentials(auth))
	return opts
}

func NewClients(target string) Clients {
	threads, err := tc.NewClient(target, GetGrpcDialOptionsFromTarget(target)...)
	if err != nil {
		logger.Fatal(commontools.Errorf(err, "tc.NewClient failed"))
	}

	buckets, err := bc.NewClient(target, GetGrpcDialOptionsFromTarget(target)...)
	if err != nil {
		logger.Fatal(commontools.Errorf(err, "bc.NewClient failed"))
	}

	return Clients{Threads: threads, Buckets: buckets}
}

func CreateIdentity() (thread.Identity, error) {
	sk, _, err := crypto.GenerateEd25519Key(crand.Reader)
	if err != nil {
		return nil, err
	}
	return thread.NewLibp2pIdentity(sk), nil
}

func Authenticate(ctx context.Context, userGroupKey string, userGroupSecret string) (context.Context, error) {
	// Add our user group key to the context
	ctx = common.NewAPIKeyContext(ctx, userGroupKey)
	// Add a signature using our user group secret
	var err error
	ctx, err = common.CreateAPISigContext(ctx, time.Now().Add(time.Minute), userGroupSecret)
	return ctx, err
}

func AuthorizeUser(ctx context.Context, user thread.Identity) (context.Context, error) {
	// Generate a new token for the user
	tok, err := clients.Threads.GetToken(ctx, user)
	if err != nil {
		return nil, commontools.Errorf(err, "cli.GetToken failed")
	}
	// // Add the token to the context
	ctx = thread.NewTokenContext(ctx, tok)
	//logger.Infof("tok: %+v", tok)
	return ctx, nil
}

func CreateThreadDB(name string) (thread.ID, error) {
	// Assign the name for the Thread
	ctx := common.NewThreadNameContext(clients.ContextWithDBThreadId, name)
	// Create the ID
	dbID := thread.NewIDV1(thread.Raw, 32)
	// Create the database
	return dbID, clients.Threads.NewDB(ctx, dbID)
}

//return buck.Root.Key, error
func CreateBucket(ctx context.Context, dbID thread.ID, name string, isPrivate bool) (string, error) {
	// Initialize a new bucket in the db
	ctx = common.NewThreadIDContext(ctx, dbID)
	buck, err := clients.Buckets.Init(ctx, bc.WithName(name), bc.WithPrivate(isPrivate))
	if err != nil {
		return "", err
	}
	return buck.Root.Key, nil
}

func PushFileToBucket(ctx context.Context, bucketKey string, bucketFileName string, inputFilePath string) error {
	file, err := os.Open(inputFilePath)
	if err != nil {
		return err
	}
	defer file.Close()
	res, root, err :=  clients.Buckets.PushPath(ctx, bucketKey, bucketFileName, file)
	logger.Infof("res: %+v, root: %+v", res, root)
	return err
}

func PullFileFromBucket(ctx context.Context, bucketKey string, bucketFileName string, outputFilePath string) error {
	file, err := os.Create(outputFilePath)
	if err != nil {
		return err
	}
	err = clients.Buckets.PullPath(ctx, bucketKey, bucketFileName, file)
	return err
}

func InsertToContentDB(data models.Instanceable) (string, error) {
	instanceIds, err := clients.Threads.Create(clients.ContextWithDBThreadId, clients.DBThreadId, data.GetCollectionName(), tc.Instances{data})
	if len(instanceIds) > 0 {
		return instanceIds[0], err
	}
	return "", err
}

func QueryContentDB(q *db.Query, dummyInstanceable models.Instanceable) (interface{}, error) {
	return clients.Threads.Find(clients.ContextWithDBThreadId, clients.DBThreadId, dummyInstanceable.GetCollectionName(), q, dummyInstanceable)
}

func GetQueryFromJsonApiQuery(jq jsonapi.Query) (*db.Query, error) {
	switch jq.Operation {
	case "Eq":
		return db.Where(jq.FieldPath).Eq(jq.Value), nil
	case "Ge":
		return db.Where(jq.FieldPath).Ge(jq.Value), nil
	case "Le":
		return db.Where(jq.FieldPath).Le(jq.Value), nil
	case "Ne":
		return db.Where(jq.FieldPath).Ne(jq.Value), nil
	default:
		return nil, commontools.Errorf(nil, "Unsupported operation: %s", jq.Operation)
	}
}

func GetInstanceableFromCollection(collection string) (models.Instanceable, error) {
	switch collection {
	case "ContentData":
		return &pb.ContentData{}, nil
	default:
		return nil, commontools.Errorf(nil, "Unsupported collection: %s", collection)
	}
}

func QueryWithJsonApiQuery(jq jsonapi.Query) (interface{}, error) {
	q, err := GetQueryFromJsonApiQuery(jq)
	if err != nil {
		return nil, commontools.Errorf(err, "GetQueryFromJsonApiQuery failed")
	}
	dummyInstanceable, err := GetInstanceableFromCollection(jq.Collection)
	if err != nil {
		return nil, commontools.Errorf(err, "GetInstanceableFromCollection failed")
	}
	return clients.Threads.Find(clients.ContextWithDBThreadId, clients.DBThreadId, jq.Collection, q, dummyInstanceable)
}

//return (threadKey, bucketKey, ipnsLink, err)
func CreateBucketAndPushData(bucketName string, bucketFileName string, data []byte, isPrivate bool) (string, string, string, error) {
	reader := bytes.NewReader(data)
	ctx := clients.ContextWithDBThreadId
	bucketKey, err := CreateBucket(ctx, clients.DBThreadId, bucketName, isPrivate)
	if err != nil {
		return "", "", "", commontools.Errorf(err, "CreateBucket failed")
	}
	logger.Infof("bucketKey: %+v, bucketFileName: %+v", bucketKey, bucketFileName)
	res, root, err := clients.Buckets.PushPath(ctx, bucketKey, bucketFileName, reader)
	if err != nil {
		return "", "", "", commontools.Errorf(err, "clients.Buckets.PushPath failed")
	}
	logger.Infof("res: %+v, root: %+v", res, root)
	links, err := clients.Buckets.Links(ctx, bucketKey)
	if err != nil {
		return "", "", "", commontools.Errorf(err, "clients.Buckets.Links failed")
	}
	return clients.DBThreadId.String(), bucketKey, links.IPNS, nil
}

func PullBytesFromBucket(bucketKey string, bucketFileName string) ([]byte, error) {
	var buf bytes.Buffer
	ctx := clients.ContextWithDBThreadId
	err := clients.Buckets.PullPath(ctx, bucketKey, bucketFileName, &buf)
	if err != nil {
		return nil, commontools.Errorf(err, "clients.Buckets.PullPath failed")
	}
	return buf.Bytes(), nil
}
