import type { NFTCollection, Prisma } from '@prisma/client';

import { prisma, queryWithMetrics, executeTransaction } from '../lib/prisma';
import { AppError } from '../middleware/errorHandler';
import { 
  CreateCollectionRequest, 
  UpdateCollectionRequest, 
  CollectionFilters, 
  PaginationOptions 
} from '../types';
import logger from '../utils/logger';

export namespace CollectionService {
  /**
   * Create new NFT collection
   */
  export async function createCollection(
    creatorId: string,
    collectionData: CreateCollectionRequest
  ): Promise<NFTCollection> {
    try {
      // Check if collection name or symbol already exists for this creator
      const existingCollection = await queryWithMetrics('checkExistingCollection', () =>
        prisma.nFTCollection.findFirst({
          where: {
            creatorId,
            OR: [
              { name: collectionData.name },
              { symbol: collectionData.symbol },
            ],
          },
        })
      );

      if (existingCollection) {
        if (existingCollection.name === collectionData.name) {
          throw new AppError('Collection name already exists', 400);
        }
        if (existingCollection.symbol === collectionData.symbol) {
          throw new AppError('Collection symbol already exists', 400);
        }
      }

      // Validate chain ID
      const supportedChains = [1, 56, 137, 43114, 42161]; // Ethereum, BSC, Polygon, Avalanche, Arbitrum
      if (!supportedChains.includes(collectionData.chainId)) {
        throw new AppError('Unsupported chain ID', 400);
      }

      // Validate royalty percentage (0-10%)
      if (collectionData.royaltyPercent < 0 || collectionData.royaltyPercent > 10) {
        throw new AppError('Royalty percentage must be between 0 and 10', 400);
      }

      const collection = await queryWithMetrics('createCollection', () =>
        prisma.nFTCollection.create({
          data: {
            ...collectionData,
            creatorId,
            mintPrice: collectionData.mintPrice.toString(),
            royaltyPercent: collectionData.royaltyPercent.toString(),
          },
          include: {
            creator: {
              select: {
                id: true,
                email: true,
                name: true,
                walletAddress: true,
              },
            },
            _count: {
              select: { nfts: true },
            },
          },
        })
      );

      logger.info('New collection created:', { 
        id: collection.id, 
        name: collection.name, 
        creatorId 
      });

      return collection;
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Create collection error:', error);
      throw new AppError('Collection creation failed', 500);
    }
  }

  /**
   * Get collection by ID
   */
  export async function getCollectionById(
    id: string,
    includeNFTs = false
  ): Promise<NFTCollection | null> {
    try {
      const collection = await queryWithMetrics('getCollectionById', () =>
        prisma.nFTCollection.findUnique({
          where: { id },
          include: {
            creator: {
              select: {
                id: true,
                email: true,
                name: true,
                walletAddress: true,
              },
            },
            _count: {
              select: { nfts: true },
            },
            ...(includeNFTs && {
              nfts: {
                take: 20, // Limit to first 20 NFTs
                orderBy: { mintedAt: 'desc' },
              },
            }),
          },
        })
      );

      return collection;
    } catch (error) {
      logger.error('Get collection by ID error:', error);
      return null;
    }
  }

  /**
   * Get collections with filtering and pagination
   */
  export async function getCollections(
    filters: CollectionFilters = {},
    pagination: PaginationOptions = { page: 1, limit: 20 }
  ): Promise<{
    collections: NFTCollection[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    try {
      const where: Prisma.NFTCollectionWhereInput = {};

      // Apply filters
      if (filters.chainId) {
        where.chainId = filters.chainId;
      }

      if (filters.creatorId) {
        where.creatorId = filters.creatorId;
      }

      if (filters.isActive !== undefined) {
        where.isActive = filters.isActive;
      }

      if (filters.isPublic !== undefined) {
        where.isPublic = filters.isPublic;
      }

      if (filters.search) {
        where.OR = [
          { name: { contains: filters.search, mode: 'insensitive' } },
          { description: { contains: filters.search, mode: 'insensitive' } },
          { symbol: { contains: filters.search, mode: 'insensitive' } },
        ];
      }

      const skip = (pagination.page - 1) * pagination.limit;

      const [collections, total] = await Promise.all([
        queryWithMetrics('getCollections', () =>
          prisma.nFTCollection.findMany({
            where,
            skip,
            take: pagination.limit,
            include: {
              creator: {
                select: {
                  id: true,
                  name: true,
                  walletAddress: true,
                },
              },
              _count: {
                select: { nfts: true },
              },
            },
            orderBy: { createdAt: 'desc' },
          })
        ),
        queryWithMetrics('getCollectionsCount', () =>
          prisma.nFTCollection.count({ where })
        ),
      ]);

      const totalPages = Math.ceil(total / pagination.limit);

      return {
        collections,
        total,
        page: pagination.page,
        limit: pagination.limit,
        totalPages,
      };
    } catch (error) {
      logger.error('Get collections error:', error);
      throw new AppError('Failed to fetch collections', 500);
    }
  }

  /**
   * Update collection
   */
  export async function updateCollection(
    id: string,
    creatorId: string,
    updateData: UpdateCollectionRequest
  ): Promise<NFTCollection> {
    try {
      // Verify ownership
      const existingCollection = await prisma.nFTCollection.findUnique({
        where: { id },
        select: { creatorId: true },
      });

      if (!existingCollection) {
        throw new AppError('Collection not found', 404);
      }

      if (existingCollection.creatorId !== creatorId) {
        throw new AppError('Not authorized to update this collection', 403);
      }

      // Validate royalty percentage if provided
      if (updateData.royaltyPercent !== undefined) {
        if (updateData.royaltyPercent < 0 || updateData.royaltyPercent > 10) {
          throw new AppError('Royalty percentage must be between 0 and 10', 400);
        }
      }

      // Prepare update data
      const updatePayload: Prisma.NFTCollectionUpdateInput = {};
      
      if (updateData.name !== undefined) updatePayload.name = updateData.name;
      if (updateData.description !== undefined) updatePayload.description = updateData.description;
      if (updateData.mintPrice !== undefined) updatePayload.mintPrice = updateData.mintPrice.toString();
      if (updateData.royaltyPercent !== undefined) updatePayload.royaltyPercent = updateData.royaltyPercent.toString();
      if (updateData.metadataURI !== undefined) updatePayload.metadataURI = updateData.metadataURI;
      if (updateData.imageURI !== undefined) updatePayload.imageURI = updateData.imageURI;
      if (updateData.isActive !== undefined) updatePayload.isActive = updateData.isActive;
      if (updateData.isPublic !== undefined) updatePayload.isPublic = updateData.isPublic;

      const collection = await queryWithMetrics('updateCollection', () =>
        prisma.nFTCollection.update({
          where: { id },
          data: updatePayload,
          include: {
            creator: {
              select: {
                id: true,
                email: true,
                name: true,
                walletAddress: true,
              },
            },
            _count: {
              select: { nfts: true },
            },
          },
        })
      );

      logger.info('Collection updated:', { id, creatorId, updates: Object.keys(updateData) });

      return collection;
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Update collection error:', error);
      throw new AppError('Collection update failed', 500);
    }
  }

  /**
   * Soft delete collection (deactivate)
   */
  export async function deleteCollection(id: string, creatorId: string): Promise<void> {
    try {
      // Verify ownership
      const existingCollection = await prisma.nFTCollection.findUnique({
        where: { id },
        select: { creatorId: true, name: true },
      });

      if (!existingCollection) {
        throw new AppError('Collection not found', 404);
      }

      if (existingCollection.creatorId !== creatorId) {
        throw new AppError('Not authorized to delete this collection', 403);
      }

      await queryWithMetrics('deleteCollection', () =>
        prisma.nFTCollection.update({
          where: { id },
          data: { 
            isActive: false,
            isPublic: false, // Hide from public listings
          },
        })
      );

      logger.info('Collection deactivated:', { 
        id, 
        name: existingCollection.name, 
        creatorId 
      });
    } catch (error) {
      if (error instanceof AppError) throw error;
      logger.error('Delete collection error:', error);
      throw new AppError('Collection deletion failed', 500);
    }
  }

  /**
   * Get collections by creator
   */
  export async function getCollectionsByCreator(
    creatorId: string,
    pagination: PaginationOptions = { page: 1, limit: 20 }
  ): Promise<{
    collections: NFTCollection[];
    total: number;
  }> {
    try {
      const skip = (pagination.page - 1) * pagination.limit;

      const [collections, total] = await Promise.all([
        queryWithMetrics('getCollectionsByCreator', () =>
          prisma.nFTCollection.findMany({
            where: { creatorId },
            skip,
            take: pagination.limit,
            include: {
              _count: {
                select: { nfts: true },
              },
            },
            orderBy: { createdAt: 'desc' },
          })
        ),
        queryWithMetrics('getCollectionsByCreatorCount', () =>
          prisma.nFTCollection.count({ where: { creatorId } })
        ),
      ]);

      return { collections, total };
    } catch (error) {
      logger.error('Get collections by creator error:', error);
      throw new AppError('Failed to fetch creator collections', 500);
    }
  }

  /**
   * Get collection statistics
   */
  export async function getCollectionStats(id: string): Promise<{
    totalNFTs: number;
    listedNFTs: number;
    totalVolume: number;
    floorPrice: number | null;
    uniqueOwners: number;
  }> {
    try {
      const [
        totalNFTs,
        listedNFTs,
        totalVolume,
        floorPrice,
        uniqueOwners,
      ] = await Promise.all([
        prisma.nFT.count({ where: { collectionId: id } }),
        prisma.nFT.count({ where: { collectionId: id, isListed: true } }),
        prisma.nFTTransaction.aggregate({
          where: {
            nft: { collectionId: id },
            transactionType: 'SALE',
          },
          _sum: { price: true },
        }),
        prisma.nFT.aggregate({
          where: {
            collectionId: id,
            isListed: true,
            listPrice: { not: null },
          },
          _min: { listPrice: true },
        }),
        prisma.nFT.findMany({
          where: { collectionId: id, ownerWallet: { not: null } },
          distinct: ['ownerWallet'],
          select: { ownerWallet: true },
        }).then(result => result.length),
      ]);

      return {
        totalNFTs,
        listedNFTs,
        totalVolume: Number(totalVolume._sum.price || 0),
        floorPrice: floorPrice._min.listPrice ? Number(floorPrice._min.listPrice) : null,
        uniqueOwners,
      };
    } catch (error) {
      logger.error('Get collection stats error:', error);
      throw new AppError('Failed to fetch collection statistics', 500);
    }
  }
}