// SPDX-License-Identifier: MIT
pragma solidity >=0.4.17 <0.7.0;

contract Simple {

// I  feel like this contract should work to create other contracts
// The primary purpose of this contract would be to launch other contracts, and write to the database?
// We might need a 'simple_child' contract that this creates that just stores the content hash and database, and checks if someone trying to access the data can access it.

//whoever launches this contract - will be this wallet.
address simpleWallet;
    constructor() public {
        simpleWallet = msg.sender;
    }


    //just a check, should return address of creator
    function getCreatorAddress() public view returns(address){
        return simpleWallet;
    }

    //potential function needs

    //addUserToAccessDatabase

    //removeUserFromAccessDatabase

    //addContent

    //removeContent

    //



}
