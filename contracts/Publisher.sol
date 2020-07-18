// SPDX-License-Identifier: MIT
pragma solidity >=0.4.17 <0.7.0;
pragma experimental ABIEncoderV2;
import './Content.sol';

contract Publisher {
// the primary purpose of this contract is to launch contracts for users
// user hits gateway, gateway points them where they need to go.
    address payable owner;
    address[] subscribers;
    mapping(address => address[]) contentContracts;

    constructor() public {
        owner = msg.sender;        
    }

    struct publisherProfile{
        address id;
        string name;
        string email;
        string logo;
    }

    mapping(address => publisherProfile) public profile;

    // needs testing
    function updatePublisherProfile(string memory _name, string  memory _email, string memory _logo) public {
        profile[msg.sender] = publisherProfile(msg.sender, _name, _email, _logo);
    }

    //just a check, should return our address, we launched this contract
    function getCreatorAddress() public view returns(address){
        return owner;
    }

    function getContentContracts(address _user) public view returns (address[] memory){
        return contentContracts[_user];
    }

////////////////////////////// ******* OK here we start to write functions that interact with the Content.sol ******* ///////////////////////////////////////
////////////////////////////// ******* OK here we start to write functions that interact with the Content.sol ******* ///////////////////////////////////////
////////////////////////////// ******* OK here we start to write functions that interact with the Content.sol ******* ///////////////////////////////////////

    function createContent() public {
            Content contractId = new Content();
            contentContracts[msg.sender].push(address(contractId));
            // Content(contractId).addSubscribers(); // incomplete
    }

    function doAddContent(address payable _contract, string memory _contenthash, string memory _name) public {
        Content(_contract).addContent(_contenthash, _name);
    }


    function doGetContent(address payable _contract, uint _id) public view returns (string memory, string memory, uint) {
        return Content(_contract).getContentDetails(_id);
    }

    //removeUserFromAccessDatabase
    
    //unsure on exactly how this will work at this moment
    //



}
