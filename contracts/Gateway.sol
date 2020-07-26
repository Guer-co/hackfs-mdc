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


    //THESE ARE PUBLISHER FUNCTIONS// //THESE ARE PUBLISHER FUNCTIONS// //THESE ARE PUBLISHER FUNCTIONS//
    function createNewPublisher(string memory _name, string memory _email, string memory _logo, uint256 _subscriptionCost) public payable
    {
        Publisher publisherId = new Publisher(_name,_email,_logo,_subscriptionCost);
        publisherContract[msg.sender] = address(publisherId);
    }

    function createNewUser(string memory _name, string memory _email) public
    {
        User userId = new User(_name, _email);
        userContract[msg.sender] = address(userId);
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

    function getUserProfile(address _user) public view returns (address, string memory, string memory, uint256)
    {
        if (userContract[_user] != 0x0000000000000000000000000000000000000000) {
            return User(userContract[_user]).getUserProfile();
        }
        else {
            return (0x0000000000000000000000000000000000000000, '','',0);
        }
    }

    function getSubscribers(address payable _publisher) public view returns (address[] memory)
    {
        return Publisher(publisherContract[_publisher]).getSubscribers();
    }

    function addSubscriber(address payable _publisher, address _subscriber, uint256 _amount) public
    {
        Publisher(publisherContract[_publisher]).addSubscriber(_subscriber, _amount);
    }

    function updatePublisherProfile(string memory _name, string memory _email, string memory _logo, uint256 _subscriptionCost) public
    {
        Publisher(publisherContract[msg.sender]).updateProfile(_name,_email,_logo,_subscriptionCost);
    }

    function withdrawEarnings() public
    {
        Publisher(publisherContract[msg.sender]).withdrawEarnings();
    }

    /**********************************************************************************************/

    //THESE ARE CONTENT FUNCTIONS// //THESE ARE CONTENT FUNCTIONS// //THESE ARE CONTENT FUNCTIONS//

    // getContentInformation might not be required as the function below it (getContentInfo) is the same function minus the publishers address.
    // Should be replaced with getContentInfo() on the frontend and removed.
    function getContentInformation(address payable _publisher, address payable _content) public view returns (string memory, string memory, string memory,string memory,string memory, string memory,uint, bool, uint)
    {
        return Publisher(_publisher).getContentInformation(_content);
    }

    function getContentInfo(address payable _content) public view returns (string memory, string memory, string memory,string memory, string memory,string memory,uint, bool, uint) {
        return Content(_content).getContentDetails();
    }

    function createContent(address payable _publisher,string memory _contentHash, string memory _previewHash, string memory _name, string memory _fileType, string memory _title, string memory _description, bool _free, uint _price) public
    {
        address contractId = Publisher(_publisher).createContent(_contentHash, _previewHash, _fileType, _name, _title, _description, _free,_price);
        contentContracts.push(address(contractId));
    }

    function getPublisherContracts(address _publisher) public view returns (address[] memory)
    {
        return Publisher(publisherContract[_publisher]).getContentContracts();
    }
}