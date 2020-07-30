using System.IO;
using System.Threading.Tasks;
using Microsoft.Azure.WebJobs;
using Microsoft.Extensions.Logging;
using TEELib.Primitives;

namespace ReencryptContentFunction
{
    public static class ReencryptContentFunction
    {
        
        /*
        [FunctionName("ReencryptContentFunction")]
        public async static Task RunAsync([BlobTrigger("stage-in/{name}", Connection = "StorageConnection")]Stream myBlob,
            string name, ILogger log)
        {
            log.LogInformation($"C# Blob trigger function being processed for blob\n Name:{name} \n Size: {myBlob.Length} Bytes");

            var primitive = new AES128Primitive();

         

            await primitive.EncryptStreamAsync(myBlob, new KeyInfo());
        }*/
    }
}
