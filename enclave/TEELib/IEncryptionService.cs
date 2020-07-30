using System.IO;
using System.Threading.Tasks;
using TEELib.Messages;

namespace TEELib
{
    public interface IEncryptionService
    {
        Task<OriginalContentProcessedMessage> ProcessOriginalContentAsync(Stream sourceStream,
            string fileName);
    }
}
