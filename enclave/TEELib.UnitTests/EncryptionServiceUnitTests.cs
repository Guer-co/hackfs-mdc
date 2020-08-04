using System.IO;
using System.Threading.Tasks;
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
                var firstEncryption = await service.ProcessOriginalContentAsync(sourceStream, "hmac-demo.mp4");

                var secondEncryption = await service.ProcessContentForViewingAsync(firstEncryption.EncryptedStream,
                    firstEncryption.EncryptionKey, firstEncryption.Vector, firstEncryption.SigningKey, firstEncryption.SignedContentIpfsAddress);

                Assert.True(secondEncryption.ContentIsValid);
            }
        }
    }
}
