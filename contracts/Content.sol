// SPDX-License-Identifier: MIT
pragma solidity >=0.4.17 <0.7.0;
pragma experimental ABIEncoderV2;

import './lib/OpenZeppelin/Ownable.sol';

contract Content is Ownable {
    using SafeMath for uint;
    //This is the smart contract that the user creates, via Publsher.sol
    //assume every function needs testing

    address contractId;
    uint256 totalCollected;
    mapping(address => bool) whiteListed;
    uint256 numberOfWhitelisted = 0;

    struct ContentInfo {
        string locationHash;
        string name;
        uint256 date;
        string accessType; //free, onepayment, subscription, budget
        uint256 price;
        //guessing an array of addreses who can access this content is needed?? Still thinking on how to best store that info
    }

    mapping(address => ContentInfo) public Info;

    constructor(string memory _contentHash, string memory _name, string memory _accessType, uint _price, address[] _subscribers) public {
        contractId = address(this);
        Info[contractId].locationHash = _contentHash;
        Info[contractId].name = _name;
        Info[contractId].date = now;
        Info[contractId].accessType = _accessType;

        if(_accessType == 'free') {
            Info[contractId].price = 0;
        } else {
            Info[contractId].price = _price;
        }

        numberOfWhitelisted = _subscribers.length;
        for (uint256 i = 0; i < _subscribers.length; i++) {
            whiteListed[_subscribers[i]] = true;
        }
    }

    function getContentDetails() public view returns (string memory, string memory, uint, string memory) {
        return (
            Info[contractId].locationHash,
            Info[contractId].name,
            Info[contractId].date,
            Info[contractId].accessType
        );
    }

    function whiteList(address _newUser) public onlyOwner returns (bool) {
        numberOfWhitelisted++;
        whiteListed[_newUser] = true;
        return true;
    }

    function remoteFromWhiteList(address _newUser) public onlyOwner returns (bool) {
        numberOfWhitelisted--;
        whiteListed[_newUser] = false;
        return true;
    }

    function addPurchaser(address _payor, uint256 _amount) public returns (bool) {
        payable(owner).call.value(_amount)("");
        whiteListed[_payor] = true;
        totalCollected = totalCollected + _amount;
        return true;
    }

    function getFile() public view returns (string memory) {
        // if Info[contractId].accessType == "free" ||
        if (whiteListed[msg.sender] == true) {
            return "file"; //placeholder
            //decrypt the content at locationhash and serve to customer?
            //I know the hash is currently available in the struct, but we are trying to make it secure, so something like this will be needed
        }
    }
}
