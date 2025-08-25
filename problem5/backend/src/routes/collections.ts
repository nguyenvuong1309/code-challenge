import express from 'express';
import Joi from 'joi';

import { AppError } from '../middleware/errorHandler';
import { authenticateToken, optionalAuth } from '../middleware/auth';
import { CollectionService } from '../services/collectionService';
import { 
  AuthenticatedRequest, 
  CreateCollectionRequest, 
  UpdateCollectionRequest, 
  CollectionFilters 
} from '../types';

const router = express.Router();

// Validation schemas
const createCollectionSchema = Joi.object({
  name: Joi.string().min(1).max(100).required(),
  symbol: Joi.string().min(1).max(20).required(),
  description: Joi.string().max(1000).optional(),
  chainId: Joi.number().valid(1, 56, 137, 43114, 42161).required(),
  maxSupply: Joi.number().positive().optional(),
  mintPrice: Joi.number().min(0).required(),
  royaltyPercent: Joi.number().min(0).max(10).required(),
  metadataURI: Joi.string().uri().optional(),
  imageURI: Joi.string().uri().optional(),
  isPublic: Joi.boolean().default(true),
});

const updateCollectionSchema = Joi.object({
  name: Joi.string().min(1).max(100).optional(),
  description: Joi.string().max(1000).optional().allow(null),
  mintPrice: Joi.number().min(0).optional(),
  royaltyPercent: Joi.number().min(0).max(10).optional(),
  metadataURI: Joi.string().uri().optional().allow(null),
  imageURI: Joi.string().uri().optional().allow(null),
  isActive: Joi.boolean().optional(),
  isPublic: Joi.boolean().optional(),
});

const querySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  chainId: Joi.number().optional(),
  creatorId: Joi.string().uuid().optional(),
  isActive: Joi.boolean().optional(),
  isPublic: Joi.boolean().optional(),
  search: Joi.string().max(100).optional(),
});

/**
 * @swagger
 * /api/collections:
 *   post:
 *     summary: Create new NFT collection
 *     description: Create a new NFT collection (requires authentication)
 *     tags:
 *       - NFT Collections
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - symbol
 *               - chainId
 *               - mintPrice
 *               - royaltyPercent
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 100
 *                 example: "Crypto Punks"
 *               symbol:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 20
 *                 example: "PUNK"
 *               description:
 *                 type: string
 *                 maxLength: 1000
 *                 example: "10,000 unique collectible characters"
 *               chainId:
 *                 type: integer
 *                 enum: [1, 56, 137, 43114, 42161]
 *                 example: 1
 *                 description: "1=Ethereum, 56=BSC, 137=Polygon, 43114=Avalanche, 42161=Arbitrum"
 *               maxSupply:
 *                 type: integer
 *                 minimum: 1
 *                 example: 10000
 *               mintPrice:
 *                 type: number
 *                 minimum: 0
 *                 example: 0.08
 *               royaltyPercent:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 10
 *                 example: 2.5
 *               metadataURI:
 *                 type: string
 *                 format: uri
 *                 example: "https://api.example.com/metadata/{id}"
 *               imageURI:
 *                 type: string
 *                 format: uri
 *                 example: "https://images.example.com/collection.png"
 *               isPublic:
 *                 type: boolean
 *                 default: true
 *     responses:
 *       201:
 *         description: Collection created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     collection:
 *                       $ref: '#/components/schemas/NFTCollection'
 *       400:
 *         description: Validation error or collection name/symbol already exists
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Internal server error
 */
router.post('/', authenticateToken, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { error } = createCollectionSchema.validate(req.body);
    if (error) {
      throw new AppError(error.details[0].message, 400);
    }

    const collectionData = req.body as CreateCollectionRequest;
    const collection = await CollectionService.createCollection(req.user!.id, collectionData);

    res.status(201).json({
      success: true,
      data: { collection },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/collections:
 *   get:
 *     summary: Get NFT collections with filtering
 *     description: Retrieve paginated list of NFT collections with optional filtering
 *     tags:
 *       - NFT Collections
 *     parameters:
 *       - name: page
 *         in: query
 *         description: Page number (starts from 1)
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *       - name: limit
 *         in: query
 *         description: Number of items per page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *       - name: chainId
 *         in: query
 *         description: Filter by blockchain chain ID
 *         schema:
 *           type: integer
 *           enum: [1, 56, 137, 43114, 42161]
 *       - name: creatorId
 *         in: query
 *         description: Filter by creator user ID
 *         schema:
 *           type: string
 *           format: uuid
 *       - name: isActive
 *         in: query
 *         description: Filter by active status
 *         schema:
 *           type: boolean
 *       - name: isPublic
 *         in: query
 *         description: Filter by public visibility
 *         schema:
 *           type: boolean
 *       - name: search
 *         in: query
 *         description: Search in name, description, and symbol
 *         schema:
 *           type: string
 *           maxLength: 100
 *     responses:
 *       200:
 *         description: Collections retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     collections:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/NFTCollection'
 *                 pagination:
 *                   $ref: '#/components/schemas/Pagination'
 *       500:
 *         description: Internal server error
 */
router.get('/', optionalAuth, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { error, value: queryParams } = querySchema.validate(req.query);
    if (error) {
      throw new AppError(error.details[0].message, 400);
    }

    const { page, limit, ...filters } = queryParams;
    const result = await CollectionService.getCollections(filters as CollectionFilters, { page, limit });

    res.json({
      success: true,
      data: {
        collections: result.collections,
      },
      pagination: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: result.totalPages,
        hasNext: result.page < result.totalPages,
        hasPrevious: result.page > 1,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/collections/{id}:
 *   get:
 *     summary: Get collection by ID
 *     description: Retrieve detailed information about a specific NFT collection
 *     tags:
 *       - NFT Collections
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Collection ID
 *         schema:
 *           type: string
 *           format: uuid
 *       - name: includeNFTs
 *         in: query
 *         description: Include first 20 NFTs in response
 *         schema:
 *           type: boolean
 *           default: false
 *     responses:
 *       200:
 *         description: Collection retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     collection:
 *                       $ref: '#/components/schemas/NFTCollection'
 *       404:
 *         description: Collection not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const includeNFTs = req.query.includeNFTs === 'true';
    
    const collection = await CollectionService.getCollectionById(id, includeNFTs);
    
    if (!collection) {
      throw new AppError('Collection not found', 404);
    }

    res.json({
      success: true,
      data: { collection },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/collections/{id}:
 *   put:
 *     summary: Update collection
 *     description: Update NFT collection details (creator only)
 *     tags:
 *       - NFT Collections
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Collection ID
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 1
 *                 maxLength: 100
 *               description:
 *                 type: string
 *                 maxLength: 1000
 *                 nullable: true
 *               mintPrice:
 *                 type: number
 *                 minimum: 0
 *               royaltyPercent:
 *                 type: number
 *                 minimum: 0
 *                 maximum: 10
 *               metadataURI:
 *                 type: string
 *                 format: uri
 *                 nullable: true
 *               imageURI:
 *                 type: string
 *                 format: uri
 *                 nullable: true
 *               isActive:
 *                 type: boolean
 *               isPublic:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Collection updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     collection:
 *                       $ref: '#/components/schemas/NFTCollection'
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Not authorized to update this collection
 *       404:
 *         description: Collection not found
 *       500:
 *         description: Internal server error
 */
router.put('/:id', authenticateToken, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { error } = updateCollectionSchema.validate(req.body);
    if (error) {
      throw new AppError(error.details[0].message, 400);
    }

    const { id } = req.params;
    const updateData = req.body as UpdateCollectionRequest;
    
    const collection = await CollectionService.updateCollection(id, req.user!.id, updateData);

    res.json({
      success: true,
      data: { collection },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/collections/{id}:
 *   delete:
 *     summary: Delete collection (soft delete)
 *     description: Deactivate NFT collection (creator only) - this is a soft delete
 *     tags:
 *       - NFT Collections
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Collection ID
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Collection deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Collection deactivated successfully"
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Not authorized to delete this collection
 *       404:
 *         description: Collection not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:id', authenticateToken, async (req: AuthenticatedRequest, res, next) => {
  try {
    const { id } = req.params;
    
    await CollectionService.deleteCollection(id, req.user!.id);

    res.json({
      success: true,
      message: 'Collection deactivated successfully',
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/collections/{id}/stats:
 *   get:
 *     summary: Get collection statistics
 *     description: Get statistical information about an NFT collection
 *     tags:
 *       - NFT Collections
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         description: Collection ID
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     stats:
 *                       type: object
 *                       properties:
 *                         totalNFTs:
 *                           type: integer
 *                           example: 10000
 *                         listedNFTs:
 *                           type: integer
 *                           example: 1250
 *                         totalVolume:
 *                           type: number
 *                           example: 45.67
 *                         floorPrice:
 *                           type: number
 *                           nullable: true
 *                           example: 0.15
 *                         uniqueOwners:
 *                           type: integer
 *                           example: 6543
 *       404:
 *         description: Collection not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id/stats', async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // First check if collection exists
    const collection = await CollectionService.getCollectionById(id);
    if (!collection) {
      throw new AppError('Collection not found', 404);
    }

    const stats = await CollectionService.getCollectionStats(id);

    res.json({
      success: true,
      data: { stats },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * @swagger
 * /api/collections/creator/{creatorId}:
 *   get:
 *     summary: Get collections by creator
 *     description: Get all collections created by a specific user
 *     tags:
 *       - NFT Collections
 *     parameters:
 *       - name: creatorId
 *         in: path
 *         required: true
 *         description: Creator user ID
 *         schema:
 *           type: string
 *           format: uuid
 *       - name: page
 *         in: query
 *         description: Page number
 *         schema:
 *           type: integer
 *           minimum: 1
 *           default: 1
 *       - name: limit
 *         in: query
 *         description: Items per page
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *     responses:
 *       200:
 *         description: Creator collections retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     collections:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/NFTCollection'
 *                     total:
 *                       type: integer
 *       500:
 *         description: Internal server error
 */
router.get('/creator/:creatorId', async (req, res, next) => {
  try {
    const { creatorId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 100);

    const result = await CollectionService.getCollectionsByCreator(creatorId, { page, limit });

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
});

export default router;