/**
 * Edge Controller - 엣지 관련 비즈니스 로직
 */
const Edge = require('../models/mysql/Edge');
const Node = require('../models/mysql/Node');
const logger = require('../utils/logger');

/**
 * @desc    모든 엣지 조회
 * @route   GET /api/edges
 * @access  Public
 */
const getAllEdges = async (req, res) => {
  try {
    const edges = await Edge.getAll();
    return res.json({
      success: true,
      count: edges.length,
      data: edges
    });
  } catch (error) {
    logger.error(`Error in getAllEdges: ${error.message}`);
    return res.status(500).json({ success: false, error: 'Server error' });
  }
};

/**
 * @desc    특정 노드 간 엣지 조회
 * @route   GET /api/edges/:sourceId/:targetId
 * @access  Public
 */
const getEdgeByNodes = async (req, res) => {
  try {
    const { sourceId, targetId } = req.params;
    
    const edge = await Edge.getByNodes(sourceId, targetId);
    
    if (!edge) {
      return res.status(404).json({ success: false, error: 'Edge not found' });
    }

    return res.json({
      success: true,
      data: edge
    });
  } catch (error) {
    logger.error(`Error in getEdgeByNodes: ${error.message}`);
    return res.status(500).json({ success: false, error: 'Server error' });
  }
};


/**
 * @desc    특정 ID로 엣지 조회
 * @route   GET /api/edges/:id
 * @access  Public
 */
const getEdgeById = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    
    const edge = await Edge.getById(id);
    
    if (!edge) {
      return res.status(404).json({ success: false, error: 'Edge not found' });
    }

    return res.json({
      success: true,
      data: edge
    });
  } catch (error) {
    logger.error(`Error in getEdgeById: ${error.message}`);
    return res.status(500).json({ success: false, error: 'Server error' });
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
    
    // Node 모델 메서드 수정 필요할 수 있음
    const node = await Node.getByNodeId(nodeId);
    if (!node) {
      return res.status(404).json({ success: false, error: 'Node not found' });
    }

    const edges = await Edge.getByNodeId(nodeId);
    return res.json({
      success: true,
      count: edges.length,
      data: edges
    });
  } catch (error) {
    logger.error(`Error in getEdgesByNode: ${error.message}`);
    return res.status(500).json({ success: false, error: 'Server error' });
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
    
    const edges = await Edge.getByType(edgeType);
    return res.json({
      success: true,
      count: edges.length,
      data: edges
    });
  } catch (error) {
    logger.error(`Error in getEdgesByType: ${error.message}`);
    return res.status(500).json({ success: false, error: 'Server error' });
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
    const sourceNode = await Node.getById(source_id);
    const targetNode = await Node.getById(target_id);

    if (!sourceNode || !targetNode) {
      return res.status(400).json({ success: false, error: 'Invalid source or target node ID' });
    }

    const edgeData = {
      source_id,
      target_id,
      score: score || null,
      edge_type
    };

    const edge = await Edge.create(edgeData);
    return res.status(201).json({
      success: true,
      data: edge
    });
  } catch (error) {
    logger.error(`Error in createEdge: ${error.message}`);
    return res.status(500).json({ success: false, error: 'Server error' });
  }
};

/**
 * @desc    엣지 정보 수정
 * @route   PUT /api/edges/:id
 * @access  Private/Admin
 */
const updateEdge = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const updateData = req.body;

    const edge = await Edge.getById(id);
    if (!edge) {
      return res.status(404).json({ success: false, error: 'Edge not found' });
    }

    const success = await Edge.update(id, updateData);
    
    if (!success) {
      return res.status(400).json({ success: false, error: 'Failed to update edge' });
    }
    
    const updatedEdge = await Edge.getById(id);
    return res.json({
      success: true,
      data: updatedEdge
    });
  } catch (error) {
    logger.error(`Error in updateEdge: ${error.message}`);
    return res.status(500).json({ success: false, error: 'Server error' });
  }
};

/**
 * @desc    엣지 삭제
 * @route   DELETE /api/edges/:id
 * @access  Private/Admin
 */
const deleteEdge = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    const edge = await Edge.getById(id);
    if (!edge) {
      return res.status(404).json({ success: false, error: 'Edge not found' });
    }

    const success = await Edge.delete(id);
    
    if (!success) {
      return res.status(400).json({ success: false, error: 'Failed to delete edge' });
    }

    return res.json({
      success: true,
      data: {}
    });
  } catch (error) {
    logger.error(`Error in deleteEdge: ${error.message}`);
    return res.status(500).json({ success: false, error: 'Server error' });
  }
};

module.exports = {
  getAllEdges,
  getEdgeById,
  getEdgeByNodes,
  getEdgesByNode,
  getEdgesByType,
  createEdge,
  updateEdge,
  deleteEdge
};
