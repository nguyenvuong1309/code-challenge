import { Request } from 'express';

// Authentication types
export interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  walletAddress?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    name: string;
    walletAddress?: string;
  };
}

export interface JWTPayload {
  userId: string;
  email: string;
  iat: number;
  exp: number;
}

// NFT Collection types
export interface CreateCollectionRequest {
  name: string;
  symbol: string;
  description?: string;
  chainId: number;
  maxSupply?: number;
  mintPrice: number;
  royaltyPercent: number;
  metadataURI?: string;
  imageURI?: string;
  isPublic?: boolean;
}

export interface UpdateCollectionRequest {
  name?: string;
  description?: string;
  mintPrice?: number;
  royaltyPercent?: number;
  metadataURI?: string;
  imageURI?: string;
  isActive?: boolean;
  isPublic?: boolean;
}

export interface CollectionFilters {
  chainId?: number;
  creatorId?: string;
  isActive?: boolean;
  isPublic?: boolean;
  search?: string;
}

// NFT types
export interface CreateNFTRequest {
  name: string;
  description?: string;
  imageURI: string;
  metadataURI: string;
  attributes?: Record<string, unknown>;
  rarity?: string;
  ownerWallet?: string;
}

export interface UpdateNFTRequest {
  name?: string;
  description?: string;
  imageURI?: string;
  metadataURI?: string;
  attributes?: Record<string, unknown>;
  rarity?: string;
  ownerWallet?: string;
  isListed?: boolean;
  listPrice?: number;
}

export interface NFTFilters {
  ownerWallet?: string;
  rarity?: string;
  isListed?: boolean;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
}

// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
}

// Database pagination
export interface PaginationOptions {
  page: number;
  limit: number;
}