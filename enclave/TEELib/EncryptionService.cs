using System;
using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;
using TEELib.Messages;
using TEELib.Primitives;
using TEELib.Storage;

namespace TEELib
{
    public class EncryptionService : IEncryptionService
    {
        private readonly IHMACPrimitive _hMACPrimitive;
        private readonly IUploader _uploader;
        private readonly IAES128Primitive _aES128Primitive;

        #region Private Implementation

        private Dictionary<string, string> GetIpfsMetadata(string blobName)
        {
            var fileInfo = new FileInfo(blobName);

            var metadata = new Dictionary<string, string>(1);
            metadata.Add("name", $"{fileInfo.Name}.enc");

            return metadata;
        }

        #endregion

        #region Constructor

        public EncryptionService(IHMACPrimitive hMACPrimitive, IUploader uploader,
            IAES128Primitive aES128Primitive)
        {
            _hMACPrimitive = hMACPrimitive;
            _uploader = uploader;
            _aES128Primitive = aES128Primitive;
        }

        #endregion

        #region IEncryptionService

        public async Task<OriginalContentProcessedMessage> ProcessOriginalContentAsync(Stream sourceStream,
            string blobName)
        {
            var message = new OriginalContentProcessedMessage();
            var primitive = new HMACPrimitive();

            message.SigningKey = primitive.GenerateHmacKey();

            using (var signedStream = await primitive.SignStreamAsync(message.SigningKey,
                sourceStream))
            {
                // Upload HMAC to IPFS
                var uploadSignature = _uploader.UploadStreamAsync(signedStream, GetIpfsMetadata(blobName));

                var keyInfo = new KeyInfo();

                message.SignedContentIpfsAddress = await uploadSignature;

                var encryptStream = _aES128Primitive.EncryptStreamAsync(sourceStream, keyInfo);

                message.EncryptionKey = keyInfo.Key;
                message.Vector = keyInfo.Vector;

                message.EncryptedStream = await encryptStream;
            }
            
            return message;
        }

        public async Task ProcessContentForViewing(Stream encryptedStream)
        {
            // Get AES128 Key and IV



            // Descrypt

            // Get Signing Key and Signed Message

            // Validate descrypted file

            // Rencrypt

            // Dispatch

            throw new NotImplementedException();
        }

        #endregion
    }
}
