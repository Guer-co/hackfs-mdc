// SPDX-License-Identifier: MIT
pragma solidity >=0.4.17 <0.7.0;
pragma experimental ABIEncoderV2;


contract Content {
//This is the smart contract that the user creates, via Publsher.sol
//assume every function needs testing

    address contractId;
    mapping(address => bool) whiteListed;
    address owner;
    uint totalCollected;

    struct ContentInfo {
        string locationHash;
        string name;
        uint date;
        string accessType; //free, onepayment, subscription, budget
        //guessing an array of addreses who can access this content is needed?? Still thinking on how to best store that info
    }

    mapping(address => ContentInfo) public ContentMap;

    constructor(string memory _contentHash, string memory _name, string memory _accessType) public {
        contractId = address(this);
        ContentMap[contractId].locationHash = _contentHash;
        ContentMap[contractId].name = _name;
        ContentMap[contractId].date = now;
        ContentMap[contractId].accessType = _accessType;

        owner = msg.sender; // hoping msg.sender passes through so we can store the address of the creator
    }

    function getContentDetails() public view returns (string memory, string memory, uint) {
        return (ContentMap[contractId].locationHash, ContentMap[contractId].name, ContentMap[contractId].date);
    }

    function addSubscribers(address[] memory _subscribers) public returns (bool) {
        for (uint i = 0; i < _subscribers.length; i++) {
            whiteListed[_subscribers[i]] = true;
        }
        return true;
    }

    function addPurchaser(address _payor, uint256 _amount) public returns (bool) {
        payable(owner).call.value(_amount)("");
        whiteListed[_payor] = true;
        totalCollected = totalCollected + _amount;
        return true;
    }

    function getFile() public view returns (string memory){
        // if ContentMap[contractId].accessType == "free" ||
        if (whiteListed[msg.sender] == true){
            return "file"; //placeholder
            //decrypt the content at locationhash and serve to customer?
            //I know the hash is currently available in the struct, but we are trying to make it secure, so something like this will be needed
        }
    }


}
