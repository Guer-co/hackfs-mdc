using System.Collections.Generic;
using System.Threading.Tasks;

namespace TEELib.Storage
{
    public interface IUploader
    {
        Task<string> UploadFileAsync(string path, IDictionary<string, string> metadata = null);
    }
}
