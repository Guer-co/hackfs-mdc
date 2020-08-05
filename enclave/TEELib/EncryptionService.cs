using System;
using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;
using Microsoft.Extensions.Logging;
using TEELib.Messages;
using TEELib.Primitives;
using TEELib.Storage;

namespace TEELib
{
    public class EncryptionService : IEncryptionService
    {
        private readonly IHMACPrimitive _hMACPrimitive;
        private readonly IIpfsService _ipfsService;
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

        public EncryptionService(IHMACPrimitive hMACPrimitive, IIpfsService ipfsService,
            IAES128Primitive aES128Primitive)
        {
            _hMACPrimitive = hMACPrimitive;
            _ipfsService = ipfsService;
            _aES128Primitive = aES128Primitive;
        }

        #endregion

        #region IEncryptionService

        public async Task<OriginalContentProcessedMessage> ProcessOriginalContentAsync(Stream sourceStream,
            string blobName, ILogger logger)
        {
            var message = new OriginalContentProcessedMessage();

            logger.LogInformation($"Generating HMAC key for signing {blobName}.");

            message.SigningKey = _hMACPrimitive.GenerateHmacKey();
            
            using (var signedStream = await _hMACPrimitive.SignStreamAsync(message.SigningKey,
                sourceStream))
            {
                logger.LogInformation($"Signing {blobName}.");

                // Set the position at the beginning of both streams
                signedStream.Position = 0;
                sourceStream.Position = 0;

                // Upload HMAC to IPFS
                message.SignedContentIpfsAddress = await _ipfsService.UploadStreamAsync(signedStream, GetIpfsMetadata(blobName));

                logger.LogInformation($"Persisted signature for {blobName}.");
            }

            var keyInfo = new KeyInfo();
            message.EncryptionKey = keyInfo.Key;
            message.Vector = keyInfo.Vector;

            message.EncryptedStream = await _aES128Primitive.EncryptStreamAsync(sourceStream, keyInfo);

            logger.LogInformation($"Encrypted {blobName}. Ready for decentralized storage.");

            return message;
        }

        public async Task<ReencryptedContentProcessedMessage> ProcessContentForViewingAsync(Stream encryptedStream,
            byte[] encryptionKey, byte[] vector, byte[] signingKey, string signatureAddress, ILogger logger)
        {
            logger.LogInformation("Obtaining signed content");

            // Get Signed Content from IPFS
            var signedContent = await _ipfsService.DownloadContentAsync(signatureAddress);

            // Reset position to first byte
            signedContent.Position = 0;

            var message = new ReencryptedContentProcessedMessage();

            message.ContentIsValid = await _hMACPrimitive.IsSignatureValidAsync(signingKey,
                signedContent);

            logger.LogInformation("Validating content.");

            if (message.ContentIsValid)
            {
                var keyInfo = new KeyInfo(encryptionKey, vector);

                // Unencrypt
                var originalContentStream = await _aES128Primitive.DecryptStreamAsync(encryptedStream, keyInfo);
                originalContentStream.Position = 0;

                logger.LogInformation("Unencrypted original content.");

                // Rencrypt
                keyInfo = new KeyInfo();
                message.EncryptionKey = keyInfo.Key;
                message.Vector = keyInfo.Vector;
                message.EncryptedStream = await _aES128Primitive.EncryptStreamAsync(originalContentStream,
                    keyInfo);

                logger.LogInformation("Reencrypted original content.");
            }

            return message;
        }

        #endregion
    }
}
