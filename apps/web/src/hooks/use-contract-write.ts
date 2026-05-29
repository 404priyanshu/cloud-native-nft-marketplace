"use client";

import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { parseEther, type Address } from "viem";
import {
  nftAbi,
  marketplaceAbi,
  NFT_CONTRACT_ADDRESS,
  MARKETPLACE_CONTRACT_ADDRESS,
} from "@/lib/contracts";
import { useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";

/* ─── Mint NFT ─── */

export function useMintNft() {
  const queryClient = useQueryClient();
  const {
    writeContract,
    data: txHash,
    isPending,
    error,
    reset,
  } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } =
    useWaitForTransactionReceipt({
      hash: txHash,
      query: {
        enabled: !!txHash,
      },
    });

  // Invalidate NFT queries after successful mint
  if (isSuccess) {
    queryClient.invalidateQueries({ queryKey: ["nfts"] });
  }

  const mint = useCallback(
    (tokenURI: string) => {
      writeContract({
        address: NFT_CONTRACT_ADDRESS,
        abi: nftAbi,
        functionName: "mintNFT",
        args: [tokenURI],
      });
    },
    [writeContract]
  );

  return {
    mint,
    txHash,
    isPending,
    isConfirming,
    isSuccess,
    error,
    reset,
  };
}

/* ─── List NFT ─── */

export function useListNft() {
  const queryClient = useQueryClient();

  // Step 1: Approve
  const {
    writeContract: writeApprove,
    data: approveTxHash,
    isPending: isApproving,
    error: approveError,
    reset: resetApprove,
  } = useWriteContract();

  const { isLoading: isApproveConfirming, isSuccess: isApproved } =
    useWaitForTransactionReceipt({
      hash: approveTxHash,
      query: { enabled: !!approveTxHash },
    });

  // Step 2: List
  const {
    writeContract: writeList,
    data: listTxHash,
    isPending: isListing,
    error: listError,
    reset: resetList,
  } = useWriteContract();

  const { isLoading: isListConfirming, isSuccess: isListed } =
    useWaitForTransactionReceipt({
      hash: listTxHash,
      query: { enabled: !!listTxHash },
    });

  if (isListed) {
    queryClient.invalidateQueries({ queryKey: ["listings"] });
    queryClient.invalidateQueries({ queryKey: ["nfts"] });
  }

  const approveListing = useCallback(
    (nftContract: Address, tokenId: bigint) => {
      writeApprove({
        address: nftContract,
        abi: nftAbi,
        functionName: "approve",
        args: [MARKETPLACE_CONTRACT_ADDRESS, tokenId],
      });
    },
    [writeApprove]
  );

  const submitListing = useCallback(
    (nftContract: Address, tokenId: bigint, priceEth: string) => {
      writeList({
        address: MARKETPLACE_CONTRACT_ADDRESS,
        abi: marketplaceAbi,
        functionName: "listNFT",
        args: [nftContract, tokenId, parseEther(priceEth)],
      });
    },
    [writeList]
  );

  return {
    approveListing,
    submitListing,
    isApproving,
    isApproveConfirming,
    isApproved,
    isListing,
    isListConfirming,
    isListed,
    approveError,
    listError,
    approveTxHash,
    listTxHash,
    reset: () => {
      resetApprove();
      resetList();
    },
  };
}

/* ─── Buy NFT ─── */

export function useBuyNft() {
  const queryClient = useQueryClient();
  const {
    writeContract,
    data: txHash,
    isPending,
    error,
    reset,
  } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } =
    useWaitForTransactionReceipt({
      hash: txHash,
      query: { enabled: !!txHash },
    });

  if (isSuccess) {
    queryClient.invalidateQueries({ queryKey: ["listings"] });
    queryClient.invalidateQueries({ queryKey: ["nfts"] });
  }

  const buy = useCallback(
    (listingId: bigint, priceWei: bigint) => {
      writeContract({
        address: MARKETPLACE_CONTRACT_ADDRESS,
        abi: marketplaceAbi,
        functionName: "buyNFT",
        args: [listingId],
        value: priceWei,
      });
    },
    [writeContract]
  );

  return { buy, txHash, isPending, isConfirming, isSuccess, error, reset };
}

/* ─── Cancel Listing ─── */

export function useCancelListing() {
  const queryClient = useQueryClient();
  const {
    writeContract,
    data: txHash,
    isPending,
    error,
    reset,
  } = useWriteContract();

  const { isLoading: isConfirming, isSuccess } =
    useWaitForTransactionReceipt({
      hash: txHash,
      query: { enabled: !!txHash },
    });

  if (isSuccess) {
    queryClient.invalidateQueries({ queryKey: ["listings"] });
    queryClient.invalidateQueries({ queryKey: ["nfts"] });
  }

  const cancel = useCallback(
    (listingId: bigint) => {
      writeContract({
        address: MARKETPLACE_CONTRACT_ADDRESS,
        abi: marketplaceAbi,
        functionName: "cancelListing",
        args: [listingId],
      });
    },
    [writeContract]
  );

  return { cancel, txHash, isPending, isConfirming, isSuccess, error, reset };
}
