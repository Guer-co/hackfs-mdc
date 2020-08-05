using System.Linq;
using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;
using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;

namespace TEELib.Storage
{
    public class AzureBlobService : IAzureBlobService
    {
        private const string CONNECTION_STRING =
            "DefaultEndpointsProtocol=https;AccountName=decstoragehack;AccountKey=42S5zyrVX1d+kBp6AGlIUPVJeP0/o6qXg/YqL+IMfmD33QQzhXNpSkr5GP61kQwwP0o27IdY/R+7nrqCrYscMw==;EndpointSuffix=core.windows.net";
       
        private BlobContainerClient GetContainerClient(string containerName)
        {
            // Create a BlobServiceClient object which will be used to create a container client
            var blobServiceClient = new BlobServiceClient(CONNECTION_STRING);
            
            return blobServiceClient.GetBlobContainerClient(containerName);
        }   

        public async Task<string> UploadFileAsync(string path,
            IDictionary<string, string> metadata = null)
        {
            var containerClient = GetContainerClient(metadata["containerName"]);

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

        public async Task<string> UploadStreamAsync(Stream stream, IDictionary<string, string> metadata = null)
        {
            var containerClient = GetContainerClient(metadata["containerName"]);

            // Get a reference to a blob
            var blobClient = containerClient.GetBlobClient(metadata["name"]);

            var response = await blobClient.UploadAsync(stream,
                    metadata: metadata);
            
            return response.Value.ETag.ToString();            
        }

        public async Task PurgeBlobAsync(string containerName, string blobName)
        {
            var containerClient = GetContainerClient(containerName);

            await containerClient.DeleteBlobIfExistsAsync(blobName);
        }

        public bool FileExists(string containerName, string fileName)
        {
            var containerClient = GetContainerClient(containerName);

            return containerClient.GetBlobs(BlobTraits.All)
                .Any(_ => _.Name.Equals(fileName));
        }

        public Task<IDictionary<string, string>> DownloadFileAsync(string containerName, string fileName)
        {
            throw new System.NotImplementedException();
        }
    }
}