// SPDX-License-Identifier: MIT
pragma solidity >=0.4.17 <0.7.0;
pragma experimental ABIEncoderV2;

import "./lib/OpenZeppelin/SafeMath.sol";

contract User {
    using SafeMath for uint256;

    mapping(address => address[]) subscribedTo;

    address[] purchased;

    //needed functions

    //when subscribe, add to the map (so we can false it easily later)


    //when purchasing, just push to array because you will always own it then
    //function purchaseContent(address payable _contract, uint256 _amount) public returns (bool) {
    //    return Content(_contract).purchaseContent(msg.sender, _amount);
    //}
}
