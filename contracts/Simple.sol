// SPDX-License-Identifier: MIT
pragma solidity >=0.4.17 <0.7.0;
pragma experimental ABIEncoderV2;


contract Simple {
//This is the smart contract that the user creates, via gateway.sol

    address contractId;
    uint creationDate;
    uint public contentCount = 1;

    struct Content {
        string locationHash;
        string name;
        uint date;
        //guessing an array of addreses who can access this content is needed?? Still thinking on how to best store that info
    }

    mapping(uint => Content) public contentGroup;

    constructor() payable public {
        contractId = address(this);
        creationDate = now;
    }

    function addContent(string memory _contentHash, string memory _name) public {
        contentGroup[contentCount].locationHash = _contentHash;
        contentGroup[contentCount].name = _name;
        contentGroup[contentCount].date = now;
        contentCount ++;

    }

    function getContentCount() public view returns (uint) {
        return contentCount;
    }

    function getContentDetails(uint _id) public view returns (string memory, string memory, uint) {
        return (contentGroup[_id].locationHash, contentGroup[_id].name, contentGroup[_id].date);
    }

}
