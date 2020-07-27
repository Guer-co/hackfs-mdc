// SPDX-License-Identifier: MIT
pragma solidity >=0.4.17 <0.7.0;
pragma experimental ABIEncoderV2;

import "./lib/OpenZeppelin/SafeMath.sol";

contract User {
    using SafeMath for uint256;

    mapping(address => bool) subscribedTo;
    uint numberOfSubscribed;

    address[] purchased;
    uint createdDate;
    address ownerAddress;
    address userContractAddress;
    string name;
    string email;

    constructor(string memory _name, string memory _email) public {
        ownerAddress = msg.sender;
        createdDate = now;
        userContractAddress = address(this);
        name = _name;
        email = _email;
    }

    function getUserProfile() public view returns(address, string memory, string memory, uint256) {
        return (userContractAddress, name, email, createdDate);
    }

    function getPurchased() public view returns (address[] memory) {
        return purchased;
    }

    function purchase(address _content) public {
        purchased.push(_content);
    }

    function subscribe(address _publisher) public {
        subscribedTo[_publisher] = true;
    }

    function unsubscribe(address _publisher) public {
        subscribedTo[_publisher] = false;
    }
}
