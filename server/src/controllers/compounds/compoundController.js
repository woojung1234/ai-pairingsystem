/**
 * Compound Controller - 화합물 관련 비즈니스 로직
 */
const Compound = require('../../models/Compound');
const Node = require('../../models/mysql/Node');
const Edge = require('../../models/mysql/Edge');
const logger = require('../../utils/logger');

/**
 * @desc    모든 화합물 조회
 * @route   GET /api/compounds
 * @access  Public
 */
const getAllCompounds = async (req, res) => {
  try {
    const compounds = await Compound.findAll();
    res.json(compounds);
  } catch (error) {
    logger.error(`Error in getAllCompounds: ${error.message}`);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * @desc    특정 화합물 조회
 * @route   GET /api/compounds/:id
 * @access  Public
 */
const getCompoundById = async (req, res) => {
  try {
    const compound = await Compound.findById(req.params.id);
    
    if (!compound) {
      return res.status(404).json({ message: 'Compound not found' });
    }

    // 관련 엣지 정보도 함께 조회
    const edges = await Edge.findByNodeId(compound.node_id);
    
    res.json({
      ...compound,
      relationships: edges
    });
  } catch (error) {
    logger.error(`Error in getCompoundById: ${error.message}`);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * @desc    화합물 검색
 * @route   GET /api/compounds/search/:query
 * @access  Public
 */
const searchCompounds = async (req, res) => {
  try {
    const { query } = req.params;
    
    if (!query || query.trim() === '') {
      return res.status(400).json({ message: 'Search query is required' });
    }

    const compounds = await Compound.search(query);
    res.json(compounds);
  } catch (error) {
    logger.error(`Error in searchCompounds: ${error.message}`);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * @desc    새 화합물 생성
 * @route   POST /api/compounds
 * @access  Private/Admin
 */
const createCompound = async (req, res) => {
  try {
    const { node_id, name, external_id, chemical_formula, description } = req.body;

    // node_id 중복 확인
    const existingNode = await Node.findByNodeId(node_id);
    if (existingNode) {
      return res.status(400).json({ message: 'Node with this ID already exists' });
    }

    // 노드 생성
    const nodeData = {
      node_id,
      name,
      external_id,
      node_type: 'compound',
      description
    };
    const node = await Node.create(nodeData);

    // 화합물 데이터 생성
    const compoundData = {
      node_id: node.id,
      name,
      external_id,
      chemical_formula,
      description
    };
    const compound = await Compound.create(compoundData);

    res.status(201).json(compound);
  } catch (error) {
    logger.error(`Error in createCompound: ${error.message}`);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * @desc    화합물 정보 수정
 * @route   PUT /api/compounds/:id
 * @access  Private/Admin
 */
const updateCompound = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const compound = await Compound.findById(id);
    if (!compound) {
      return res.status(404).json({ message: 'Compound not found' });
    }

    // 화합물 업데이트
    if (updateData.name || updateData.external_id || updateData.chemical_formula || updateData.description) {
      await Compound.update(id, updateData);
    }

    // 노드 테이블도 업데이트
    if (updateData.name || updateData.description) {
      const nodeUpdateData = {};
      if (updateData.name) nodeUpdateData.name = updateData.name;
      if (updateData.description) nodeUpdateData.description = updateData.description;
      await Node.update(compound.node_id, nodeUpdateData);
    }

    const updatedCompound = await Compound.findById(id);
    res.json(updatedCompound);
  } catch (error) {
    logger.error(`Error in updateCompound: ${error.message}`);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * @desc    화합물 삭제
 * @route   DELETE /api/compounds/:id
 * @access  Private/Admin
 */
const deleteCompound = async (req, res) => {
  try {
    const { id } = req.params;

    const compound = await Compound.findById(id);
    if (!compound) {
      return res.status(404).json({ message: 'Compound not found' });
    }

    // 화합물 삭제 (CASCADE로 노드도 자동 삭제)
    await Compound.delete(id);

    res.json({ message: 'Compound deleted successfully' });
  } catch (error) {
    logger.error(`Error in deleteCompound: ${error.message}`);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  getAllCompounds,
  getCompoundById,
  searchCompounds,
  createCompound,
  updateCompound,
  deleteCompound
};
