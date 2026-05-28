// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {ERC721URIStorage} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract BlockForgeNFT is ERC721URIStorage, Ownable {
    uint256 private nextTokenId;

    event NFTMinted(
        address indexed owner,
        uint256 indexed tokenId,
        string tokenURI
    );

    constructor() ERC721("BlockForge NFT", "BFNFT") Ownable(msg.sender) {}

    function mintNFT(string calldata tokenURI) external returns (uint256) {
        nextTokenId++;

        uint256 tokenId = nextTokenId;

        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, tokenURI);

        emit NFTMinted(msg.sender, tokenId, tokenURI);

        return tokenId;
    }
}
