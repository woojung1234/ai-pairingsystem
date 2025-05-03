/**
 * Edge Controller - 엣지 관련 비즈니스 로직
 */
const Edge = require('../models/mysql/Edge');
const Node = require('../models/mysql/Node');
const logger = require('../utils/logger');

/**
 * @desc    특정 노드 간 엣지 조회
 * @route   GET /api/edges/:sourceId/:targetId
 * @access  Public
 */
const getEdgeByNodes = async (req, res) => {
  try {
    const { sourceId, targetId } = req.params;
    
    const edge = await Edge.findByNodes(sourceId, targetId);
    
    if (!edge) {
      return res.status(404).json({ message: 'Edge not found' });
    }

    res.json(edge);
  } catch (error) {
    logger.error(`Error in getEdgeByNodes: ${error.message}`);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * @desc    특정 노드와 연결된 모든 엣지 조회
 * @route   GET /api/edges/node/:nodeId
 * @access  Public
 */
const getEdgesByNode = async (req, res) => {
  try {
    const { nodeId } = req.params;
    
    const node = await Node.findByNodeId(nodeId);
    if (!node) {
      return res.status(404).json({ message: 'Node not found' });
    }

    const edges = await Edge.findByNodeId(nodeId);
    res.json(edges);
  } catch (error) {
    logger.error(`Error in getEdgesByNode: ${error.message}`);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * @desc    특정 타입의 엣지 목록 조회
 * @route   GET /api/edges/type/:edgeType
 * @access  Public
 */
const getEdgesByType = async (req, res) => {
  try {
    const { edgeType } = req.params;
    
    const edges = await Edge.findByType(edgeType);
    res.json(edges);
  } catch (error) {
    logger.error(`Error in getEdgesByType: ${error.message}`);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * @desc    새 엣지 생성
 * @route   POST /api/edges
 * @access  Private/Admin
 */
const createEdge = async (req, res) => {
  try {
    const { source_id, target_id, score, edge_type } = req.body;

    // 소스와 타겟 노드 존재 확인
    const sourceNode = await Node.findByNodeId(source_id);
    const targetNode = await Node.findByNodeId(target_id);

    if (!sourceNode || !targetNode) {
      return res.status(400).json({ message: 'Invalid source or target node ID' });
    }

    const edgeData = {
      source_id: sourceNode.id,
      target_id: targetNode.id,
      score: score || null,
      edge_type
    };

    const edge = await Edge.create(edgeData);
    res.status(201).json(edge);
  } catch (error) {
    logger.error(`Error in createEdge: ${error.message}`);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * @desc    엣지 정보 수정
 * @route   PUT /api/edges/:id
 * @access  Private/Admin
 */
const updateEdge = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const edge = await Edge.findById(id);
    if (!edge) {
      return res.status(404).json({ message: 'Edge not found' });
    }

    const updatedEdge = await Edge.update(id, updateData);
    res.json(updatedEdge);
  } catch (error) {
    logger.error(`Error in updateEdge: ${error.message}`);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * @desc    엣지 삭제
 * @route   DELETE /api/edges/:id
 * @access  Private/Admin
 */
const deleteEdge = async (req, res) => {
  try {
    const { id } = req.params;

    const edge = await Edge.findById(id);
    if (!edge) {
      return res.status(404).json({ message: 'Edge not found' });
    }

    await Edge.delete(id);
    res.json({ message: 'Edge deleted successfully' });
  } catch (error) {
    logger.error(`Error in deleteEdge: ${error.message}`);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  getEdgeByNodes,
  getEdgesByNode,
  getEdgesByType,
  createEdge,
  updateEdge,
  deleteEdge
};
