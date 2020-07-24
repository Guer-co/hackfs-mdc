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
    address[] subscriberList;
    uint createdDate;
    address[] contentContracts;

    mapping(address => uint256) subscriberTimestamp;
    mapping(address => bool) subscribers;

    fallback() external payable {}
    receive() external payable {}

    constructor(string memory _name, string memory _email, string memory _logo, uint256 _subscriptionCost) public payable{
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
    function getContentContracts() public view returns (address[] memory) {
        return contentContracts;
    }

    /**
    * @notice Get the subscribers to a publisher
    * @return All the subscribers to your content
    */
    function getSubscribers() public view returns (address[] memory) {
        return subscriberList;
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
        subscriberList.push(_subscriber);
        subscribers[_subscriber] = true;
        subscriberTimestamp[_subscriber] = now;
    }

    function withdrawEarnings() public payable {
        require(
            msg.sender == ownerAddress,
            "You are unauthorized to withdraw funds from this publishers account"
        );
        (msg.sender).transfer(msg.value);
    }

    ////// ******* Here we start to write functions that interact with the Content.sol ******* //////

    /**
     * @notice Create a new Content Contract
     * @param _contentHash The public hash of the content (IPFS / FIlecoin)
     * @param _previewHash Encrypted hash of content
     * @param _name Content title
     * @param _fileType Type of file
     * @param _free Free or Paid
     */
    function createContent(string memory _contentHash, string memory _previewHash, string memory _name, string memory _fileType, string memory _title, string memory _description, bool _free, uint _price) public payable{
        Content contractId = new Content(_contentHash, _previewHash, _name, _fileType, _title, _description, _free, _price);
        contentContracts.push(address(contractId));
    }

    /**
     * @notice Fetches Content Contract information
     * @param _contract Content Contract address
     * @return All the content contracts associated with the Publisher
     * @return All the content contracts associated with the Publisher
     */
    function getContentInformation(address payable _contract) public view returns (string memory, string memory, string memory,string memory, string memory,string memory,uint, bool, uint) {
        return Content(_contract).getContentDetails();
    }

    //this should probably come back soon, was just causing me issues tonight
    //receive() external payable {
    //}

    //function getFile(address payable _contract) public view returns (string memory) {
    //    return Content(_contract).getFile();
    //}
}
