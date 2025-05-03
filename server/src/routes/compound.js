/**
 * Compound routes
 */
const express = require('express');
const router = express.Router();
const compoundController = require('../controllers/compounds/compoundController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

// Compounds - 모든 화합물 목록 조회
router.get('/', compoundController.getAllCompounds);

// Compounds - 특정 화합물 상세 정보 조회
router.get('/:id', compoundController.getCompoundById);

// Compounds - 화합물 검색
router.get('/search/:query', compoundController.searchCompounds);

// Admin routes (화합물 추가, 수정, 삭제)
router.post('/', authMiddleware, adminMiddleware, compoundController.createCompound);
router.put('/:id', authMiddleware, adminMiddleware, compoundController.updateCompound);
router.delete('/:id', authMiddleware, adminMiddleware, compoundController.deleteCompound);

module.exports = router;
