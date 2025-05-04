const swaggerUi = require('swagger-ui-express');
const yaml = require('yaml');
const fs = require('fs');
const path = require('path');

// OpenAPI 파일들을 읽어서 병합
const openApiSpec = yaml.parse(fs.readFileSync(path.join(__dirname, '../docs/openapi.yaml'), 'utf8'));
const openApiPaths = yaml.parse(fs.readFileSync(path.join(__dirname, '../docs/openapi-paths.yaml'), 'utf8'));

// paths를 openApi 스펙에 병합
openApiSpec.paths = openApiPaths.paths;

// Swagger UI 설정 함수
const setupSwagger = (app) => {
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openApiSpec));
};

module.exports = setupSwagger;