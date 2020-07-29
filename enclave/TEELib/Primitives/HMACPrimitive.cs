using System.IO;
using System.Security.Cryptography;
using System.Threading.Tasks;

namespace TEELib.Primitives
{
    public class HMACPrimitive
    {
        public async Task<Stream> SignStreamAsync(byte[] key, Stream sourceStream)
        {
            // Initialize the keyed hash object
            using (HMACSHA256 hmac = new HMACSHA256(key))
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

        // Compares the key in the source file with a new key created for the data portion of the file. If the keys
        // compare the data has not been tampered with.
        public async Task<bool> VerifySignatureAsync(byte[] key, Stream signedStream)
        {
            // Initialize the keyed hash object.
            using (HMACSHA256 hmac = new HMACSHA256(key))
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
