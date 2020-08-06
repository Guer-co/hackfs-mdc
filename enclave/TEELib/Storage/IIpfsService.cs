using System.IO;
using System.Threading.Tasks;

namespace TEELib.Storage
{
    public interface IIpfsService : IUploader
    {
        Task<Stream> DownloadContentAsync(string ipfsHash);
    }
}
