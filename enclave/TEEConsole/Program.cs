using System;
using System.Collections.Generic;
using System.Linq;
using System.IO;
using System.Threading.Tasks;
using TEELib.Primitives;
using TEELib.Storage;

namespace TEEConsole
{
    class Program
    {
        enum ActionType
        {
            Undefined,

            /// <summary>
            /// Upload original content to Azure Blob for encryption
            /// </summary>
            EncryptFile,

            /// <summary>
            /// Download file from encrypted location
            /// </summary>
            DownloadEncryptedFile,

            /// <summary>
            /// Content needs to be reencrypted for viewing
            /// </summary>
            ReEncryptFile,

            /// <summary>
            /// Download file from re-encrypted location
            /// </summary>
            DownloadReEncryptedFile,
        };

        private ActionType ParseActionType(string arg)
        {
            switch (arg.ToLower())
            {
                case "-en":
                    return ActionType.EncryptFile;
                case "-doe":
                    return ActionType.DownloadEncryptedFile;
                case "-ren":
                    return ActionType.ReEncryptFile;
                case "-dor":
                    return ActionType.DownloadReEncryptedFile;
                default:
                    throw new NotSupportedException($"Invalid action flag '{arg}'.");
            }
        }

        private Dictionary<string, string> GetContainerNameMetadata(string containerName)
        {
            var dictionary = new Dictionary<string, string>(1);

            dictionary.Add("containerName", containerName);

            return dictionary;
        }

        private async Task EncryptFileAsync(Action action)
        {
            const string CONTAINER = "original-content";

            // Upload file to Azure Blob
            var service = new AzureBlobService();

            var etag = await service.UploadFileAsync(action.SourceFilePath,
                GetContainerNameMetadata(CONTAINER));

            var fileName = new FileInfo(action.SourceFilePath).Name;            

            while (!service.FileExists("encrypted-content", fileName)) ;

            //var metadata 



            // Download file
            Console.WriteLine($"Successfully encrypted file '{action.SourceFilePath}' with {string.Empty}");
        }

        class Action
        {
            public ActionType ActionType { get; set; }

            public string SourceFilePath { get; set; }

            public string TargetFilePath { get; set; }

            public string IpfsHash { get; set; }

            public string Key { get; set; }

            public string Vector { get; set; }
        }

        private string CheckFile(string path)
        {
            var info = new FileInfo(path);

            if (!info.Exists)
            {
                throw new ApplicationException($"Unable to find file '{path}'.");
            }

            return path;
        }

        private Action ParseArgs(string[] args)
        {
            if (args.Length < 2)
            {
                throw new ArgumentException("Invalid number of CLI args.");
            }

            var action = new Action()
            {
                ActionType = ParseActionType(args[0])
            };

            switch (action.ActionType)
            {
                case ActionType.EncryptFile:
                
                    action.SourceFilePath = CheckFile(args[1]);
                    /*
                    if (action.ActionType == ActionType.EncryptFile)
                    {
                        if (args.Length < 4)
                        {
                            // Produce Key and IV randomly
                            var keyInfo = new KeyInfo();

                            action.Key = Convert.ToBase64String(keyInfo.Key);
                            action.Vector = Convert.ToBase64String(keyInfo.Vector);
                        }
                        else
                        {
                            action.Key = args[2];
                            action.Vector = args[3];
                        }
                    }
                    if (action.ActionType == ActionType.DecryptFile)
                    {
                        if (args.Length < 4)
                        {
                            throw new ArgumentException("Invalid number of Decryption args.");
                        }
                        else
                        {
                            action.Key = args[2];
                            action.Vector = args[3];
                        }
                    }*/

                    break;
                /*case ActionType.DownloadFile:
                    action.IpfsHash = args[1];
                    action.TargetFilePath = args[2];
                    break;*/
                default:
                    throw new NotSupportedException();
            }

            

            return action;
        }

        private async Task ProcessFileUploadAsync(Action action)
        {
            var service = new IpfsService();

            var hashCode = await service.UploadFileAsync(action.SourceFilePath);

            Console.WriteLine($"Successfully uploaded file with hash '{hashCode}'.");
        }

        private async Task ProcessFileDownloadAsync(Action action)
        {
            var service = new IpfsService();

            await service.DownloadFile(action.IpfsHash, action.TargetFilePath);

            Console.WriteLine($"Successfully download file with hash '{action.IpfsHash}'.");
        }

        

        private async Task DecryptFileAsync(Action action)
        {
            var primitive = new AES128Primitive();
            var keyInfo = new KeyInfo(action.Key, action.Vector);

            await primitive.DecryptFileAsync(action.SourceFilePath,
                keyInfo);

            Console.WriteLine($"Successfully decrypted file '{action.SourceFilePath}'.");
        }

        static async Task Main(string[] args)
        {            
            try
            {
                var program = new Program();

                var action = program.ParseArgs(args);

                switch (action.ActionType)
                {
                    case ActionType.EncryptFile:
                        await program.EncryptFileAsync(action);
                        break;
                    /*case ActionType.DownloadFile:
                        await program.ProcessFileDownloadAsync(action);
                        break;
                    case ActionType.EncryptFile:
                        await program.EncryptFileAsync(action);
                        break;
                    case ActionType.DecryptFile:
                        await program.DecryptFileAsync(action);
                        break;
                    case ActionType.UploadToServerless:
                        await program.UploadFileToServerlessAsync(action);
                        break;*/
                    default:
                        throw new NotSupportedException("Undefined action.");
                }
                
                Console.WriteLine("Trusted Execution Environment CLI completed.");
            }
            catch (Exception exc)
            {
                Console.WriteLine($"Abnormal End: {exc.Message}");
            }
        }
    }
}
