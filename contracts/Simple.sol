// SPDX-License-Identifier: MIT
pragma solidity >=0.4.17 <0.7.0;
pragma experimental ABIEncoderV2;


contract Simple {
//This is the smart contract that the user creates, via gateway.sol

    address contractid;
    uint creationDate;
    uint public contentCount;

    struct Content {
        string locationhash;
        string name;
        uint date;
        //guessing an array of addreses who can access this content is needed?? Still thinking on how to best store that info
    }

    mapping(uint => Content) public contentgroup;

    constructor() payable public {
        contractid = address(this);
        creationDate = now;
    }

    function addContent(string memory _contenthash, string memory _name) public {
        contentCount ++;
        contentgroup[contentCount].locationhash = _contenthash;
        contentgroup[contentCount].name = _name;
        contentgroup[contentCount].date = now;
    }

    function getContentCount() public view returns (uint) {
        return contentCount;
    }

    function getContentDetails(uint _id) public view returns (string memory, string memory, uint) {
        return (contentgroup[_id].locationhash, contentgroup[_id].name, contentgroup[_id].date);
    }

}
