using System;
using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;
using Azure.Storage.Blobs.Models;
using Microsoft.Azure.WebJobs;
using Microsoft.Extensions.Logging;
using TEELib;
using TEELib.Primitives;
using TEELib.Storage;

namespace TEEServerless
{
    public static class ReencryptContentFunction
    {               
        [FunctionName("ReencryptContentFunction")]
        public async static Task RunAsync([BlobTrigger("reencrypting-content/{ name}", Connection = "StorageConnection")]Stream myBlob,
            string name, string blobExtension,
            string blobTrigger, // full path to triggering blob
            Uri uri, // blob primary location
            IDictionary<string, string> metaData, // user-defined blob metadata
            BlobProperties properties, // blob system properties, e.g. LastModified
            ILogger log)
        {
            try
            {
                log.LogInformation($"ReencryptContentFunction processing blob\n Name:{name} \n Size: {myBlob.Length} Bytes");

                // Read metadata
                if (!metaData.ContainsKey(Constants.EncryptionKey))
                {
                    log.LogInformation($"ReencryptContentFunction failed for blob\n Name:{name} \n Size: {myBlob.Length} Bytes\nEncryption Key is missing.");
                    return;
                }

                var encryptionKey = Convert.FromBase64String(metaData[Constants.EncryptionKey]);

                if (!metaData.ContainsKey(Constants.Vector))
                {
                    log.LogInformation($"ReencryptContentFunction failed for blob\n Name:{name} \n Size: {myBlob.Length} Bytes\nVector is missing.");
                    return;
                }

                var vector = Convert.FromBase64String(metaData[Constants.Vector]);

                if (!metaData.ContainsKey(Constants.SigningKey))
                {
                    log.LogInformation($"ReencryptContentFunction failed for blob\n Name:{name} \n Size: {myBlob.Length} Bytes\nSigning Key is missing.");
                    return;
                }

                var signingKey = Convert.FromBase64String(metaData[Constants.SigningKey]);

                if (!metaData.ContainsKey(Constants.SignatureAddress))
                {
                    log.LogInformation($"ReencryptContentFunction failed for blob\n Name:{name} \n Size: {myBlob.Length} Bytes\nSignature Address is missing.");
                    return;
                }

                var signatureAddress = metaData[Constants.SignatureAddress];

                // Instantiate dependencies
                var hMACPrimitive = new HMACPrimitive();
                var ipfsUploader = new IpfsService();
                var aES128Primitive = new AES128Primitive();
                var blobStorage = new AzureBlobService();

                var service = new EncryptionService(hMACPrimitive, ipfsUploader, aES128Primitive);

                var result = await service.ProcessContentForViewingAsync(myBlob, encryptionKey, vector,
                    signingKey, signatureAddress, log);

                // Set the pointer at the beginning of the file
                result.EncryptedStream.Position = 0;

                var metadata = new Dictionary<string, string>();

                metadata.Add("containerName", "reencrypted-content");
                metadata.Add("name", name);
                metadata.Add("encryptionKey", Convert.ToBase64String(result.EncryptionKey));
                metadata.Add("vector", Convert.ToBase64String(result.Vector));

                await blobStorage.UploadStreamAsync(result.EncryptedStream, metadata);

                // Remove staged blob
                await blobStorage.PurgeBlobAsync("reencrypting-content", name);

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
