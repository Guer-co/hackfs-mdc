// SPDX-License-Identifier: MIT
pragma solidity >=0.4.17 <0.7.0;
pragma experimental ABIEncoderV2;
import './Content.sol';

contract Publisher {


    struct publisherProfile{
        address id;
        string name;
        string email;
        string logo;
        address[] subscribers;
        mapping(address => address[]) contentContracts;
    }

    mapping(address => publisherProfile) public profile;

    function updatePublisherProfile(string memory _name, string  memory _email, string memory _logo) public {
        profile[msg.sender].name = _name;
        profile[msg.sender].email = _email;
        profile[msg.sender].logo = _logo;
    }

    function getContentContracts(address _user) public view returns (address[] memory){
        return profile[msg.sender].contentContracts[_user];
    }

    ////// ******* Here we start to write functions that interact with the Content.sol ******* //////
    ////// ******* Here we start to write functions that interact with the Content.sol ******* //////
    ////// ******* Here we start to write functions that interact with the Content.sol ******* //////

    function createContent(string memory _contentHash, string memory _name, string memory _accessType) public {
            Content contractId = new Content(_contentHash, _name, _accessType);
            profile[msg.sender].contentContracts[msg.sender].push(address(contractId));
            // Content(contractId).addSubscribers(); // incomplete
    }

    function getContentInformation(address _contract) public view returns (string memory, string memory, uint) {
        return Content(_contract).getContentDetails();
    }

    function getFile(address _contract) public view returns (string memory) {
        return Content(_contract).getFile();
    }

    function addSubscribersToContent(address _contract) public returns (bool) {
        return Content(_contract).addSubscribers(profile[msg.sender].subscribers);
    }

    function addPayorToWhitelist(address _contract, address _payor, uint256 _amount) public returns (bool) {
        return Content(_contract).addPurchaser(_payor, _amount);
    }

    function getContractFile(address _contract) public view returns (string memory) {
        return Content(_contract).getFile();
    }
}
