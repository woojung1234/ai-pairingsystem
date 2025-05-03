/**
 * Admin routes
 */
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin/adminController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

// 데이터 import
router.post('/import/nodes', authMiddleware, adminMiddleware, adminController.importNodes);
router.post('/import/edges', authMiddleware, adminMiddleware, adminController.importEdges);

// 페어링 점수 재계산
router.post('/recalculate', authMiddleware, adminMiddleware, adminController.recalculatePairings);

// 시스템 통계
router.get('/stats', authMiddleware, adminMiddleware, adminController.getSystemStats);

// 데이터베이스 상태 확인
router.get('/health', authMiddleware, adminMiddleware, adminController.checkHealth);

// 로그 조회
router.get('/logs', authMiddleware, adminMiddleware, adminController.getLogs);

module.exports = router;
