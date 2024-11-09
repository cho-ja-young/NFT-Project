// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract MyContract {
    string public myString = 'hello world !';
    struct NFT {
        uint256 id;
        string metadata;
        string imageUrl;
        address owner;
    }
    NFT[] public nfts;
    uint256 public nextNFTId = 1;

    function setMyString(string memory _myString) public {
        myString = _myString;
    }

    function getMyString() public view returns(string memory) {
        return myString;
    }

    function mintNFT(string memory metadata, string memory imageUrl) public {
        NFT memory newNFT = NFT(nextNFTId, metadata, imageUrl, msg.sender);
        nfts.push(newNFT);
        nextNFTId++;
    }

    function getNFTsByOwner(address owner) public view returns (NFT[] memory) {
        uint256 count = 0;
        for (uint256 i = 0; i < nfts.length; i++) {
            if (nfts[i].owner == owner) {
                count++;
            }
        }
        NFT[] memory result = new NFT[](count);
        uint256 index = 0;
        for (uint256 i = 0; i < nfts.length; i++) {
            if (nfts[i].owner == owner) {
                result[index] = nfts[i];
                index++;
            }
        }
        return result;
    }
}
