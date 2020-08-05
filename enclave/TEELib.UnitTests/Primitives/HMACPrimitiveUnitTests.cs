using System.IO;
using System.Threading.Tasks;
using TEELib.Primitives;
using Xunit;

namespace TEELib.UnitTests.Primitives
{
    public class HMACKPrimitiveUnitTests
    {
        [Fact]
        public async Task TestIsSignatureValidAsync()
        {
            var primitive = new HMACPrimitive();

            var secretkey = primitive.GenerateHmacKey();

            using (var sourceStream = new FileStream("hmac-demo.mp4", FileMode.Open))
            {
                using (var signedStream = await primitive.SignStreamAsync(secretkey, sourceStream))
                {
                    // Reset the stream pointer
                    signedStream.Position = 0;

                    Assert.True(await primitive.IsSignatureValidAsync(secretkey, signedStream));
                }
            }
        }

        [Fact]
        public async Task TestIsSignatureInvalidAsync()
        {
            var primitive = new HMACPrimitive();

            var secretkey = primitive.GenerateHmacKey();

            using (var sourceStream = new FileStream("hmac-demo.mp4", FileMode.Open))
            {
                using (var signedStream = await primitive.SignStreamAsync(secretkey, sourceStream))
                {
                    // Let's use the unsigned stream to mimic a disturbance
                    sourceStream.Position = 0;

                    Assert.False(await primitive.IsSignatureValidAsync(secretkey, sourceStream));
                }
            }
        }
    }
}
