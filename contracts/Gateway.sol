// SPDX-License-Identifier: MIT
pragma solidity >=0.4.17 <0.7.0;
pragma experimental ABIEncoderV2;
import "./Publisher.sol";
import "./Content.sol";
import "./User.sol";
import "./lib/OpenZeppelin/SafeMath.sol";

contract Gateway {
    using SafeMath for uint256;
    address[] public contentContracts;
    mapping(address => address payable) publisherContract;
    mapping(address => address) userContract;

    function getContentContracts() public view returns (address[] memory) {
        return contentContracts;
    }

    /*************************************************************************************/

    //THESE ARE USER FUNCTIONS// //THESE ARE USER FUNCTIONS// //THESE ARE USER FUNCTIONS//

    function createNewUser(string memory _name, string memory _email) public
    {
        User userId = new User(_name, _email);
        userContract[msg.sender] = address(userId);
    }

    function getUserProfile(address _user) public view returns (address, string memory, string memory, uint256)
    {
        if (userContract[_user] != 0x0000000000000000000000000000000000000000) {
            return User(userContract[_user]).getUserProfile();
        }
        else {
            return (0x0000000000000000000000000000000000000000, '','',0);
        }
    }

    function getPurchased(address _user) public {
        User(userContract[_user]).getPurchased();
    }

    /****************************************************************************************************/

    //THESE ARE PUBLISHER FUNCTIONS// //THESE ARE PUBLISHER FUNCTIONS// //THESE ARE PUBLISHER FUNCTIONS//
    function createNewPublisher(string memory _name, string memory _email, string memory _logo, uint256 _subscriptionCost) public payable
    {
        Publisher publisherId = new Publisher(_name,_email,_logo,_subscriptionCost);
        publisherContract[msg.sender] = address(publisherId);
    }

    function getPublisherProfile(address payable _publisher) public view returns (address, string memory ,string memory ,string memory, uint256)
    {
        if (publisherContract[_publisher] != 0x0000000000000000000000000000000000000000) {
            return Publisher(publisherContract[_publisher]).getPublisherProfile();
        }
        else {
            return (0x0000000000000000000000000000000000000000, '','','',0);
        }
    }

    function updatePublisherProfile(string memory _name, string memory _email, string memory _logo, uint256 _subscriptionCost) public
    {
        Publisher(publisherContract[msg.sender]).updateProfile(_name,_email,_logo,_subscriptionCost);
    }

    function getPublisherContracts(address _publisher) public view returns (address[] memory)
    {
        return Publisher(publisherContract[_publisher]).getContentContracts();
    }

    function subscriberCount(address payable _publisher) public view returns (uint)
    {
        return Publisher(publisherContract[_publisher]).subscriberCount();
    }

    function isSubscribed(address _publisher, address _consumer) public view returns (bool)
    {
        return Publisher(publisherContract[_publisher]).isSubscribed(_consumer);
    }

    function addSubscriber(address payable _publisher, address _subscriber, uint256 _amount) public
    {
        Publisher(publisherContract[_publisher]).addSubscriber(_subscriber, _amount);
        User(userContract[_subscriber]).subscribe(_publisher);
    }

    function removeSubscriber(address payable _publisher, address _subscriber) public
    {
        Publisher(publisherContract[_publisher]).removeSubscriber(_subscriber);
        User(userContract[_subscriber]).unsubscribe(_publisher);
    }

    function withdrawEarnings() public
    {
        Publisher(publisherContract[msg.sender]).withdrawEarnings();
    }

    function doTransferFunds(address payable _to) public payable {
        Publisher(publisherContract[msg.sender]).transferFunds(_to);
    }

    /**********************************************************************************************/

    //THESE ARE CONTENT FUNCTIONS// //THESE ARE CONTENT FUNCTIONS// //THESE ARE CONTENT FUNCTIONS//

    function getContentInfo(address payable _content) public view returns (string memory, string memory, string memory,string memory, string memory,string memory,uint, bool, uint, address) {
        return Content(_content).getContentDetails();
    }

    function createContent(address payable _publisher,string memory _contentHash, string memory _previewHash, string memory _name, string memory _fileType, string memory _title, string memory _description, bool _free, uint _price) public
    {
        address contractId = Publisher(_publisher).createContent(_contentHash, _previewHash, _fileType, _name, _title, _description, _free,_price);
        contentContracts.push(address(contractId));
    }

    function purchaseContent(address payable _contract, address _consumer, uint _contentCost) public payable {
        User(_consumer).purchase(_contract);
        Content(_contract).purchaseContent(_consumer, _contentCost);
    }
}