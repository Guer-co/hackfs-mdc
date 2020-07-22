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
    string email;
    string logo;
    uint256 subscriptionCost;
    uint256 balance;
    uint numberSubscribers;
    address[] subscribers;
    uint createdDate;
    address[] contentContracts;

    mapping(address => uint256) subscriberTimestamp;
    mapping(address => address[]) userWhitelist;

    constructor(string memory _name, string memory _email, string memory _logo, uint256 _subscriptionCost) public {
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
    function getPublisherProfile() public view returns(address, string memory, string memory, string memory, uint256 ) {
        return (publisherAddress, name, email, logo, subscriptionCost);
    }

    /**
     * @notice Get the content contracts of a Publisher
     * @return All the content contracts associated with the Publisher
     */
    function getContentContracts() public view returns (address[] memory)
    {
        return contentContracts;
    }


    function getSubscribers() public view returns (address[] memory) {
        return subscribers;
    }

    /**
     * @notice Add a subscriber to the publisher
     * @param _subscriber Subscribers's address
    */
    function addSubscriber(address _subscriber, uint256 _amount) public payable {
        require(
            _amount == subscriptionCost,
            "Amount sent is less than the publishers subscription cost."
        );
        balance += msg.value;
        subscribers.push(_subscriber);
        subscriberTimestamp[_subscriber] = now;
    }

    function withdrawEarnings(uint256 _amount) public {
        require(
            msg.sender == ownerAddress,
            "You are unauthorized to withdraw funds from this publishers account"
        );
        require(
            _amount <= balance,
            "The amount you are trying to withdraw exceeds your subscription earnings"
        );
        balance = balance.sub(_amount);
        (msg.sender).transfer(_amount);
    }

    ////// ******* Here we start to write functions that interact with the Content.sol ******* //////

    /**
     * @notice Create a new Content Contract
     * @param _contentHash The hash of the content (IPFS / FIlecoin)
     * @param _name Content title
     * @param _paid Free or Paid
     */
    function createContent(string memory _contentHash, string memory _name, bool _paid, uint256 _price) public {
        Content contractId = new Content(_contentHash, _name, _paid, _price);
        contentContracts.push(address(contractId));
    }

    /**
     * @notice Fetches Content Contract information
     * @param _contract Content Contract address
     * @return All the content contracts associated with the Publisher
     * @return All the content contracts associated with the Publisher
     */
    function getContentInformation(address payable _contract) public view returns (string memory, string memory, uint, bool, uint) {
        return Content(_contract).getContentDetails();
    }

    //function getFile(address payable _contract) public view returns (string memory) {
    //    return Content(_contract).getFile();
    //}

    function purchaseContent(address payable _contract, uint256 _amount) public returns (bool) {
        return Content(_contract).purchaseContent(msg.sender, _amount);
    }

    //receive() external payable {
    //}
}
