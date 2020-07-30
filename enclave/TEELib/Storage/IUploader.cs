using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;

namespace TEELib.Storage
{
    /// <summary>
    /// 
    /// </summary>
    public interface IUploader
    {
        /// <summary>
        /// Uploads a stream to the storage in context
        /// </summary>
        /// <param name="stream"></param>
        /// <param name="metadata"></param>
        /// <returns></returns>
        Task<string> UploadStreamAsync(Stream stream, IDictionary<string, string> metadata = null);

        /// <summary>
        /// Uploads a file to the storage in context
        /// </summary>
        /// <param name="path"></param>
        /// <param name="metadata"></param>
        /// <returns></returns>
        Task<string> UploadFileAsync(string path, IDictionary<string, string> metadata = null);
    }
}
