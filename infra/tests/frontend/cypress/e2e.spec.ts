/// <reference types="cypress" />

import { describe, beforeEach, it } from "node:test";
/// <reference types="cypress" />

describe('E2E Frontend Flow', () => {
    beforeEach(() => {
      cy.visit('/');
    });
  
    it('Loads the homepage', () => {
      cy.contains('Welcome').should('be.visible');
    });
  
    it('Allows user to login', () => {
      cy.login('testuser', 'testpassword');
      // Check for a successful login
      cy.url().should('include', '/dashboard');
    });
  
    it('Displays analytics from AI microservice', () => {
      // This test is an example
      cy.visit('/analytics');
      cy.contains('AI Insights').should('be.visible');
    });
  });
  