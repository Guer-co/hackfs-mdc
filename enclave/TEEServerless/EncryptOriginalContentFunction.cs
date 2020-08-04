using System;
using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;
using Microsoft.Azure.WebJobs;
using Microsoft.Extensions.Logging;
using TEELib;
using TEELib.Primitives;
using TEELib.Storage;

namespace TEEServerless
{
    public static class EncryptOriginalContentFunction
    {
        [FunctionName("EncryptOriginalContentFunction")]
        public async static Task RunAsync([BlobTrigger("original-content/{name}", Connection = "StorageConnection")]
            Stream myBlob, string name, ILogger log)
        {
            try
            {
                log.LogInformation($"EncryptOriginalContentFunction processing blob\n Name:{name} \n Size: {myBlob.Length} Bytes");

                var hMACPrimitive = new HMACPrimitive();
                var ipfsUploader = new IpfsService();
                var aES128Primitive = new AES128Primitive();
                var blobStorage = new AzureBlobService();

                var service = new EncryptionService(hMACPrimitive, ipfsUploader, aES128Primitive);

                var result = await service.ProcessOriginalContentAsync(myBlob, name);

                var metadata = new Dictionary<string, string>();

                metadata.Add("containerName", "encrypted-content");
                metadata.Add("name", name);

                // To be persisted
                metadata.Add(Constants.SignatureAddress, result.SignedContentIpfsAddress);
                metadata.Add(Constants.EncryptionKey, Convert.ToBase64String(result.EncryptionKey));
                metadata.Add(Constants.Vector, Convert.ToBase64String(result.Vector));
                metadata.Add(Constants.SigningKey, Convert.ToBase64String(result.SigningKey));

                await blobStorage.UploadStreamAsync(result.EncryptedStream, metadata);

                // Remove staged blob
                await blobStorage.PurgeBlobAsync("original-content", name);

                log.LogInformation($"EncryptOriginalContentFunction processed blob\n Name:{name} \n Size: {myBlob.Length} Bytes");

            }
            catch (Exception exc)
            {
                log.LogInformation(
                    $"EncryptOriginalContentFunction failed for blob\n Name:{name}\n Size: {myBlob.Length} Bytes\n{exc.Message}");
            }
        }
    }
}
