using System.IO;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using TEELib.Primitives;
using TEELib.Storage;
using Xunit;
using Xunit.Abstractions;

namespace TEELib.UnitTests
{
    public class EncryptionServiceUnitTests
    {
        private readonly ILogger<EncryptionServiceUnitTests> _logger;

        public EncryptionServiceUnitTests(ITestOutputHelper helper)
        {
            _logger = helper.BuildLoggerFor<EncryptionServiceUnitTests>();
        }
        
        [Fact]
        public async Task TestProcessOriginalContentAsync()
        {
            var hMACPrimitive = new HMACPrimitive();
            var ipfsUploader = new IpfsService();
            var aES128Primitive = new AES128Primitive();

            var service = new EncryptionService(hMACPrimitive, ipfsUploader, aES128Primitive);

            using (var sourceStream = File.Open("hmac-demo.mp4", FileMode.Open))
            {                
                var firstEncryption = await service.ProcessOriginalContentAsync(sourceStream,
                    "hmac-demo.mp4", _logger);

                // Go back to the beginning of the stream
                firstEncryption.EncryptedStream.Position = 0;

                var secondEncryption = await service.ProcessContentForViewingAsync(firstEncryption.EncryptedStream,
                    firstEncryption.EncryptionKey, firstEncryption.Vector, firstEncryption.SigningKey,
                    firstEncryption.SignedContentIpfsAddress, _logger);

                Assert.True(secondEncryption.ContentIsValid);
            }
        }
    }
}
