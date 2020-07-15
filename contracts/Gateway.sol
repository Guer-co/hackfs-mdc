// SPDX-License-Identifier: MIT
pragma solidity >=0.4.17 <0.7.0;
pragma experimental ABIEncoderV2;
import './Simple.sol';

contract Gateway {
// the primary purpose of this contract is to launch contracts for users
// user hits gateway, gateway points them where they need to go.

    constructor() public {
        pay3wallet = msg.sender;
    }

    address payable pay3wallet;

    mapping(address => address[]) userContracts;

    struct userProfile{
        address id;
        string entity;
        string email;
        string logo;
    }

    mapping(address => userProfile) public profile;

    function updateUserProfile(string memory _name, string  memory _email, string memory _logo) public payable {
        profile[msg.sender] = userProfile(msg.sender, _name, _email, _logo);
    }

    //just a check, should return our address, we launched this contract
    function getCreatorAddress() public view returns(address){
        return pay3wallet;
    }

    function getUserContracts(address _user) public view returns (address[] memory){
        return (userContracts[_user]);
    }

////////////////////////////// ******* OK here we start to write functions that interact with the Simple.sol ******* ///////////////////////////////////////
////////////////////////////// ******* OK here we start to write functions that interact with the Simple.sol ******* ///////////////////////////////////////
////////////////////////////// ******* OK here we start to write functions that interact with the Simple.sol ******* ///////////////////////////////////////

    function createSimple() public payable {
            Simple contractid = new Simple();
            userContracts[msg.sender].push(address(contractid));
    }

    function doAddContent(address payable _contract, string memory _contenthash, string memory _name) public {
        Simple(_contract).addContent(_contenthash, _name);
    }

    function doGetContentCount(address payable _contract) public view returns (uint) {
        return Simple(_contract).getContentCount();
    }

    function doGetContent(address payable _contract, uint _id) public view returns (string memory, string memory, uint) {
        return Simple(_contract).getContentDetails(_id);
    }

    //removeUserFromAccessDatabase
    
    //unsure on exactly how this will work at this moment
    //



}
