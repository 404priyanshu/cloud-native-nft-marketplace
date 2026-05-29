"use client";

import { useQuery } from "@tanstack/react-query";
import {
  fetchNfts,
  fetchNft,
  fetchListings,
  fetchListing,
  fetchTransactions,
  fetchUser,
  fetchUserNfts,
  fetchUserListings,
} from "@/lib/api-client";
import type { ListingStatus } from "@/types/api";

/* ─── NFTs ─── */

export function useNfts() {
  return useQuery({
    queryKey: ["nfts"],
    queryFn: fetchNfts,
    staleTime: 15_000,
  });
}

export function useNft(id: string | undefined) {
  return useQuery({
    queryKey: ["nft", id],
    queryFn: () => fetchNft(id!),
    enabled: !!id,
    staleTime: 10_000,
  });
}

/* ─── Listings ─── */

export function useListings(status?: ListingStatus) {
  return useQuery({
    queryKey: ["listings", status ?? "all"],
    queryFn: () => fetchListings(status),
    staleTime: 10_000,
  });
}

export function useListing(id: string | undefined) {
  return useQuery({
    queryKey: ["listing", id],
    queryFn: () => fetchListing(id!),
    enabled: !!id,
    staleTime: 10_000,
  });
}

/* ─── Transactions ─── */

export function useTransactions() {
  return useQuery({
    queryKey: ["transactions"],
    queryFn: fetchTransactions,
    staleTime: 15_000,
  });
}

/* ─── Users ─── */

export function useUserProfile(walletAddress: string | undefined) {
  return useQuery({
    queryKey: ["user", walletAddress],
    queryFn: () => fetchUser(walletAddress!),
    enabled: !!walletAddress,
    staleTime: 30_000,
    retry: false,
  });
}

export function useUserNfts(walletAddress: string | undefined) {
  return useQuery({
    queryKey: ["userNfts", walletAddress],
    queryFn: () => fetchUserNfts(walletAddress!),
    enabled: !!walletAddress,
    staleTime: 15_000,
  });
}

export function useUserListings(walletAddress: string | undefined) {
  return useQuery({
    queryKey: ["userListings", walletAddress],
    queryFn: () => fetchUserListings(walletAddress!),
    enabled: !!walletAddress,
    staleTime: 15_000,
  });
}
