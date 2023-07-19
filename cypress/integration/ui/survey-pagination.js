import 'cypress-wait-until';

context('Pagination Test', () => {
  describe('Pagination UI', () => {
    before(() => {
      cy.loginOkta(Cypress.env('username'), Cypress.env('password'));
    });
    beforeEach(() => {
      cy.restoreLocalStorage(); // restore access token
    });
    afterEach(() => {
      cy.saveLocalStorage(); // save access token for the next test
    });

    let totalNumberOfSurveys;

    it('Survey Pagination: Load Surveys Page and Get total Number of surveys ', () => {
      cy.intercept('/api/surveys?*').as('surveyAPI');

      cy.visit('');
      cy.url().should('include', 'kbr-builder.dev.kargo.com/');
      cy.wait('@surveyAPI');
      cy.get('.page.QA-chevron-left').should('have.class', 'is-disabled');
      // getting the number of total surveys
      cy.get('.QA-totalPages').then((totalPages) => {
        totalNumberOfSurveys = totalPages.text().split('of ')[1].replace(' ', '').replace('entries ', '');
        cy.log(totalNumberOfSurveys);
      });
    });

    it('Survey Pagination: Verify < arrow is disabled by default', () => {
      cy.get('.page.QA-chevron-left').should('have.class', 'is-disabled');
      if (totalNumberOfSurveys < 26) {
        cy.log('No pagination for this page, < 26 rows');
      } else {
        cy.get('.page.QA-chevron-left').should('have.class', 'is-disabled');
      }
    });

    it('Survey Pagination: Verify the user is able to navigate between pages by clicking on >,< arrows.', () => {
      cy.intercept('/api/surveys?*').as('surveyAPI');

      if (totalNumberOfSurveys < 26) {
        cy.log('No pagination for this page, < 26 rows');
      } else {
        cy.get('.page.QA-chevron-right').click();
        cy.wait('@surveyAPI');
        cy.get('.QA-totalPages').should('contain', `Showing 26 to 50 of ${totalNumberOfSurveys} entries`);
        cy.get('.page.QA-chevron-left').click();
        cy.wait('@surveyAPI');
        cy.get('.QA-totalPages').should('contain', `Showing 1 to 25 of ${totalNumberOfSurveys} entries`);
      }
    });

    it('Survey Pagination: Verify when clicking on 50 displayed results changes', () => {
      cy.intercept('/api/surveys?limit=50&page=1*').as('surveyAPI');

      if (totalNumberOfSurveys < 26) {
        cy.log('No pagination for this page, < 26 rows');
      } else {
        cy.get('.QA-pageLength-50').contains('50').click();
        cy.wait('@surveyAPI');
        cy.get('survey-card').its('length').should('be.greaterThan', 25, { timeout: 8000 });
        cy.get('survey-card').its('length').should('be.lessThan', 51);
      }
    });

    it('Survey Pagination: Verify when clicking on 75 displayed results changes', () => {
      cy.intercept('/api/surveys?limit=75&page=1*').as('surveyAPI');

      // check if data > 50 we will check 75, otherwise no need to check
      if (totalNumberOfSurveys < 26) {
        cy.log('No pagination for this page, < 26 rows');
      } else if (totalNumberOfSurveys > 50) {
        cy.get('.QA-pageLength-75').contains('75').click();
        cy.wait('@surveyAPI');
        cy.get('survey-card').its('length').should('be.greaterThan', 50, { timeout: 8000 });
        cy.get('survey-card').its('length').should('be.lessThan', 76);
      }
    });

    it('Survey Pagination: Verify when clicking on 25 displayed results changes', () => {
      cy.intercept('/api/surveys?limit=25&page=1*').as('surveyAPI');

      if (totalNumberOfSurveys < 25) {
        cy.log('No pagination for this page, < 25 rows');
      } else {
        cy.get('.QA-pageLength-25').contains('25').click();
        cy.wait('@surveyAPI');
        cy.get('survey-card').its('length').should('eq', 25);
      }
    });

    it('Survey Pagination: Verify when clicking on page number "2", active number page changes', () => {
      cy.intercept('/api/surveys?limit=25&page=2*').as('surveyAPI');

      if (totalNumberOfSurveys < 26) {
        cy.log('No pagination for this page, < 26 rows');
      } else {
        cy.get('.page.QA-chevron-left+.page+.page').click().wait('@surveyAPI');
        cy.get('p2.is-active').should('contain', '2');
      }
    });
  });
});
