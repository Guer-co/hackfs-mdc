using System;
using System.IO;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Host;
using Microsoft.Extensions.Logging;

namespace TEEServerless
{
    public static class EncryptOriginalContentFunction
    {
        [FunctionName("EncryptOriginalContentFunction")]
        public static void Run([BlobTrigger("original-content/{name}", Connection = "StorageConnection")] Stream myBlob, string name, ILogger log)
        {
            log.LogInformation($"C# Blob trigger function Processed blob\n Name:{name} \n Size: {myBlob.Length} Bytes");
        }
    }
}
