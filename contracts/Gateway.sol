// SPDX-License-Identifier: MIT
pragma solidity >=0.4.17 <0.7.0;
pragma experimental ABIEncoderV2;
import "./Publisher.sol";
import "./Content.sol";
import "./lib/OpenZeppelin/SafeMath.sol";

contract Gateway {
    using SafeMath for uint256;
    mapping(address => address) publisherContract;

    //THESE ARE PUBLISHER FUNCTIONS// //THESE ARE PUBLISHER FUNCTIONS// //THESE ARE PUBLISHER FUNCTIONS//
    function createNewPublisher(string memory _name, string memory _email, string memory _logo, uint256 _subscriptionCost) public
    {
        Publisher publisherId = new Publisher(
            _name,
            _email,
            _logo,
            _subscriptionCost
        );
        publisherContract[msg.sender] = address(publisherId);
    }

    function getPublisherProfile(address _publisher) public view returns (address, string memory ,string memory ,string memory, uint256)
    {
        if (publisherContract[_publisher] != 0x0000000000000000000000000000000000000000) {
            return Publisher(publisherContract[_publisher]).getPublisherProfile();
        }
        else {
            return (0x0000000000000000000000000000000000000000, '','','',0);
        }
    }

    function getSubscribers(address _publisher) public view returns (address[] memory)
    {
        return Publisher(publisherContract[_publisher]).getSubscribers();
    }

    function addSubscriber(address _publisher, address _subscriber, uint256 _amount) public payable
    {
        Publisher(publisherContract[_publisher]).addSubscriber(_subscriber, _amount);
    }

    function updatePublisherProfile(string memory _name, string memory _email, string memory _logo, uint256 _subscriptionCost) public
    {
        Publisher(publisherContract[msg.sender]).updateProfile(_name,_email,_logo,_subscriptionCost);
    }

    function withdrawEarnings(uint256 _amount) public
    {
        Publisher(publisherContract[msg.sender]).withdrawEarnings(_amount);
    }

    /**********************************************************************************************/

    //THESE ARE CONTENT FUNCTIONS// //THESE ARE CONTENT FUNCTIONS// //THESE ARE CONTENT FUNCTIONS//

    function getContentInformation(address payable _publisher, address payable _content) public view returns (string memory, string memory, string memory,string memory, uint, bool, uint)
    {
        return Publisher(_publisher).getContentInformation(_content);
    }

    function createContent(address payable _publisher,string memory _contentHash, string memory _previewHash, string memory _name, string memory _fileType, bool _free, uint256 _price) public
    {
        Publisher(_publisher).createContent(_contentHash, _previewHash, _fileType, _name,_free,_price);
    }

    function getPublisherContracts(address _publisher) public view returns (address[] memory)
    {
        return Publisher(publisherContract[_publisher]).getContentContracts();
    }
}