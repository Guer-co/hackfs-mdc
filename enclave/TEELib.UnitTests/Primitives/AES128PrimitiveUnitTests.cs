using System.IO;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
using TEELib.Primitives;
using Xunit;

namespace TEELib.UnitTests.Primitives
{
    public class AES128PrimitiveUnitTests
    {
        public byte[] ToByteArray(Stream input)
        {
            byte[] buffer = new byte[16 * 1024];
            using (MemoryStream ms = new MemoryStream())
            {
                int read;
                while ((read = input.Read(buffer, 0, buffer.Length)) > 0)
                {
                    ms.Write(buffer, 0, read);
                }
                return ms.ToArray();
            }
        }

        private string GetStreamHash(Stream stream)
        {
            using (SHA256 sha256Hash = SHA256.Create())
            {
                // Convert the input string to a byte array and compute the hash.
                byte[] data = sha256Hash.ComputeHash(ToByteArray(stream));

                // Create a new Stringbuilder to collect the bytes
                // and create a string.
                var sBuilder = new StringBuilder();

                // Loop through each byte of the hashed data
                // and format each one as a hexadecimal string.
                for (int i = 0; i < data.Length; i++)
                {
                    sBuilder.Append(data[i].ToString("x2"));
                }

                // Return the hexadecimal string.
                return sBuilder.ToString();
            }
        }

        [Fact]
        public void TestEncryptDecryptText()
        {
            const string TEST_TEXT = "This is a test";

            var keyInfo = new KeyInfo();

            var primitive = new AES128Primitive();

            var cypherText = primitive.EncryptText(TEST_TEXT, keyInfo);
            Assert.False(string.IsNullOrWhiteSpace(cypherText));
            Assert.NotEqual(TEST_TEXT, cypherText);

            var decryptedText = primitive.DecryptText(cypherText, keyInfo);
            Assert.Equal(TEST_TEXT, decryptedText);
        }

        [Fact]
        public async Task TestEncryptDecryptStreamAsync()
        {
            using (var originalStream = new FileStream("hmac-demo.mp4", FileMode.Open))
            {
                var keyInfo = new KeyInfo();

                var primitive = new AES128Primitive();

                var encryptedStream = await primitive.EncryptStreamAsync(originalStream, keyInfo);

                Assert.NotNull(encryptedStream);

                // Cannot be closed
                Assert.True(encryptedStream.CanSeek);

                var unencryptedStream = await primitive.DecryptStreamAsync(encryptedStream, keyInfo);

                Assert.NotNull(unencryptedStream);

                // Cannot be closed
                Assert.True(unencryptedStream.CanSeek);

                Assert.Equal(GetStreamHash(originalStream), GetStreamHash(unencryptedStream));
            }                
        }
    }
}
