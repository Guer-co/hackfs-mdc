using System;
using System.IO;
using System.Security.Cryptography;

namespace TEELib.Primitives
{
    public class KeyInfo
    {
        public byte[] Key { get; }

        /// <summary>
        /// Initialization Vector
        /// </summary>
        public byte[] Vector { get; }

        /// <summary>
        /// Creates the Key and Initializing Vector by default
        /// </summary>
        public KeyInfo()
        {
            using var myAes = Aes.Create();
            Key = myAes.Key;
            Vector = myAes.IV;
        }

        public KeyInfo(string key, string vector)
        {
            Key = Convert.FromBase64String(key);
            Vector = Convert.FromBase64String(vector);
        }
    }

    public class AES128Primitive
    {
        public string EncryptText(string plainText, KeyInfo keyInfo)
        {
            // Create a new AesManaged.    
            using (AesManaged aes = new AesManaged())
            {
                // Create encryptor    
                ICryptoTransform encryptor = aes.CreateEncryptor(keyInfo.Key, keyInfo.Vector);

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
                ICryptoTransform decryptor = aes.CreateDecryptor(keyInfo.Key, keyInfo.Vector);

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

        public void EncryptFile(string filePath, byte[] key)
        {
            string tempFileName = Path.GetTempFileName();

            using (SymmetricAlgorithm cipher = Aes.Create())
            using (FileStream fileStream = File.OpenRead(filePath))
            using (FileStream tempFile = File.Create(tempFileName))
            {
                cipher.Key = key;
                // aes.IV will be automatically populated with a secure random value
                byte[] iv = cipher.IV;

                

                using (var cryptoStream =
                    new CryptoStream(tempFile, cipher.CreateEncryptor(), CryptoStreamMode.Write))
                {
                    fileStream.CopyTo(cryptoStream);
                }
            }

            File.Delete(filePath);
            File.Move(tempFileName, filePath);
        }

        public void DecryptFile(string filePath, byte[] key)
        {
            string tempFileName = Path.GetTempFileName();

            using (SymmetricAlgorithm cipher = Aes.Create())
            using (FileStream fileStream = File.OpenRead(filePath))
            using (FileStream tempFile = File.Create(tempFileName))
            {
                cipher.Key = key;
                byte[] iv = new byte[cipher.BlockSize / 8];
                byte[] headerBytes = new byte[6];
                int remain = headerBytes.Length;

                while (remain != 0)
                {
                    int read = fileStream.Read(headerBytes, headerBytes.Length - remain, remain);

                    if (read == 0)
                    {
                        throw new EndOfStreamException();
                    }

                    remain -= read;
                }

                

                remain = iv.Length;

                while (remain != 0)
                {
                    int read = fileStream.Read(iv, iv.Length - remain, remain);

                    if (read == 0)
                    {
                        throw new EndOfStreamException();
                    }

                    remain -= read;
                }

                cipher.IV = iv;

                using (var cryptoStream =
                    new CryptoStream(tempFile, cipher.CreateDecryptor(), CryptoStreamMode.Write))
                {
                    fileStream.CopyTo(cryptoStream);
                }
            }

            File.Delete(filePath);
            File.Move(tempFileName, filePath);
        }
    }
}
