using System.IO;
using System.Security.Cryptography;
using System.Threading.Tasks;
using TEELib;
using TEELib.Primitives;
using TEELib.Storage;
using Xunit;

namespace TEELib.UnitTests
{
    public class EncryptionServiceUnitTests
    {
        [Fact]
        public async Task TestProcessOriginalContentAsync()
        {
            var hMACPrimitive = new HMACPrimitive();
            var ipfsUploader = new IpfsService();
            var aES128Primitive = new AES128Primitive();

            var service = new EncryptionService(hMACPrimitive, ipfsUploader, aES128Primitive);

            using (var sourceStream = File.Open("hmac-demo.mp4", FileMode.Open))
            {                
                var result = await service.ProcessOriginalContentAsync(sourceStream, "hmac-demo.mp4");
            }
        }
    }
}
