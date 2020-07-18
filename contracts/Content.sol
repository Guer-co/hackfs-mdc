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

    mapping(address => ContentInfo) public ContentMap;

    constructor() payable public {
        contractId = address(this);
    }

    // Needs testing
    function addSubscribers(address[] memory _subscribers) public {
        for (uint i = 0; i < _subscribers.length; i++) {
            whiteListed[_subscribers[i]];
        }
    }

    // Needs testing
    function addContent(string memory _contentHash, string memory _name) public {
        ContentMap[contractId].locationHash = _contentHash;
        ContentMap[contractId].name = _name;
        ContentMap[contractId].date = now;
    }

    function getContentDetails(uint _id) public view returns (string memory, string memory, uint) {
        return (ContentMap[contractId].locationHash, ContentMap[contractId].name, ContentMap[contractId].date);
    }
}
