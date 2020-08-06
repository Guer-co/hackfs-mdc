using System.IO;
using System.Security.Cryptography;
using System.Threading.Tasks;

namespace TEELib.Primitives
{
    public class HMACPrimitive : IHMACPrimitive
    {
        /// <summary>
        /// Create a random key using a random number generator. This would be the
        /// secret key shared by sender and receiver.
        /// </summary>
        /// <returns></returns>
        public byte[] GenerateHmacKey()
        {
            using (RNGCryptoServiceProvider rng = new RNGCryptoServiceProvider())
            {
                var secretkey = new byte[64];

                // The array is now filled with cryptographically strong random bytes.
                rng.GetBytes(secretkey);

                return secretkey;
            }
        }

        /// <summary>
        /// Creates a HMAC signature for the given Stream and secret key
        /// </summary>
        /// <param name="secretKey"></param>
        /// <param name="sourceStream"></param>
        /// <returns></returns>
        public async Task<Stream> SignStreamAsync(byte[] secretKey, Stream sourceStream)
        {
            // Initialize the keyed hash object
            using (HMACSHA256 hmac = new HMACSHA256(secretKey))
            {
                // Compute the hash of the input file
                var inputHash = hmac.ComputeHash(sourceStream);

                // Reset inStream to the beginning of the file
                sourceStream.Position = 0;

                var targetStream = new MemoryStream();

                // Write the computed hash value to the output stream
                targetStream.Write(inputHash, 0, inputHash.Length);

                // Append the original contents to the new stream 
                int bytesRead;

                // read 1K at a time
                byte[] buffer = new byte[1024];

                do
                {
                    // Read from the wrapping CryptoStream.
                    bytesRead = sourceStream.Read(buffer, 0, 1024);
                    await targetStream.WriteAsync(buffer, 0, bytesRead);

                } while (bytesRead > 0);

                return targetStream;
            }
        }
        
        /// <summary>
        /// Performs a symmetric signature validation
        /// </summary>
        /// <param name="secretKey"></param>
        /// <param name="signedStream"></param>
        /// <returns></returns>
        public async Task<bool> IsSignatureValidAsync(byte[] secretKey, Stream signedStream)
        {
            // Initialize the keyed hash object.
            using (HMACSHA256 hmac = new HMACSHA256(secretKey))
            {
                // Create an array to hold the keyed hash value read from the file.
                byte[] storedHash = new byte[hmac.HashSize / 8];

                // Read in the storedHash.
                await signedStream.ReadAsync(storedHash, 0, storedHash.Length);

                // Compute the hash of the remaining contents of the file.
                // The stream is properly positioned at the beginning of the content,
                // immediately after the stored hash value.
                byte[] computedHash = hmac.ComputeHash(signedStream);

                // compare the computed hash with the stored value
                for (int i = 0; i < storedHash.Length; i++)
                {
                    if (computedHash[i] != storedHash[i])
                    {
                        return false;
                    }
                }

                return true;
            }
        }
    }
}
