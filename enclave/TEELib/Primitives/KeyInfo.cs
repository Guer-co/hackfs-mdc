using System;
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

        #region Constructors

        /// <summary>
        /// Creates the Key and Initializing Vector by default
        /// </summary>
        public KeyInfo()
        {
            using var myAes = Aes.Create();
            Key = myAes.Key;
            Vector = myAes.IV;
        }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="key"></param>
        /// <param name="vector"></param>
        public KeyInfo(string key, string vector)
        {
            Key = Convert.FromBase64String(key);
            Vector = Convert.FromBase64String(vector);
        }

        /// <summary>
        /// 
        /// </summary>
        /// <param name="key"></param>
        /// <param name="vector"></param>
        public KeyInfo(byte[] key, byte[] vector)
        {
            Key = key;
            Vector = vector;
        }

        #endregion

        public override string ToString()
        {
            return $"Key: '{Convert.ToBase64String(Key)}' Vector: '{Convert.ToBase64String(Vector)}'";
        }
    }
}