import 'cypress-wait-until';

const dayjs = require('dayjs');

const { generateName } = require('../../helpers/name-helper');

context('Survey Test', () => {
  describe('Surveys-Programmatic UI', () => {
    before(() => {
      cy.loginOkta(Cypress.env('username'), Cypress.env('password'));
    });
    beforeEach(() => {
      cy.restoreLocalStorage(); // restore access token
    });
    afterEach(() => {
      cy.saveLocalStorage(); // save access token for the next test
    });

    const survey = {};

    it('Create new Programmatic Survey without push to KM', () => {
      survey.name = generateName('UI-Survey-Programmatic');
      survey.dealGroupSearchName = '-UI-DealGroup'; // search for deal group Created by Automation UI
      survey.firstQuestion = 'Do you recall seeing an ad for product / brand on your phone in the past month?';
      survey.firstQuestionCategory = 'Aided Ad Recall';
      survey.firstQuestionAnswers = ['Yes', 'No', 'Not Sure'];

      cy.intercept('/api/surveys?*').as('surveyAPI');
      cy.intercept('POST', '/api/surveys').as('surveyCreation');

      cy.visit('');
      cy.url().should('include', 'kbr-builder.dev.kargo.com/');
      cy.wait('@surveyAPI');
      cy.get('.button--newSurvey', { timeout: 8000 }).click(); // add new survey button
      cy.url().should('include', '/add-survey');
      // Survey Section
      cy.get('.formContainer:nth-child(1) h1').contains('Survey').should('be.visible'); // Survey Header
      cy.get('.formContainer:nth-child(1) h3').contains('Provide Survey Details').should('be.visible');
      cy.get('.formContainer:nth-child(1) div:nth-child(3) h8').contains('Survey Name').should('be.visible');
      cy.get('.QA-addEditUser--surveyName').type(survey.name);
      cy.get('.title--surveyType').contains('Survey Type').should('be.visible');
      cy.get('section:nth-child(1) div+div.u-flex:nth-child(2) .radio+p').should('contain', 'Programmatic').click();
      cy.get('section:nth-child(1) div+div.u-flex:nth-child(2) .radio-inside').should('be.visible'); // Programmatic type is checked
      cy.get('.formContainer:nth-child(1) div:nth-child(5) h8:nth-child(1)').contains('KBR Survey End Date').should('be.visible');
      cy.get('.formContainer:nth-child(1) div:nth-child(5) h8:nth-child(3)').contains('Deal Group').should('be.visible');
      cy.get('.formContainer:nth-child(1) div:nth-child(5) :nth-child(4) input').type(survey.dealGroupSearchName);
      cy.get('.dropdown-menu li').first().click();
      cy.get('.formContainer:nth-child(1) div:nth-child(5) :nth-child(4) input').then((value) => { // getting deal group name value from UI
        survey.dealGroupName = value.val();
        cy.log(survey.dealGroupName);
      });
      cy.get('div+section h8').click(); // select second background image

      // Questions Section
      cy.get('.formContainer:nth-child(2) h1').contains('Questions').should('be.visible'); // Survey Header
      cy.get('.formContainer:nth-child(2) div:nth-child(2) h8').contains('IMPORT QUESTIONS').should('be.visible');
      cy.get('.import--questions .switch').should('be.visible');
      cy.get('.import--questions p2').should('contain', 'Import questions from existing survey').should('be.visible');
      cy.get('.QA-addEditUser--selectQuestionTab.is-active').should('contain', '#1');
      cy.get('.questionContainer .title').should('contain', 'Question Type');
      cy.get('.questionContainer .dropdown').click();
      cy.get('li a').contains(survey.firstQuestionCategory).click();
      cy.get('.question-text input').should('contain.value', survey.firstQuestion).should('be.visible');
      cy.get('.questionContainer div:nth-child(3) > h8').should('contain', 'Answers').should('contain', '- Single Choice');
      cy.get('.questionSlat .answer:nth-child(2) input').should('have.value', survey.firstQuestionAnswers[0]);
      cy.get('.questionSlat .answer:nth-child(2) .QA-addEditSurvey--desiredAnswer').should('have.class', 'is-active');
      cy.get('.questionSlat .answer:nth-child(3) input').should('have.value', survey.firstQuestionAnswers[1]);
      cy.get('.questionSlat .answer:nth-child(3) .QA-addEditSurvey--desiredAnswer').should('not.have.class', 'is-active');
      cy.get('.questionSlat .answer:nth-child(4) input').should('have.value', survey.firstQuestionAnswers[2]);
      cy.get('.questionSlat .answer:nth-child(4) .QA-addEditSurvey--desiredAnswer').should('not.have.class', 'is-active');
      cy.get('.button--addAnswer').should('contain', '+ Add Another Answer').should('be.visible');
      cy.get('.preferredAnswer').contains('= Preferred Answer').find('.icon-success ');
      cy.get('.addQuestion').contains('+ Add Question').should('be.visible');
      cy.get('.title--answerType').should('contain', 'Presentation Order (Questions)');
      cy.get('.title--answerType+div .radio-wrapper:nth-child(1)').should('contain', 'Random (Recommended)');
      cy.get('.title--answerType+div .radio-wrapper:nth-child(1) .radio-inside').should('be.visible'); // checked by default
      cy.get('.title--answerType+div .radio-wrapper:nth-child(2)').should('contain', 'Freeze First Question');
      cy.get('.title--answerType+div .radio-wrapper:nth-child(3)').should('contain', 'Freeze All').click();
      cy.get('.title--answerType+div .radio-wrapper:nth-child(3) .radio-inside').should('be.visible');

      // Save Survey without push to KM
      cy.get('.QA-addEditUser--saveButton').click();
      cy.get('.popup-main').should('contain', 'Save KBR Survey').should('contain', 'Would you like to save this KBR Survey?').should('be.visible');
      cy.get('.popup-footer .button--primary').click().wait('@surveyCreation')
        .then(({ response }) => { // getting survey & Campaign id from response
          assert.equal(response.statusCode, 200, 'Response Status value ');
          // eslint-disable-next-line prefer-destructuring
          survey.id = response.body.id;
          survey.campaignId = 3045; // programmatic surveys created under the same static campaign
          survey.dealGroupId = response.body.deal_group_id;
          survey.campaignName = 'KBR programmatic survey.';
          cy.log(survey.id);
          cy.task('log', `AD ID is: ${survey.id}`);
          cy.get('.popup-main').should('contain', 'KBR Saved').should('contain', 'Your KBR has been saved.').should('be.visible');
          cy.get('.button--primary').contains('Return to Dashboard').click();
          cy.url().should('include', 'kbr-builder.dev.kargo.com/'); // make sure user is navigated to dashboard
        });
    });

    it('Verify the Created survey details', () => {
      survey.creationDate = dayjs().format('MMM D, YYYY'); // generating creation date for survey as Today date
      cy.log(survey.creationDate);

      cy.intercept('/api/surveys?*').as('surveyAPI');
      cy.intercept(`/api/surveys?search=${survey.name}*`).as('searchAPI');

      cy.visit('');
      cy.url().should('include', 'kbr-builder.dev.kargo.com/');
      cy.wait('@surveyAPI');
      cy.get('.search.QA-search input').should('be.visible').type(survey.name);
      cy.wait('@searchAPI');
      cy.get('.surveyType-dropdown:nth-child(2) .dropdown-toggle').should('contain', 'Mine'); // mine option is selected
      cy.get('survey-card').should('have.length', 1);
      cy.get('survey-card circle+p2').should('contain', 'Not Pushed to KM');
      cy.get('survey-card .actions .tooltip-toggle:nth-child(1) a').should('not.be.disabled');
      cy.get('survey-card .actions .tooltip-toggle:nth-child(4) a').should('not.be.disabled');
      cy.get('survey-card .title').should('contain', survey.name).click();
      cy.url().should('include', `survey-detail/${survey.id}`);
      // verify Survey details
      cy.get('header h2', { timeout: 8000 }).should('contain', survey.name);
      cy.get('.pushed', { timeout: 8000 }).should('contain', 'Not Pushed to KM');
      cy.get('.actions-column .QA-surveyDetails--pushSurvey').should('contain', 'Push to KM').and('be.visible');
      cy.get('.actions-column .QA-surveyDetails--editSurvey').should('contain', 'Edit').and('be.visible');
      cy.get('.actions-column .QA-surveyDetails--previewSurvey').should('contain', 'Preview').and('be.visible');
      cy.get('.actions-column .QA-surveyDetails--deleteSurvey').should('contain', 'Archive').and('be.visible');
      cy.get('.sidebar div:nth-child(1) .key').should('contain', 'Deal Group Name').and('be.visible');
      cy.get('.sidebar div:nth-child(1) p2').should('contain', survey.dealGroupName).and('be.visible');
      cy.get('.sidebar div:nth-child(2) .key').should('contain', 'Deal Group ID').and('be.visible');
      cy.get('.sidebar div:nth-child(2) p2').should('contain', survey.dealGroupId).and('be.visible');
      cy.get('.sidebar div:nth-child(3) .key').should('not.be.visible');
      cy.get('.sidebar div:nth-child(4) .key').should('contain', 'End Date').and('be.visible');
      cy.get('.sidebar div:nth-child(5) .key').should('contain', 'Creation Date').and('be.visible');
      cy.get('.sidebar div:nth-child(5) p2').should('contain', survey.creationDate.split(',')[0])
        .and('contain', survey.creationDate.split(',')[1])
        .and('be.visible');
      cy.get('.sidebar div:nth-child(6) .key').should('contain', 'Created By').and('be.visible');
      cy.get('.sidebar div:nth-child(6) p2').should('contain', Cypress.env('username')).and('be.visible');
      cy.get('.sidebar div:nth-child(7) .key').should('contain', 'Last Edited').and('be.visible');
      cy.get('.impressions.wrapper').should('contain', 'Impressions').and('be.visible');
      cy.get('.response.wrapper').should('contain', 'Response Rate').and('be.visible');
      cy.get('.questions .is-active').should('contain', survey.firstQuestionCategory).and('be.visible');
      cy.get('.question-content p').should('contain', survey.firstQuestion).and('be.visible');
      cy.get('ul li:nth-child(1)').should('contain', survey.firstQuestionAnswers[0]).and('be.visible');
      cy.get('ul li:nth-child(1) .preferredAnswer').should('contain', 'Preferred Answer').and('be.visible');
      cy.get('ul li:nth-child(2)').should('contain', survey.firstQuestionAnswers[1]).and('be.visible');
      cy.get('ul li:nth-child(2) .preferredAnswer').should('not.exist');
      cy.get('ul li:nth-child(3)').should('contain', survey.firstQuestionAnswers[2]).and('be.visible');
      cy.get('ul li:nth-child(3) .preferredAnswer').should('not.exist');
      cy.get('.QA-surveyDetails--viewInKM').should('be.disabled');
      cy.get('.QA-surveyDetails--viewInLooker').should('be.disabled');
    });

    it('Edit the Created survey from details page & Push it', () => {
      cy.intercept('/api/surveys?*').as('surveyAPI');
      cy.intercept(`/api/surveys?search=${survey.name}*`).as('searchAPI');
      cy.intercept('PUT', `/api/surveys/${survey.id}/save-and-push`).as('surveyPush');

      cy.get('.actions-column .QA-surveyDetails--editSurvey').click();
      cy.url().should('include', `edit-survey/${survey.id}`);

      // assign the updated values here to not affect search before edit
      survey.name += '-Updated';
      // survey.verticalDetail = 'Food & Bev';
      survey.firstQuestionAnswers[1] += '-Updated';

      cy.get('.QA-addEditUser--surveyName', { timeout: 8000 }).clear().type(survey.name);
      cy.get('div+section h8').contains('Background Image').should('be.visible');
      cy.get('.questionSlat .answer:nth-child(3) .QA-addEditSurvey--desiredAnswer').should('not.have.class', 'is-active').click(); // click on desired for second Answer check
      cy.get('.questionSlat .answer:nth-child(3) input').clear().type(survey.firstQuestionAnswers[1]); // update second answer text
      cy.get('.title--answerType+div .radio-wrapper:nth-child(2)').click();
      cy.get('.title--answerType+div .radio-wrapper:nth-child(2) .radio-inside').should('be.visible');
      // Save and Push the created Survey to KM
      cy.get('.QA-addEditUser--savePushButton').click();
      cy.get('.popup-main').should('contain', 'Push KBR Survey to KM').should('contain', 'Are you sure you want to push this KBR Survey?').should('be.visible');
      cy.get('.popup-footer .button--primary').click().wait('@surveyPush')
        .then(({ response }) => { // make sure Survey is Pushed successfully to KM
          assert.equal(response.statusCode, 200, 'Response Status value ');
          assert.include(response.body.message, `Survey ${survey.id} was updated, published and pushed to KM.`, 'Response success Message ');

          cy.get('.popup-main').should('contain', 'KBR Saved').should('contain', 'Your KBR has been saved.').should('be.visible');
          cy.get('.button--primary').contains('Return to Dashboard').click();
          cy.url().should('include', 'kbr-builder.dev.kargo.com/'); // make sure user is navigated to dashboard
        });
    });

    it('Verify the Edited survey details', () => {
      cy.intercept('/api/surveys?*').as('surveyAPI');
      cy.intercept(`/api/surveys?search=${survey.name}*`).as('searchAPI');

      cy.visit('');
      cy.url().should('include', 'kbr-builder.dev.kargo.com/');
      cy.wait('@surveyAPI');
      cy.get('.search.QA-search input').should('be.visible').type(survey.name);
      cy.wait('@searchAPI');
      cy.get('.surveyType-dropdown:nth-child(2) .dropdown-toggle').should('contain', 'Mine'); // mine option is selected
      cy.get('survey-card').should('have.length', 1);
      cy.get('survey-card circle+p2').should('contain', 'Pushed to KM');
      cy.get('survey-card .actions .tooltip-toggle:nth-child(1) a').should('have.class', 'is-disabled');
      cy.get('survey-card .actions .tooltip-toggle:nth-child(4) a').should('have.class', 'is-disabled');
      cy.get('survey-card .title').should('contain', survey.name).click();
      cy.url().should('include', `survey-detail/${survey.id}`);
      // verify Survey details
      cy.get('header h2').should('contain', survey.name);
      cy.get('.pushed').should('contain', 'Pushed to KM');
      cy.get('.actions-column .QA-surveyDetails--pushSurvey').should('contain', 'Push to KM').and('be.visible');
      cy.get('.actions-column .QA-surveyDetails--editSurvey').should('contain', 'Edit').and('be.visible');
      cy.get('.actions-column .QA-surveyDetails--previewSurvey').should('contain', 'Preview').and('be.visible');
      cy.get('.actions-column .QA-surveyDetails--deleteSurvey').should('contain', 'Archive').and('be.visible');
      cy.get('.sidebar div:nth-child(1) .key').should('contain', 'Deal Group Name').and('be.visible');
      cy.get('.sidebar div:nth-child(1) p2').should('contain', survey.dealGroupName).and('be.visible');
      cy.get('.sidebar div:nth-child(2) .key').should('contain', 'Deal Group ID').and('be.visible');
      cy.get('.sidebar div:nth-child(2) p2').should('contain', survey.dealGroupId).and('be.visible');
      cy.get('.sidebar div:nth-child(3) .key').should('contain', 'CMA Segment').and('be.visible');
      cy.get('.sidebar div:nth-child(4) .key').should('contain', 'End Date').and('be.visible');

      cy.get('.sidebar div:nth-child(5) .key').should('contain', 'Creation Date').and('be.visible');
      cy.get('.sidebar div:nth-child(5) p2').should('contain', survey.creationDate.split(',')[0])
        .and('contain', survey.creationDate.split(',')[1])
        .and('be.visible');
      cy.get('.sidebar div:nth-child(6) .key').should('contain', 'Created By').and('be.visible');
      cy.get('.sidebar div:nth-child(6) p2').should('contain', Cypress.env('username')).and('be.visible');
      cy.get('.sidebar div:nth-child(7) .key').should('contain', 'Last Edited').and('be.visible');
      cy.get('.impressions.wrapper').should('contain', 'Impressions').and('be.visible');
      cy.get('.response.wrapper').should('contain', 'Response Rate').and('be.visible');
      cy.get('.questions .is-active').should('contain', survey.firstQuestionCategory).and('be.visible');
      cy.get('.question-content p').should('contain', survey.firstQuestion).and('be.visible');
      cy.get('ul li:nth-child(1)').should('contain', survey.firstQuestionAnswers[0]).and('be.visible');
      cy.get('ul li:nth-child(1) .preferredAnswer').should('contain', 'Preferred Answer').and('be.visible');
      cy.get('ul li:nth-child(2)').should('contain', survey.firstQuestionAnswers[1]).and('be.visible');
      cy.get('ul li:nth-child(2) .preferredAnswer').should('contain', 'Preferred Answer').and('be.visible');
      cy.get('ul li:nth-child(3)').should('contain', survey.firstQuestionAnswers[2]).and('be.visible');
      cy.get('ul li:nth-child(3) .preferredAnswer').should('not.exist');
      cy.get('.QA-surveyDetails--viewInKM').should('be.visible');
      cy.get('.QA-surveyDetails--viewInLooker').should('be.disabled');
    });

    it('Verify Preview functionality for Survey ', () => {
      survey.previewLink = `https://preview.dev.kargo.com/survey/${survey.id}`;
      cy.intercept('/api/surveys?*').as('surveyAPI');
      cy.intercept(`/api/surveys?search=${survey.name}*`).as('searchAPI');

      cy.visit('');
      cy.url().should('include', 'kbr-builder.dev.kargo.com/');
      cy.wait('@surveyAPI');
      cy.get('.search.QA-search input').should('be.visible').type(survey.name);
      cy.wait('@searchAPI');
      cy.get('.surveyType-dropdown:nth-child(2) .dropdown-toggle').should('contain', 'Mine'); // mine option is selected
      cy.get('survey-card').should('have.length', 1);
      cy.get('survey-card .title').should('contain', survey.name);
      cy.get('survey-card .tooltip-toggle:nth-child(3) a').should(($a) => {
        expect($a.attr('href'), 'href').to.equal(survey.previewLink);
        expect($a.attr('target'), 'target').to.equal('_blank');
        $a.attr('target', '_self');
      }).click(); // navigate to Preview to verify survey
      cy.location('href').should('equal', survey.previewLink);
    });
  });
});
