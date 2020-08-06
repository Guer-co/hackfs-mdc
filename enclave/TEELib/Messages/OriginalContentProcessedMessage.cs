using System.IO;

namespace TEELib.Messages
{
    public class OriginalContentProcessedMessage
    {
        public byte[] SigningKey { get; set; }

        public string SignedContentIpfsAddress { get; set; }

        public Stream EncryptedStream { get; set; }

        public byte[] EncryptionKey { get; set; }
        
        public byte[] Vector { get; set; }
    }
}
