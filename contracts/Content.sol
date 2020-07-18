// SPDX-License-Identifier: MIT
pragma solidity >=0.4.17 <0.7.0;
pragma experimental ABIEncoderV2;


contract Content {
//This is the smart contract that the user creates, via Publsher.sol

    address contractId;
    mapping(address => bool) whiteListed;

    struct ContentInfo {
        string locationHash;
        string name;
        uint date;
        //guessing an array of addreses who can access this content is needed?? Still thinking on how to best store that info
    }

    mapping(address => ContentInfo) public Content;

    constructor() public {
        contractId = address(this);
    }

    // Needs testing
    function addSubscribers(address[] _subscribers) public {
        for (uint i = 0; i < _subscribers.length; i++) {
            ContentInfo.whiteListed[_subscribers[i]];
        }
    }

    // Needs testing
    function addContent(string memory _contentHash, string memory _name) public {
        Content[contractId].locationHash = _contentHash;
        Content[contractId].name = _name;
        Content[contractId].date = now;
    }

    function getContentCount() public view returns (uint) {
        return contentCount;
    }

    function getContentDetails(uint _id) public view returns (string memory, string memory, uint) {
        return (contentGroup[_id].locationHash, contentGroup[_id].name, contentGroup[_id].date);
    }

    

}
