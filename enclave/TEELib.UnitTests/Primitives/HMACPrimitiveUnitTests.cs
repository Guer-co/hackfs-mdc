using System;
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
        public async Task TestEncryptDecryptText()
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

            using (var sourceStream = new FileStream("basic-ledger.mp4", FileMode.Open))
            {
                var signedStream = await primitive.SignStreamAsync(secretkey, sourceStream);
            }
        }
    }
}
