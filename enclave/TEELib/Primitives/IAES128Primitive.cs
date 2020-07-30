using System.IO;
using System.Threading.Tasks;

namespace TEELib.Primitives
{
    public interface IAES128Primitive
    {
        Task<Stream> EncryptStreamAsync(Stream inputStream, KeyInfo keyInfo);
    }
}
