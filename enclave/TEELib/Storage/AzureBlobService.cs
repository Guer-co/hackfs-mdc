using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;
using Azure.Storage.Blobs;

namespace TEELib.Storage
{
    public class AzureBlobService : IUploader
    {
        private const string CONNECTION_STRING =
            "DefaultEndpointsProtocol=https;AccountName=decstoragehack;AccountKey=42S5zyrVX1d+kBp6AGlIUPVJeP0/o6qXg/YqL+IMfmD33QQzhXNpSkr5GP61kQwwP0o27IdY/R+7nrqCrYscMw==;EndpointSuffix=core.windows.net";

        private const string CONTAINER_NAME = "stage-in";

        private BlobContainerClient GetContainerClient()
        {
            // Create a BlobServiceClient object which will be used to create a container client
            var blobServiceClient = new BlobServiceClient(CONNECTION_STRING);
            
            return blobServiceClient.GetBlobContainerClient(CONTAINER_NAME);
        }   

        public async Task<string> UploadFileAsync(string path,
            IDictionary<string, string> metadata = null)
        {
            var containerClient = GetContainerClient();

            // Get a reference to a blob
            var blobClient = containerClient.GetBlobClient(path);

            // Open the file and upload its data
            using (var fileStream = File.OpenRead(path))
            {
                var response = await blobClient.UploadAsync(fileStream,
                    metadata: metadata);

                return response.Value.ETag.ToString();
            }
        }
    }
}
