const swaggerJsdoc = require('swagger-jsdoc');
const yaml = require('yaml');
const fs = require('fs');
const path = require('path');

// OpenAPI 파일들을 읽어서 병합
const openApiSpec = yaml.parse(fs.readFileSync(path.join(__dirname, '../docs/openapi.yaml'), 'utf8'));
const openApiPaths = yaml.parse(fs.readFileSync(path.join(__dirname, '../docs/openapi-paths.yaml'), 'utf8'));

// paths를 openApi 스펙에 병합
openApiSpec.paths = openApiPaths.paths;

// Swagger 설정
const swaggerOptions = {
  definition: openApiSpec,
  apis: [], // 이미 YAML로 정의했으므로 비워둠
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

module.exports = swaggerSpec;
