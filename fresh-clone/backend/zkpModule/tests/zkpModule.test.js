// zkpModule.test.js
// Basic tests for ZKP module

const assert = require('assert');
const { verifyProof, generateProof } = require('../src/index');

describe('ZKP Module', () => {
  it('should generate a proof', () => {
    const proof = generateProof({ secret: 42 }, { statement: 'test' });
    assert.strictEqual(typeof proof, 'string');
  });

  it('should verify a proof', () => {
    const result = verifyProof('proof', { statement: 'test' });
    assert.strictEqual(result, true);
  });
});
