using System;
using TEELib.Primitives;
using Xunit;

namespace TEELib.UnitTests.Primitives
{
    public class AES128PrimitiveUnitTests
    {
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
    }
}
