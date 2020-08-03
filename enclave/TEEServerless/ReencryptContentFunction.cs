using System;
using System.IO;
using System.Threading.Tasks;
using Microsoft.Azure.WebJobs;
using Microsoft.Extensions.Logging;
using TEELib;
using TEELib.Primitives;
using TEELib.Storage;

namespace ReencryptContentFunction
{
    public static class ReencryptContentFunction
    {               
        [FunctionName("ReencryptContentFunction")]
        public async static Task RunAsync([BlobTrigger("stage-in/{name}", Connection = "StorageConnection")]Stream myBlob,
            string name, ILogger log)
        {
            try
            {
                log.LogInformation($"ReencryptContentFunction processing blob\n Name:{name} \n Size: {myBlob.Length} Bytes");

                var hMACPrimitive = new HMACPrimitive();
                var ipfsUploader = new IpfsService();
                var aES128Primitive = new AES128Primitive();
                var blobStorage = new AzureBlobService();

                var service = new EncryptionService(hMACPrimitive, ipfsUploader, aES128Primitive);

                var result = await service.ProcessOriginalContentAsync(myBlob, name);

                var metadata = new Dictionary<string, string>();

                metadata.Add("containerName", "encrypted-content");
                metadata.Add("name", name);
                metadata.Add("signatureAddress", result.SignedContentIpfsAddress);
                metadata.Add("encryptionKey", Convert.ToBase64String(result.EncryptionKey));
                metadata.Add("vector", Convert.ToBase64String(result.Vector));
                metadata.Add("signingKey", Convert.ToBase64String(result.SigningKey));

                await blobStorage.UploadStreamAsync(result.EncryptedStream, metadata);

                // Remove staged blob
                await blobStorage.PurgeBlobAsync("original-content", name);

                log.LogInformation($"ReencryptContentFunction processed blob\n Name:{name} \n Size: {myBlob.Length} Bytes");

            }
            catch (Exception exc)
            {
                log.LogInformation(
                    $"ReencryptContentFunction failed for blob\n Name:{name}\n Size: {myBlob.Length} Bytes\n{exc.Message}");
            }
        }
    }
}
