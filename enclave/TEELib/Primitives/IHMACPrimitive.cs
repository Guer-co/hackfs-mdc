using System.IO;
using System.Threading.Tasks;

namespace TEELib.Primitives
{
    public interface IHMACPrimitive
    {
        byte[] GenerateHmacKey();

        Task<Stream> SignStreamAsync(byte[] secretKey, Stream sourceStream);

        Task<bool> IsSignatureValidAsync(byte[] secretKey, Stream signedStream);
    }
}
