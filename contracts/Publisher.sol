// SPDX-License-Identifier: MIT
pragma solidity >=0.4.17 <0.7.0;
pragma experimental ABIEncoderV2;

import "./Content.sol";
import "./lib/OpenZeppelin/SafeMath.sol";


contract Publisher {
    using SafeMath for uint256;
    address ownerAddress;
    address publisherAddress;
    string name;
    uint256 balance;
    string email;
    string logo;
    uint256 subscriptionCost;
    uint numberSubscribers;
    uint createdDate;
    address[] contentContracts;
    address[] purchased;

    mapping(address => uint256) subscriberExpiration;
    mapping(address => bool) subscribers;

    fallback() external payable {}
    receive() external payable {}

    constructor(string memory _name, string memory _email, string memory _logo, uint256 _subscriptionCost) public payable {
        publisherAddress = address(this);
        ownerAddress = msg.sender;
        name = _name;
        email = _email;
        logo = _logo;
        subscriptionCost = _subscriptionCost;
        createdDate = now;
    }

    /**
     * @notice Update the publishers Profile
     * @param _name Publisher's Name
     * @param _email Publisher's Email
     * @param _logo Publisher's Logo
     * @param _subscriptionCost How much to subscribe to their content
     */
    function updateProfile(string memory _name, string memory _email, string memory _logo, uint256 _subscriptionCost) public {
        name = _name;
        email = _email;
        logo = _logo;
        subscriptionCost = _subscriptionCost;
    }

    /**
    * @notice Get Publisher information
    */
    function getPublisherProfile() public view returns(address, string memory, string memory, string memory, address[] memory, uint256) {
        return (publisherAddress, name, email, logo, contentContracts, subscriptionCost);
    }

    /**
     * @notice Get the content contracts of a Publisher
     * @return All the content contracts associated with the Publisher
     */
    function getContentContracts() public view returns (address[] memory) {
        return contentContracts;
    }

    /**
    * @notice Get the number of subscribers of a publisher
    * @return All the subscribers to your content
    */
    function subscriberCount() public view returns (uint) {
        return numberSubscribers;
    }

    /**
    * @notice Checks if someone is subscribed to the publisher
    * @return True or false
    */
    function isSubscribed(address _consumer) public returns (bool) {
        if (subscriberExpiration[_consumer] < now) {
            return subscribers[_consumer];
        }
        else {
            return false;
        }
    }

    /**
     * @notice Add a subscriber to the publisher
     * @param _subscriber Subscribers's address
    */
    function addSubscriber(address _subscriber, uint256 _amount) public payable{
        require(
            _amount == subscriptionCost,
            "Amount sent is less than the publishers subscription cost."
        );
        balance += msg.value;
        subscribers[_subscriber] = true;
        numberSubscribers++;
        //5 minutes  subscriberExpiration[_subscriber] = now + 300;
        //subscriberExpiration[_subscriber] = now + 2592000;
        subscriberExpiration[_subscriber] = now;
    }
    
    /**
     * @notice Removes a subscriber to the publisher
     * @param _subscriber Subscribers's address
    */
    function removeSubscriber(address _subscriber) public {
        subscribers[_subscriber] = false;
        numberSubscribers--;
        subscriberExpiration[_subscriber] = now;
    }

    /**
    * @notice Extract money from publisher contract to owner
    * @param _to Who to send the funds to
    */
    function transferFunds(address payable _to) payable external {
        (bool success,  ) = _to.call{value: address(this).balance}("");
        require(success, "Failed to transfer the funds, aborting.");
    }
    
    ////// ******* Here we start to write functions that interact with the Content.sol ******* //////

    /**
     * @notice Create a new Content Contract
     * @param _contentHash The public hash of the content (IPFS / FIlecoin)
     * @param _previewHash Encrypted hash of content
     * @param _filename Content title
     * @param _fileType Type of file
     */
    function createContent(string memory _contentHash, string memory _previewHash, string memory _filename, string memory _fileType, string memory _title, string memory _description, uint _price, string memory _name, uint256 _subscriptionPrice) public payable returns (address) {
        Content contractId = new Content(_contentHash, _previewHash, _filename, _fileType, _title, _description, _price, _name, _subscriptionPrice);
        contentContracts.push(address(contractId));
        return address(contractId);
    }

    /**
     * @notice Fetches Content Contract information
     * @param _contract Content Contract address
     * @return All the content contracts associated with the Publisher
     * @return All the content contracts associated with the Publisher
     */
    function getContentInformation(address payable _contract) public view returns (string memory, string memory, string memory,string memory, string memory,string memory,uint, uint, address, string memory, uint256) {
        return Content(_contract).getContentDetails();
    }
}
