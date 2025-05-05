/**
 * Edge routes
 */
const express = require('express');
const router = express.Router();
const edgeController = require('../controllers/edgeController');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

// 모든 엣지 목록 조회
router.get('/', edgeController.getAllEdges);

// 특정 타입의 엣지 목록 조회
router.get('/type/:edgeType', edgeController.getEdgesByType);

// 특정 노드와 연결된 모든 엣지 조회
router.get('/node/:nodeId', edgeController.getEdgesByNode);

// ID로 특정 엣지 조회
router.get('/:id([0-9]+)', edgeController.getEdgeById);

// 특정 노드 간 엣지 조회
router.get('/:sourceId/:targetId', edgeController.getEdgeByNodes);

// Admin routes (엣지 추가, 수정, 삭제)
router.post('/', authMiddleware, adminMiddleware, edgeController.createEdge);
router.put('/:id', authMiddleware, adminMiddleware, edgeController.updateEdge);
router.delete('/:id', authMiddleware, adminMiddleware, edgeController.deleteEdge);

module.exports = router;
