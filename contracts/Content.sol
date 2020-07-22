// SPDX-License-Identifier: MIT
pragma solidity >=0.4.17 <0.7.0;
pragma experimental ABIEncoderV2;

import './Owned.sol';
import './lib/OpenZeppelin/SafeMath.sol';

contract Content is Owned {
    using SafeMath for uint;

    address ownerId;
    address contractId;
    uint earnings;

    struct ContentInfo {
        string locationHash;
        string name;
        uint256 date;
        bool free;
        uint256 price;
    }

    mapping(address => ContentInfo) public Info;

    constructor(string memory _contentHash, string memory _name, bool _free, uint _price) public {
        ownerId = msg.sender;
        contractId = address(this);
        Info[contractId].locationHash = _contentHash;
        Info[contractId].name = _name;
        Info[contractId].date = now;
        Info[contractId].free = _free;
        Info[contractId].price = _price;
    }

    function getContentDetails() public view returns (string memory, string memory, uint, bool, uint) {
        return (
            Info[contractId].locationHash,
            Info[contractId].name,
            Info[contractId].date,
            Info[contractId].free,
            Info[contractId].price
        );
    }

   function purchaseContent(address _consumer, uint256 _amount) public payable returns (bool) {
       require(_amount == Info[contractId].price, 'Amount sent is less than what this content is priced at. Please send the exact amount') ;
       earnings += msg.value;
       return true;
   }

   //need a function to checkwhitelist of parent (publisher) contract.
//need a function to checkwhitelist of parent (publisher) contract.
//need a function to checkwhitelist of parent (publisher) contract.


   //// WIP
   //function getFile() public view returns (string memory) {
   //    // if Info[contractId].paid == "free" ||
   //        return "file"; //placeholder
   //        //decrypt the content at locationhash and serve to customer?
   //        //I know the hash is currently available in the struct, but we are trying to make it secure, so something like this will be needed
   //    }
   //}

   //function withdrawEarnings(address payable _to, uint _amount) public onlyOwner {
   //    require(_amount <= earnings, 'The amount you are trying to withdraw exceeds the contract earnings');
   //    earnings = earnings.sub(_amount);
   //    _to.transfer(_amount);
   //}

    receive() external payable {
    }
}
