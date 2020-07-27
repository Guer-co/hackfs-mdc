using System.IO;
using Microsoft.Azure.WebJobs;
using Microsoft.Extensions.Logging;

namespace TEEServerless
{
    public static class ProcessFileFunc
    {
        [FunctionName("ProcessFileFunc")]
        public static void Run(
            [BlobTrigger("https://decstoragehack.blob.core.windows.net/basic//{name}", Connection = "ConnectionString")]
            Stream myBlob, string name, ILogger log)
        {
            log.LogInformation($"C# Blob trigger function Processed blob\n Name:{name} \n Size: {myBlob.Length} Bytes");
        }
    }
}
