using System.IO;
using System.Threading.Tasks;
using TEELib.Messages;

namespace TEELib
{
    public interface IEncryptionService
    {
        Task<OriginalContentProcessedMessage> ProcessOriginalContentAsync(Stream sourceStream,
            string fileName);

        Task<ReecnryptedContentProcessedMessage> ProcessContentForViewingAsync(Stream encryptedStream,
            byte[] encryptionKey, byte[] vector, byte[] signingKey, string signatureAddress);
    }
}
