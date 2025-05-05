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
    const compounds = await Compound.getAll();
    res.json({
      success: true,
      count: compounds.length,
      data: compounds
    });
  } catch (error) {
    logger.error(`Error in getAllCompounds: ${error.message}`);
    res.status(500).json({ success: false, error: 'Server error' });
  }
};

/**
 * @desc    특정 화합물 조회
 * @route   GET /api/compounds/:id
 * @access  Public
 */
const getCompoundById = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const compound = await Compound.getById(id);
    
    if (!compound) {
      return res.status(404).json({ success: false, error: 'Compound not found' });
    }

    // 관련 엣지 정보도 함께 조회 (Edge 모델 수정 필요한 경우 추가 작업)
    // const edges = await Edge.getByNodeId(compound.node_id);
    
    return res.json({
      success: true,
      data: compound
      // relationships: edges (Edge 모델 수정 후 활성화)
    });
  } catch (error) {
    logger.error(`Error in getCompoundById: ${error.message}`);
    return res.status(500).json({ success: false, error: 'Server error' });
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
      return res.status(400).json({ success: false, error: 'Search query is required' });
    }

    const compounds = await Compound.searchByName(query);
    return res.json({
      success: true,
      count: compounds.length,
      data: compounds
    });
  } catch (error) {
    logger.error(`Error in searchCompounds: ${error.message}`);
    return res.status(500).json({ success: false, error: 'Server error' });
  }
};

/**
 * @desc    새 화합물 생성
 * @route   POST /api/compounds
 * @access  Private/Admin
 */
const createCompound = async (req, res) => {
  try {
    const { name, externalId, chemicalFormula, description, isHub } = req.body;

    // 화합물 데이터 생성
    const compoundData = {
      name,
      externalId,
      chemicalFormula,
      description,
      isHub: isHub || false
    };
    
    const newCompoundId = await Compound.create(compoundData);
    const newCompound = await Compound.getById(newCompoundId);

    return res.status(201).json({
      success: true,
      data: newCompound
    });
  } catch (error) {
    logger.error(`Error in createCompound: ${error.message}`);
    return res.status(500).json({ success: false, error: 'Server error' });
  }
};

/**
 * @desc    화합물 정보 수정
 * @route   PUT /api/compounds/:id
 * @access  Private/Admin
 */
const updateCompound = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const compoundData = req.body;

    // 화합물 존재 확인
    const compound = await Compound.getById(id);
    if (!compound) {
      return res.status(404).json({ success: false, error: 'Compound not found' });
    }

    // 화합물 업데이트
    const success = await Compound.update(id, compoundData);
    
    if (!success) {
      return res.status(400).json({ success: false, error: 'Failed to update compound' });
    }
    
    const updatedCompound = await Compound.getById(id);
    return res.json({
      success: true,
      data: updatedCompound
    });
  } catch (error) {
    logger.error(`Error in updateCompound: ${error.message}`);
    return res.status(500).json({ success: false, error: 'Server error' });
  }
};

/**
 * @desc    화합물 삭제
 * @route   DELETE /api/compounds/:id
 * @access  Private/Admin
 */
const deleteCompound = async (req, res) => {
  try {
    const id = parseInt(req.params.id);

    // 화합물 존재 확인
    const compound = await Compound.getById(id);
    if (!compound) {
      return res.status(404).json({ success: false, error: 'Compound not found' });
    }

    // 화합물 삭제
    const success = await Compound.delete(id);
    
    if (!success) {
      return res.status(400).json({ success: false, error: 'Failed to delete compound' });
    }

    return res.json({
      success: true,
      data: {}
    });
  } catch (error) {
    logger.error(`Error in deleteCompound: ${error.message}`);
    return res.status(500).json({ success: false, error: 'Server error' });
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
