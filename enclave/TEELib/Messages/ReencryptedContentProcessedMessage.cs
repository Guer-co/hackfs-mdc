using System;
using System.IO;

namespace TEELib.Messages
{
    public class ReencryptedContentProcessedMessage
    {
        public Stream EncryptedStream { get; set; }

        public byte[] EncryptionKey { get; set; }

        public byte[] Vector { get; set; }

        public bool ContentIsValid { get; set; }
    }
}