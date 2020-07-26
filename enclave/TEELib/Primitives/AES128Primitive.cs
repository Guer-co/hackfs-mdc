using System;
using System.IO;
using System.Security.Cryptography;
using System.Threading.Tasks;

namespace TEELib.Primitives
{
    public class AES128Primitive
    {
        public string EncryptText(string plainText, KeyInfo keyInfo)
        {
            // Create a new AesManaged.    
            using (AesManaged aes = new AesManaged())
            {
                // Create encryptor    
                var encryptor = aes.CreateEncryptor(keyInfo.Key, keyInfo.Vector);

                // Create MemoryStream    
                using (MemoryStream ms = new MemoryStream())
                {
                    // Create crypto stream using the CryptoStream class. This class is the key to encryption    
                    // and encrypts and decrypts data from any given stream. In this case, we will pass a memory stream    
                    // to encrypt    
                    using (CryptoStream cs = new CryptoStream(ms, encryptor, CryptoStreamMode.Write))
                    {
                        // Create StreamWriter and write data to a stream    
                        using (StreamWriter sw = new StreamWriter(cs))
                        {
                            sw.Write(plainText);
                        }

                        return Convert.ToBase64String(ms.ToArray());
                    }
                }
            }
        }

        public string DecryptText(string encryptedText, KeyInfo keyInfo)
        {
            var cipherText = Convert.FromBase64String(encryptedText);

            // Create AesManaged    
            using (AesManaged aes = new AesManaged())
            {
                // Create a decryptor    
                var decryptor = aes.CreateDecryptor(keyInfo.Key, keyInfo.Vector);

                // Create the streams used for decryption.    
                using (MemoryStream ms = new MemoryStream(cipherText))
                {
                    // Create crypto stream    
                    using (CryptoStream cs = new CryptoStream(ms, decryptor, CryptoStreamMode.Read))
                    {
                        // Read crypto stream    
                        using (StreamReader reader = new StreamReader(cs))
                        {
                            return reader.ReadToEnd();
                        }
                    }
                }
            }
        }

        public async Task EncryptFileAsync(string filePath, KeyInfo keyInfo)
        {
            string tempFileName = Path.GetTempFileName();

            // Create a new AesManaged   
            using (AesManaged aes = new AesManaged())
            {
                // Create encryptor    
                var encryptor = aes.CreateEncryptor(keyInfo.Key, keyInfo.Vector);

                using (FileStream fileStream = File.OpenRead(filePath))
                {
                    using (FileStream tempFile = File.Create(tempFileName))
                    {
                        using (var cryptoStream = new CryptoStream(tempFile, encryptor, CryptoStreamMode.Write))
                        {
                            await fileStream.CopyToAsync(cryptoStream);
                        }
                    }
                }
            }

            File.Delete(filePath);
            File.Move(tempFileName, filePath);
        }

        public async Task DecryptFileAsync(string filePath, KeyInfo keyInfo)
        {
            string tempFileName = Path.GetTempFileName();

            using (AesManaged aes = new AesManaged())
            {
                var decryptor = aes.CreateDecryptor(keyInfo.Key, keyInfo.Vector);

                using (FileStream fileStream = File.OpenRead(filePath))
                {
                    using (FileStream tempFile = File.Create(tempFileName))
                    {
                        using (var cryptoStream = new CryptoStream(tempFile, decryptor, CryptoStreamMode.Write))
                        {
                            await fileStream.CopyToAsync(cryptoStream);
                        }
                    }
                }
            }

            File.Delete(filePath);
            File.Move(tempFileName, filePath);
        }
    }
}
