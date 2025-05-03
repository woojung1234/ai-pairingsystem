/**
 * MySQL 모델 인덱스 파일
 * 모든 모델을 통합하여 내보냅니다.
 */
const Liquor = require('./Liquor');
const Ingredient = require('./Ingredient');
const Pairing = require('./Pairing');
const User = require('./User');

module.exports = {
  Liquor,
  Ingredient,
  Pairing,
  User
};