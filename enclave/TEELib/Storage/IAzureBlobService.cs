using System.Collections.Generic;
using System.Threading.Tasks;

namespace TEELib.Storage
{
    public interface IAzureBlobService : IUploader
    {
        bool FileExists(string containerName, string fileName);

        Task<IDictionary<string, string>> DownloadFileAsync(string containerName,
            string fileName); 
    }
}