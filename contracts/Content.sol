// SPDX-License-Identifier: MIT
pragma solidity >=0.4.17 <0.7.0;
pragma experimental ABIEncoderV2;
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
        string filename;
        string fileType;
        string title;
        string description;
        uint256 date;
        uint256 price;
        string publisherName;
        uint256 subscriptionPrice;
    }

    mapping(address => ContentInfo) public Info;

    fallback() external payable {}
    receive() external payable {}

    constructor(address payable _creator, string memory _contentHash, string memory _previewHash, string memory _filename, string memory _fileType, string memory _title, string memory _description,uint _price, string memory _name, uint256 _subscriptionPrice) payable public {
        ownerId = _creator;
        contractId = address(this);
        Info[contractId].locationHash = _contentHash;
        Info[contractId].previewHash = _previewHash;
        Info[contractId].filename = _filename;
        Info[contractId].title = _title;
        Info[contractId].description = _description;
        Info[contractId].fileType = _fileType;
        Info[contractId].date = now;
        Info[contractId].price = _price;
        Info[contractId].publisherName = _name;
        Info[contractId].subscriptionPrice = _subscriptionPrice;
        contentWhitelist[_creator] = true;
    }

    function getContentDetails() public view returns (string memory, string memory, string memory,string memory, string memory, string memory, uint, uint, address, string memory, uint256) {
        return (
            Info[contractId].locationHash,
            Info[contractId].previewHash,
            Info[contractId].filename,
            Info[contractId].fileType,
            Info[contractId].title,
            Info[contractId].description,
            Info[contractId].date,
            Info[contractId].price,
            ownerId,
            Info[contractId].publisherName,
            Info[contractId].subscriptionPrice
        );
    }

   function purchaseContent(address _consumer, uint256 _amount) payable public {
        require(_amount == Info[contractId].price, 'Amount sent is less than what this content is priced at. Please send the exact amount') ;
        earnings += msg.value;
        contentWhitelist[_consumer] = true;
   }

    function withdrawEarnings(uint _amount) public {
        require(_amount <= earnings, 'The amount you are trying to withdraw exceeds the contract earnings');
        earnings = earnings.sub(_amount);
        ownerId.transfer(_amount);
    }

    function isWhitelisted(address _consumer) public view returns (bool) {
        return (contentWhitelist[_consumer]);
    }
}