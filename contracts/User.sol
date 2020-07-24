// SPDX-License-Identifier: MIT
pragma solidity >=0.4.17 <0.7.0;
pragma experimental ABIEncoderV2;

import "./lib/OpenZeppelin/SafeMath.sol";

contract User {
    using SafeMath for uint256;

    mapping(address => address[]) subscribedTo;

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

    //needed functions

    //when subscribe, add to the map (so we can false it easily later)


    //when purchasing, just push to array because you will always own it then
    //function purchaseContent(address payable _contract, uint256 _amount) public returns (bool) {
    //    return Content(_contract).purchaseContent(msg.sender, _amount);
    //}
}
