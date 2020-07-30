using System.IO;
using System.Threading.Tasks;
using Microsoft.Azure.WebJobs;
using Microsoft.Extensions.Logging;
using TEELib.Primitives;

namespace ReencryptContentFunction
{
    public static class ReencryptContentFunction
    {
        private static async Task ExecuteFunctionAsync(Stream myBlob)
        {
            var primitive = new AES128Primitive();

            await primitive.EncryptStreamAsync(myBlob, new KeyInfo());
        }

        [FunctionName("ReencryptContentFunction")]
        public static void Run([BlobTrigger("stage-in/{name}", Connection = "StorageConnection")]Stream myBlob,
            string name, ILogger log)
        {
            log.LogInformation($"C# Blob trigger function being processed for blob\n Name:{name} \n Size: {myBlob.Length} Bytes");

            var primitive = new AES128Primitive();

            Task.Run(() => ExecuteFunctionAsync(myBlob));
        }
    }
}
