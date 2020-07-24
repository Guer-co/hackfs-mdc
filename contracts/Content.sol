// SPDX-License-Identifier: MIT
pragma solidity >=0.4.17 <0.7.0;
pragma experimental ABIEncoderV2;
import './Publisher.sol';
import './lib/OpenZeppelin/SafeMath.sol';

contract Content {
    using SafeMath for uint;

    address payable ownerId;
    address contractId;
    uint earnings;
    mapping(address => bool) public contentWhitelist;

    struct ContentInfo {
        string locationHash;
        string previewHash;
        string name;
        string fileType;
        string title;
        string description;
        uint256 date;
        bool free;
        uint256 price;
    }

    mapping(address => ContentInfo) public Info;

    fallback() external payable {}
    receive() external payable {}

    constructor(string memory _contentHash, string memory _previewHash, string memory _name, string memory _fileType, string memory _title, string memory _description, bool _free, uint _price) payable public{
        ownerId = msg.sender;
        contractId = address(this);
        Info[contractId].locationHash = _contentHash;
        Info[contractId].previewHash = _previewHash;
        Info[contractId].name = _name;
        Info[contractId].title = _title;
        Info[contractId].description = _description;
        Info[contractId].fileType = _fileType;
        Info[contractId].date = now;
        Info[contractId].free = _free;
        Info[contractId].price = _price;
    }

    function getContentDetails() public view returns (string memory, string memory, string memory,string memory, uint, bool, uint) {
        return (
            Info[contractId].locationHash,
            Info[contractId].previewHash,
            Info[contractId].name,
            Info[contractId].fileType,
            Info[contractId].date,
            Info[contractId].free,
            Info[contractId].price
        );
    }

   function purchaseContent(address _consumer, uint256 _amount) payable public returns (bool) {
        require(_amount == Info[contractId].price, 'Amount sent is less than what this content is priced at. Please send the exact amount') ;
        earnings += msg.value;
        contentWhitelist[_consumer] = true;
        return true;
   }


    function getFile(address _consumer) public view returns (string memory) {
        if (Info[contractId].free == true){
            if(contentWhitelist[_consumer] == true) {
                return Info[contractId].previewHash; //probablyso it can be decrypted I guess.
            }
        }
    }

    function withdrawEarnings(uint _amount) public {
        require(_amount <= earnings, 'The amount you are trying to withdraw exceeds the contract earnings');
        earnings = earnings.sub(_amount);
        ownerId.transfer(_amount);
    }

    function checkPublisherWhitelist(address _consumer) public view returns (bool) {

        Publisher(ownerId).getSubscribers();
    }

}