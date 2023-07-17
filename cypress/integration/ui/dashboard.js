import 'cypress-wait-until';

context('Dashboard UI Test', () => {
  describe('Verify Dashboard in UI', () => {
    before(() => {
      cy.loginOkta(Cypress.env('username'), Cypress.env('password'));
    });
    beforeEach(() => {
      cy.restoreLocalStorage(); // restore access token
    });
    afterEach(() => {
      cy.saveLocalStorage(); // save access token for the next test
    });

    it('Verify dashboard is loaded correctly and verify its elements', () => {
      cy.intercept('/api/surveys?*').as('surveyAPI');

      cy.visit('');
      cy.url().should('include', 'kbr-builder.dev.kargo.com/');
      cy.wait('@surveyAPI');
      // verify kargo and KBR logo
      cy.get('.icon-kargo-logo', { timeout: 8000 }).should('be.visible'); // KBR Logo
      cy.get('.company-logo').should('be.visible'); // Kargo logo
      cy.get('.icon-account').should('be.visible'); // Account icon
      cy.get('.search.QA-search').should('be.visible'); // Search field
      cy.get('.surveyType-dropdown:nth-child(2)').contains('Filter').should('be.visible');
      cy.get('.surveyStatus-dropdown:nth-child(3)').contains('Status').should('be.visible');
      cy.get('.surveyType-dropdown:nth-child(4)').contains('Type').should('be.visible');
      cy.get('.u-pointer:nth-child(5)').contains('Archived Only').should('be.visible'); // Archived Checkbox
      cy.get('.QA-new-survey').contains('New Survey').should('be.visible'); // New Survey Button
      cy.get('survey-card').first().should('be.visible'); // Created Survey Card
      cy.get('survey-card:nth-child(1) .actions .tooltip-toggle:nth-child(1)').contains('Push To KM').should('be.visible'); // Push to KM Button
      cy.get('survey-card:nth-child(1) .actions .tooltip-toggle:nth-child(3)').should('be.visible'); // Preview Button
      cy.get('survey-card:nth-child(1) .actions .tooltip-toggle:nth-child(4)').should('be.visible'); // Edit Button
      cy.get('survey-card:nth-child(1) .actions .tooltip-toggle:nth-child(5)').should('be.visible'); // Archive Button
      cy.get('.pagination-controls-wrapper').should('be.visible'); // pagination module
    });

    it('Verify Search without Filters functionality from Dashboard', () => {
      const searchTerm = 'CreatedByMeSurveyForAutomation'; // Survey Created by current user
      const secondSearchTerm = 'KBR-Survey-For-Automation'; // Survey CReated by another user
      cy.intercept('/api/surveys?limit*').as('surveyAPI');
      cy.intercept(`/api/surveys?search=${searchTerm}*`).as('searchFirstAPI');
      cy.intercept(`/api/surveys?search=${secondSearchTerm}*`).as('searchSecondAPI');

      cy.visit('');
      cy.url().should('include', 'kbr-builder.dev.kargo.com/');
      cy.wait('@surveyAPI');
      // default selected filter is mine so first survey should be returned
      cy.get('.search.QA-search input').should('be.visible').type(searchTerm); // Search field
      cy.wait('@searchFirstAPI');
      cy.get('survey-card').should('have.length', 1);
      cy.get('.QA-totalPages').should('contain', 'Showing 1 to 1 of 1 entries');
      // default selected filter is mine so second survey should NOT be returned
      cy.get('.search.QA-search input').should('be.visible').clear()
        .type(secondSearchTerm); // Search field
      cy.wait('@searchSecondAPI');
      cy.get('survey-card').should('have.length', 0);
      cy.get('.t-regular').should('contain', 'No Results').should('be.visible');
    });

    it('Verify Created by Filter functionality from Dashboard', () => {
      const searchTerm = 'CreatedByMeSurveyForAutomation'; // Survey Created by current user
      const secondSearchTerm = 'KBR-Survey-For-Automation'; // Survey CReated by another user
      cy.intercept('/api/surveys?limit*').as('surveyAPI');
      cy.intercept(`/api/surveys?search=${searchTerm}*`).as('searchFirstAPI');
      cy.intercept(`/api/surveys?search=${secondSearchTerm}*`).as('searchSecondAPI');

      cy.visit('');
      cy.url().should('include', 'kbr-builder.dev.kargo.com/');
      cy.wait('@surveyAPI');
      // default selected filter is mine so first survey should be returned
      cy.get('.search.QA-search input').should('be.visible').type(searchTerm); // Search field
      cy.wait('@searchFirstAPI');
      cy.get('.surveyType-dropdown:nth-child(2) .dropdown-toggle').should('contain', 'Mine'); // mine option is selected
      cy.get('survey-card').should('have.length', 1);
      cy.get('.QA-totalPages').should('contain', 'Showing 1 to 1 of 1 entries');
      cy.get('.surveyType-dropdown:nth-child(2) .dropdown-toggle').click();
      cy.get('li').contains('All').click(); // select created by All option
      // second survey should be returned
      cy.get('.search.QA-search input').should('be.visible').clear()
        .type(secondSearchTerm); // Search field
      cy.wait('@searchSecondAPI');
      cy.get('survey-card').should('have.length', 1);
      cy.get('.QA-totalPages').should('contain', 'Showing 1 to 1 of 1 entries');
      cy.get('.surveyType-dropdown:nth-child(2) .dropdown-toggle').click();
      cy.get('li').contains('Mine').click(); // select created by Mine option
      cy.get('survey-card').should('have.length', 0);
      cy.get('.t-regular').should('contain', 'No Results').should('be.visible'); // second survey should NOT be returned
    });

    it('Verify Status Filter functionality from Dashboard', () => {
      const searchTerm = 'CreatedByMeSurveyForAutomation'; // Searching for pending Survey
      cy.intercept('/api/surveys?limit*').as('surveyAPI');
      cy.intercept(`/api/surveys?search=${searchTerm}*`).as('searchAPI');

      cy.visit('');
      cy.url().should('include', 'kbr-builder.dev.kargo.com/');
      cy.wait('@surveyAPI');
      // default selected filter is mine so first survey should be returned
      cy.get('.search.QA-search input').should('be.visible').type(searchTerm); // Search field
      cy.wait('@searchAPI');
      cy.get('.surveyStatus-dropdown:nth-child(3) .dropdown-toggle').should('contain', 'All'); // All option is selected
      cy.get('survey-card').should('have.length', 1);
      cy.get('.QA-totalPages').should('contain', 'Showing 1 to 1 of 1 entries');
      cy.get('.surveyStatus-dropdown:nth-child(3) .dropdown-toggle').click();
      cy.get('li').contains('Active').click(); // select Active option
      cy.get('survey-card').should('have.length', 0);
      cy.get('.t-regular').should('contain', 'No Results').should('be.visible'); // survey should NOT be returned
      cy.get('.surveyStatus-dropdown:nth-child(3) .dropdown-toggle').click();
      cy.get('li').contains('Complete').click(); // select Complete option
      cy.get('survey-card').should('have.length', 0);
      cy.get('.t-regular').should('contain', 'No Results').should('be.visible'); // survey should NOT be returned
      cy.get('.surveyStatus-dropdown:nth-child(3) .dropdown-toggle').click();
      cy.get('li').contains('Pending').click(); // select Pending option
      cy.get('survey-card').should('have.length', 1);
      cy.get('.QA-totalPages').should('contain', 'Showing 1 to 1 of 1 entries');
    });

    it('Verify Type Filter functionality from Dashboard', () => {
      const searchTerm = 'CreatedByMeSurveyForAutomation'; // Searching for programmatic Survey
      const secondSearchTerm = 'KBR-Survey-For-Automation'; // Searching for direct Survey
      cy.intercept('/api/surveys?limit*').as('surveyAPI');
      cy.intercept(`/api/surveys?search=${searchTerm}*`).as('searchFirstAPI');
      cy.intercept(`/api/surveys?search=${secondSearchTerm}*`).as('searchSecondAPI');

      cy.visit('');
      cy.url().should('include', 'kbr-builder.dev.kargo.com/');
      cy.wait('@surveyAPI');
      cy.get('.search.QA-search input').should('be.visible').type(searchTerm); // Search field
      cy.wait('@searchFirstAPI');
      cy.get('.surveyType-dropdown:nth-child(4) .dropdown-toggle').should('contain', 'All'); // All option is selected
      cy.get('survey-card').should('have.length', 1);
      cy.get('.QA-totalPages').should('contain', 'Showing 1 to 1 of 1 entries');
      cy.get('.surveyType-dropdown:nth-child(4) .dropdown-toggle').click();
      cy.get('li').contains('Direct').click(); // select Direct option
      cy.get('survey-card').should('have.length', 0);
      cy.get('.t-regular').should('contain', 'No Results').should('be.visible'); // survey should NOT be returned
      cy.get('.surveyType-dropdown:nth-child(4) .dropdown-toggle').click();
      cy.get('li').contains('Programmatic').click(); // select programmatic option
      cy.get('survey-card').should('have.length', 1);
      cy.get('.QA-totalPages').should('contain', 'Showing 1 to 1 of 1 entries');
      cy.get('.search.QA-search input').should('be.visible').clear()
        .type(secondSearchTerm); // Search field
      cy.wait('@searchSecondAPI');
      cy.get('survey-card').should('have.length', 0);
      cy.get('.t-regular').should('contain', 'No Results').should('be.visible'); // second survey should  be returned
      cy.get('.surveyType-dropdown:nth-child(2) .dropdown-toggle').click();
      cy.get('li').contains('All').click(); // select created by All option
      cy.get('.surveyType-dropdown:nth-child(4) .dropdown-toggle').click();
      cy.get('li').contains('Direct').click(); // select direct option
      cy.get('survey-card').should('have.length', 1);
      cy.get('.QA-totalPages').should('contain', 'Showing 1 to 1 of 1 entries');
    });

    it('Verify Archived Only Checkbox functionality from Dashboard', () => {
      cy.intercept('/api/surveys?limit*').as('surveyAPI');

      cy.visit('');
      cy.url().should('include', 'kbr-builder.dev.kargo.com/');
      cy.wait('@surveyAPI');
      cy.get('.QA-totalPages').then(($elem) => { // getting total numbers of survey
        const totalNumberOfSurveys = ($elem.text().split('of')[1]).split('entries')[0].replaceAll(' ', '');
        cy.log(totalNumberOfSurveys);

        cy.get('.u-pointer:nth-child(5)').contains('Archived Only').click();
        cy.wait('@surveyAPI');
        cy.get('.QA-totalPages').then(($elem2) => { // getting only archived Surveys
          const archivedOnlySurveys = ($elem2.text().split('of')[1]).split('entries')[0].replaceAll(' ', '');
          cy.log(archivedOnlySurveys);
          // Archived Surveys should be less than all Surveys
          expect(+archivedOnlySurveys).to.be.lessThan(+totalNumberOfSurveys);
        });
      });
    });
  });
});
