// SPDX-License-Identifier: MIT

pragma solidity ^0.6.10;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@opengsn/gsn/contracts/BaseRelayRecipient.sol";

contract MemeArt is ERC721, BaseRelayRecipient {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;
    uint public imageCount = 0;
    mapping(uint => Image) public images;

    struct Image {
      uint id;
      string hash;
      string price;
      address owner;
    }

    constructor() ERC721("MemeArt", "MART") public {}

    function setTrustedForwarder(address _trustedForwarder) public {
      trustedForwarder = _trustedForwarder;
    }

    function uploadImage(string memory imgHash, string memory price)
      public
      returns (uint256)
    {
      _tokenIds.increment();
      imageCount = _tokenIds.current();

      images[imageCount] = Image(imageCount, imgHash, price, _msgSender());
      _mint(msg.sender, imageCount);

      return imageCount;
    }

    // todo: function buyFromOwner(uint _id) public payable

    function _msgSender() internal view override(BaseRelayRecipient, Context) returns (address payable) {
      return BaseRelayRecipient._msgSender();
    }
}