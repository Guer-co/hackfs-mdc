using System.IO;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using TEELib.Messages;

namespace TEELib
{
    public interface IEncryptionService
    {
        Task<OriginalContentProcessedMessage> ProcessOriginalContentAsync(Stream sourceStream,
            string fileName, ILogger logger);

        Task<ReencryptedContentProcessedMessage> ProcessContentForViewingAsync(Stream encryptedStream,
            byte[] encryptionKey, byte[] vector, byte[] signingKey, string signatureAddress,
            ILogger logger);
    }
}
