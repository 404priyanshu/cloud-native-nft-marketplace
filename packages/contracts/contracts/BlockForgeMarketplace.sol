// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import {IERC721Receiver} from "@openzeppelin/contracts/token/ERC721/IERC721Receiver.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract BlockForgeMarketplace is IERC721Receiver, ReentrancyGuard, Ownable {
    enum ListingStatus {
        Active,
        Sold,
        Cancelled
    }

    struct Listing {
        uint256 listingId;
        address seller;
        address nftContract;
        uint256 tokenId;
        uint256 price;
        ListingStatus status;
    }

    uint256 private nextListingId;
    uint256 public platformFeeBps = 250;

    mapping(uint256 => Listing) public listings;

    event NFTListed(
        uint256 indexed listingId,
        address indexed seller,
        address indexed nftContract,
        uint256 tokenId,
        uint256 price
    );

    event NFTSold(
        uint256 indexed listingId,
        address indexed buyer,
        address indexed seller,
        address nftContract,
        uint256 tokenId,
        uint256 price
    );

    event ListingCancelled(
        uint256 indexed listingId,
        address indexed seller,
        address indexed nftContract,
        uint256 tokenId
    );

    event PlatformFeeUpdated(uint256 previousFeeBps, uint256 newFeeBps);

    error PriceMustBeAboveZero();
    error NotTokenOwner();
    error NotListingSeller();
    error ListingNotActive();
    error IncorrectPayment();
    error ListingDoesNotExist();
    error InvalidNFTContract();
    error PlatformFeeTooHigh();
    error EthTransferFailed(address recipient, uint256 amount);

    constructor() Ownable(msg.sender) {}

    function listNFT(
        address nftContract,
        uint256 tokenId,
        uint256 price
    ) external nonReentrant {
        if (price == 0) revert PriceMustBeAboveZero();
        if (nftContract == address(0) || nftContract.code.length == 0) {
            revert InvalidNFTContract();
        }

        IERC721 nft = IERC721(nftContract);

        if (nft.ownerOf(tokenId) != msg.sender) {
            revert NotTokenOwner();
        }

        nextListingId++;

        listings[nextListingId] = Listing({
            listingId: nextListingId,
            seller: msg.sender,
            nftContract: nftContract,
            tokenId: tokenId,
            price: price,
            status: ListingStatus.Active
        });

        nft.safeTransferFrom(msg.sender, address(this), tokenId);

        emit NFTListed(nextListingId, msg.sender, nftContract, tokenId, price);
    }

    function buyNFT(uint256 listingId) external payable nonReentrant {
        Listing storage listing = listings[listingId];

        if (listing.seller == address(0)) {
            revert ListingDoesNotExist();
        }

        if (listing.status != ListingStatus.Active) {
            revert ListingNotActive();
        }

        if (msg.value != listing.price) {
            revert IncorrectPayment();
        }

        listing.status = ListingStatus.Sold;

        uint256 fee = (msg.value * platformFeeBps) / 10_000;
        uint256 sellerAmount = msg.value - fee;

        _sendValue(listing.seller, sellerAmount);

        if (fee > 0) {
            _sendValue(owner(), fee);
        }

        IERC721(listing.nftContract).safeTransferFrom(
            address(this),
            msg.sender,
            listing.tokenId
        );

        emit NFTSold(
            listingId,
            msg.sender,
            listing.seller,
            listing.nftContract,
            listing.tokenId,
            listing.price
        );
    }

    function cancelListing(uint256 listingId) external nonReentrant {
        Listing storage listing = listings[listingId];

        if (listing.seller == address(0)) {
            revert ListingDoesNotExist();
        }

        if (listing.status != ListingStatus.Active) {
            revert ListingNotActive();
        }

        if (listing.seller != msg.sender) {
            revert NotListingSeller();
        }

        listing.status = ListingStatus.Cancelled;

        IERC721(listing.nftContract).safeTransferFrom(
            address(this),
            listing.seller,
            listing.tokenId
        );

        emit ListingCancelled(
            listingId,
            msg.sender,
            listing.nftContract,
            listing.tokenId
        );
    }

    function updatePlatformFee(uint256 newFeeBps) external onlyOwner {
        if (newFeeBps > 1000) revert PlatformFeeTooHigh();

        uint256 previousFeeBps = platformFeeBps;
        platformFeeBps = newFeeBps;

        emit PlatformFeeUpdated(previousFeeBps, newFeeBps);
    }

    function _sendValue(address recipient, uint256 amount) private {
        (bool success, ) = payable(recipient).call{value: amount}("");

        if (!success) {
            revert EthTransferFailed(recipient, amount);
        }
    }

    function onERC721Received(
        address,
        address,
        uint256,
        bytes calldata
    ) external pure override returns (bytes4) {
        return IERC721Receiver.onERC721Received.selector;
    }
}
