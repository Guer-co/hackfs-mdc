// SPDX-License-Identifier: MIT
pragma solidity >=0.4.17 <0.7.0;
pragma experimental ABIEncoderV2;

import './Owned.sol';
import './lib/OpenZeppelin/SafeMath.sol';

contract Content is Owned {
    using SafeMath for uint;
    //This is the smart contract that the user creates, via Publsher.sol
    //assume every function needs testing

    address contractId;
    uint earnings;
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
            Info[contractId].accessType,
            Info[contractId].price
        );
    }

    function whiteList(address _newUser) public onlyOwner returns (bool) {
        numberOfWhitelisted++;
        whiteListed[_newUser] = true;
        return true;
    }

    function removeFromWhiteList(address _newUser) public onlyOwner returns (bool) {
        numberOfWhitelisted--;
        whiteListed[_newUser] = false;
        return true;
    }

    function purchaseContent(address _consumer, uint256 _amount) public payable returns (bool) {
        require(_amount == Info[contractId].price, 'Amount sent is less than what this content is priced at. Please send the exact amount') ;
        earnings += msg.value;
        whiteListed[_consumer] = true;
        return true;
    }

    // WIP
    function getFile() public view returns (string memory) {
        // if Info[contractId].accessType == "free" ||
        if (whiteListed[msg.sender] == true) {
            return "file"; //placeholder
            //decrypt the content at locationhash and serve to customer?
            //I know the hash is currently available in the struct, but we are trying to make it secure, so something like this will be needed
        }
    }

    function withdrawEarnings(address payable _to, uint _amount) public onlyOwner {
        require(_amount <= earnings, 'The amount you are trying to withdraw exceeds the contract earnings');
        earnings = earnings.sub(_amount);
        _to.transfer(_amount);
    }

    receive() external payable {
        purchaseContent();
    }
}
