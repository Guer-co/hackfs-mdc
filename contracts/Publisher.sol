// SPDX-License-Identifier: MIT
pragma solidity >=0.4.17 <0.7.0;
pragma experimental ABIEncoderV2;
import './Content.sol';

contract Publisher {

    mapping(address => address[]) contentContracts;

    struct publisherProfile{
        address id;
        string name;
        string email;
        string logo;
        address[] subscribers;
    }

    mapping(address => publisherProfile) public profile;

    /**
     * @notice Update the publishers Profile
     * @param _name Publisher's Name
     * @param _email Publisher's Email
     * @param _logo Publisher's Logo
     */
    function updatePublisherProfile(string memory _name, string  memory _email, string memory _logo) public {
        profile[msg.sender].name = _name;
        profile[msg.sender].email = _email;
        profile[msg.sender].logo = _logo;
    }

    /**
     * @notice Get the content contracts of a Publisher
     * @param _user Publisher's address
     * @return All the content contracts associated with the Publisher
     */
    function getContentContracts(address _user) public view returns (address[] memory){
        return profile[msg.sender].contentContracts[_user];
    }

    ////// ******* Here we start to write functions that interact with the Content.sol ******* //////
    ////// ******* Here we start to write functions that interact with the Content.sol ******* //////
    ////// ******* Here we start to write functions that interact with the Content.sol ******* //////

    /**
     * @notice Create a new Content Contract
     * @param _contentHash The hash of the content (IPFS / FIlecoin)
     * @param _name Content title
     * @param _accessType Free or Paid (pay-as-you-go / Subscription)
     */
    function createContent(string memory _contentHash, string memory _name, string memory _accessType) public {
        Content contractId = new Content(_contentHash, _name, _accessType, _subscribers);
        profile[msg.sender].contentContracts[msg.sender].push(address(contractId));
    }

    /**
     * @notice Fetches Content Contract information
     * @param _contract Content Contract address
     * @return All the content contracts associated with the Publisher
     * @return All the content contracts associated with the Publisher
     */
    function getContentInformation(address _contract) public view returns (string memory, string memory, uint, string memory) {
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
