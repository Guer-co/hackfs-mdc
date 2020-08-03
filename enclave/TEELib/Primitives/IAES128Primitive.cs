using System.IO;
using System.Threading.Tasks;

namespace TEELib.Primitives
{
    /// <summary>
    /// 
    /// </summary>
    public interface IAES128Primitive
    {
        /// <summary>
        /// 
        /// </summary>
        /// <param name="inputStream"></param>
        /// <param name="keyInfo"></param>
        /// <returns></returns>
        Task<Stream> EncryptStreamAsync(Stream inputStream, KeyInfo keyInfo);

        /// <summary>
        /// 
        /// </summary>
        /// <param name="inputStream"></param>
        /// <param name="keyInfo"></param>
        /// <returns></returns>
        Task<Stream> DecryptStreamAsync(Stream inputStream, KeyInfo keyInfo);
    }
}
