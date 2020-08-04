// SPDX-License-Identifier: MIT
pragma solidity >=0.4.17 <0.7.0;
pragma experimental ABIEncoderV2;

import "./lib/OpenZeppelin/SafeMath.sol";
import "./Publisher.sol";

contract User {
    using SafeMath for uint256;

    mapping(address => bool) subscribedTo;
    uint numberOfSubscribed;

    address[] purchased;
    address[] subscribed;
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

    function getUserProfile() public view returns(address, string memory, string memory, uint256, address[] memory, address[] memory) {
        return (userContractAddress, name, email, createdDate,purchased, subscribed);
    }

    function getPurchased() public view returns (address[] memory) {
        return purchased;
    }

    function purchase(address _content) public {
        purchased.push(_content);
    }

    function subscribe(address _publisher) public {
        subscribedTo[_publisher] = true;
        subscribed.push(_publisher);
    }

    function unsubscribe(address _publisher) public {
        subscribedTo[_publisher] = false;
    }

}
