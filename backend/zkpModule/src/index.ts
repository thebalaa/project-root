// index.js
// Entry point for the ZKP module

const { verifyProof } = require('./zkpLogic').default;
const { generateProof } = require('./zkpProver').default;

module.exports = {
  verifyProof,
  generateProof,
};
