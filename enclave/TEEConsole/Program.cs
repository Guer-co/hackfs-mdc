using System;
using System.IO;
using System.Threading;
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
            /// Upload file to IPFS
            /// </summary>
            UploadFile,

            /// <summary>
            /// Download from IPFS
            /// </summary>
            DownloadFile,

            /// <summary>
            /// 
            /// </summary>
            EncryptFile,

            /// <summary>
            /// 
            /// </summary>
            DecryptFile,

            /// <summary>
            /// 
            /// </summary>
            UploadToServerless,

            /// <summary>
            /// 
            /// </summary>
            DownloadFromServerless,
        };

        class Action
        {
            public ActionType ActionType { get; set; }

            public string SourceFilePath { get; set; }

            public string TargetFilePath { get; set; }

            public string IpfsHash { get; set; }

            public string Key { get; set; }

            public string Vector { get; set; }
        }

        private ActionType ParseActionType(string arg)
        {
            switch (arg.ToLower())
            {
                case "-up":
                    return ActionType.UploadFile;
                case "-do":
                    return ActionType.DownloadFile;
                case "-en":
                    return ActionType.EncryptFile;
                case "-de":
                    return ActionType.DecryptFile;
                default:
                    throw new NotSupportedException($"Invalid action flag '{arg}'.");
            }
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
                case ActionType.UploadFile:
                case ActionType.EncryptFile:
                case ActionType.DecryptFile:
                    action.SourceFilePath = CheckFile(args[1]);

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
                    }

                    break;
                case ActionType.DownloadFile:
                    action.IpfsHash = args[1];
                    action.TargetFilePath = args[2];
                    break;
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

        private async Task EncryptFileAsync(Action action)
        {
            var primitive = new AES128Primitive();
            var keyInfo = new KeyInfo(action.Key, action.Vector);

            await primitive.EncryptFileAsync(action.SourceFilePath,
                keyInfo);
            
            Console.WriteLine($"Successfully encrypted file '{action.SourceFilePath}' with {keyInfo}");
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
                    case ActionType.UploadFile:
                        await program.ProcessFileUploadAsync(action);
                        break;
                    case ActionType.DownloadFile:
                        await program.ProcessFileDownloadAsync(action);
                        break;
                    case ActionType.EncryptFile:
                        await program.EncryptFileAsync(action);
                        break;
                    case ActionType.DecryptFile:
                        await program.DecryptFileAsync(action);
                        break;
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
