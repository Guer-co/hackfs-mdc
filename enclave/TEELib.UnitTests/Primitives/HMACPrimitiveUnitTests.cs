using System.IO;
using System.Security.Cryptography;
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
            // Create a random key using a random number generator. This would be the
            //  secret key shared by sender and receiver.
            var secretkey = new byte[64];

            using (RNGCryptoServiceProvider rng = new RNGCryptoServiceProvider())
            {
                // The array is now filled with cryptographically strong random bytes.
                rng.GetBytes(secretkey);
            }

            var primitive = new HMACPrimitive();

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
            // Create a random key using a random number generator. This would be the
            //  secret key shared by sender and receiver.
            var secretkey = new byte[64];

            using (RNGCryptoServiceProvider rng = new RNGCryptoServiceProvider())
            {
                // The array is now filled with cryptographically strong random bytes.
                rng.GetBytes(secretkey);
            }

            var primitive = new HMACPrimitive();

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
