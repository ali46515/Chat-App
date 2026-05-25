/** @type {import('jest').Config} */
module.exports = {
  testEnvironment: 'node',    
  extensionsToTreatAsEsm: ['.js'],  
  verbose: true,
  // Setup file to silence console.log noise
  setupFilesAfterEnv: ['./jest.setup.js'],
};