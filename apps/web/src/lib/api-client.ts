import type {
  NftToken,
  MarketplaceListing,
  MarketplaceEvent,
  User,
  NonceResponse,
  VerifyResponse,
  PresignedUrlResponse,
  ListingStatus,
} from "@/types/api";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("blockforge_token");
}

export function setAuthToken(token: string): void {
  localStorage.setItem("blockforge_token", token);
}

export function clearAuthToken(): void {
  localStorage.removeItem("blockforge_token");
}

async function apiFetch<T>(
  path: string,
  options?: RequestInit
): Promise<T> {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options?.headers as Record<string, string>),
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`API ${res.status}: ${body || res.statusText}`);
  }

  return res.json() as Promise<T>;
}

/* ─── NFTs ─── */
export function fetchNfts(): Promise<NftToken[]> {
  return apiFetch<NftToken[]>("/nfts");
}

export function fetchNft(id: string): Promise<NftToken> {
  return apiFetch<NftToken>(`/nfts/${id}`);
}

/* ─── Listings ─── */
export function fetchListings(
  status?: ListingStatus
): Promise<MarketplaceListing[]> {
  const query = status ? `?status=${status}` : "";
  return apiFetch<MarketplaceListing[]>(`/listings${query}`);
}

export function fetchListing(id: string): Promise<MarketplaceListing> {
  return apiFetch<MarketplaceListing>(`/listings/${id}`);
}

/* ─── Transactions ─── */
export function fetchTransactions(): Promise<MarketplaceEvent[]> {
  return apiFetch<MarketplaceEvent[]>("/transactions");
}

export function fetchTransaction(txHash: string): Promise<MarketplaceEvent> {
  return apiFetch<MarketplaceEvent>(`/transactions/${txHash}`);
}

/* ─── Users ─── */
export function fetchUser(walletAddress: string): Promise<User> {
  return apiFetch<User>(`/users/${walletAddress}`);
}

export function fetchUserNfts(walletAddress: string): Promise<NftToken[]> {
  return apiFetch<NftToken[]>(`/users/${walletAddress}/nfts`);
}

export function fetchUserListings(
  walletAddress: string
): Promise<MarketplaceListing[]> {
  return apiFetch<MarketplaceListing[]>(
    `/users/${walletAddress}/listings`
  );
}

/* ─── Auth ─── */
export function requestNonce(
  walletAddress: string
): Promise<NonceResponse> {
  return apiFetch<NonceResponse>("/auth/nonce", {
    method: "POST",
    body: JSON.stringify({ walletAddress }),
  });
}

export function verifySignature(
  walletAddress: string,
  signature: string
): Promise<VerifyResponse> {
  return apiFetch<VerifyResponse>("/auth/verify", {
    method: "POST",
    body: JSON.stringify({ walletAddress, signature }),
  });
}

/* ─── Upload ─── */
export function requestPresignedUrl(
  fileName: string,
  contentType: string
): Promise<PresignedUrlResponse> {
  return apiFetch<PresignedUrlResponse>("/upload/presigned-url", {
    method: "POST",
    body: JSON.stringify({ fileName, contentType }),
  });
}
