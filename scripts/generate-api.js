#!/usr/bin/env node
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Configuration
const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000';
const OUTPUT_PATH = path.resolve(__dirname, '../lib/api/generated');
const MODELS_PATH = path.resolve(OUTPUT_PATH, 'models');
const SERVICES_PATH = path.resolve(OUTPUT_PATH, 'services');

console.log('🚀 Generating API client from OpenAPI spec...');
console.log(`📌 API URL: ${API_URL}`);
console.log(`📁 Output path: ${OUTPUT_PATH}`);

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_PATH)) {
  fs.mkdirSync(OUTPUT_PATH, { recursive: true });
  console.log(`📂 Created output directory: ${OUTPUT_PATH}`);
}

try {
  // Fetch the OpenAPI spec from the server
  console.log('📥 Fetching OpenAPI spec from server...');
  
  // Generate API client using openapi-typescript-codegen
  execSync(
    `npx openapi-typescript-codegen --input ${API_URL}/swagger.json --output ${OUTPUT_PATH} --client fetch --name ClimbCoachApi`,
    { stdio: 'inherit' }
  );

  // Create a more specific index.ts file rather than using wildcards
  console.log('📝 Creating proper index file...');
  
  // Get all service files
  const serviceFiles = fs.readdirSync(SERVICES_PATH)
    .filter(file => file.endsWith('.ts'))
    .map(file => file.replace('.ts', ''));
    
  // Get all model files
  const modelFiles = fs.readdirSync(MODELS_PATH)
    .filter(file => file.endsWith('.ts'))
    .map(file => file.replace('.ts', ''));
  
  // Create the index content with specific imports
  const indexContent = `// Export services
${serviceFiles.map(service => `export * from './services/${service}';`).join('\n')}

// Export models
${modelFiles.map(model => `export * from './models/${model}';`).join('\n')}

// Export core
export * from './core/request';

// Export API client
export * from './ClimbCoachApi';
`;

  fs.writeFileSync(path.resolve(OUTPUT_PATH, 'index.ts'), indexContent);
  
  console.log('✅ API client generated successfully!');
  console.log(`📁 Models: ${MODELS_PATH}`);
  console.log(`📁 Services: ${SERVICES_PATH}`);
} catch (error) {
  console.error('❌ Error generating API client:');
  console.error(error.message);
  process.exit(1);
} 