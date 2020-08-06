using System.IO;
using System.Threading.Tasks;
using TEELib.Storage;
using Xunit;

namespace TEELib.UnitTests.Storage
{
    public class IpfsServiceUnitTests
    {
        [Fact]
        public async Task TestFileUploadAsync()
        {            
            var service = new IpfsService();
            
            var cid = await service.UploadFileAsync("hmac-demo.mp4");

            Assert.False(string.IsNullOrWhiteSpace(cid));

            const string NEW_LOCATION = "../../hmac-demo.mp4";

            await service.DownloadFile(cid, NEW_LOCATION);

            Assert.True(File.Exists(NEW_LOCATION));
        }

        [Fact]
        public async Task TestStreamUploadAsync()
        {
            var service = new IpfsService();

            using (var originalStream = File.Open("hmac-demo.mp4", FileMode.Open))
            {
                var cid = await service.UploadStreamAsync(originalStream);
                Assert.False(string.IsNullOrWhiteSpace(cid));

                using (var downloadStream = await service.DownloadContentAsync(cid))
                {
                    Assert.True(downloadStream.CanSeek);
                }                
            }
        }            
    }
}