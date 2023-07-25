import 'cypress-wait-until';

const dayjs = require('dayjs');

const { generateName } = require('../../helpers/name-helper');
const { requestOptions } = require('../../helpers/request-helper');


context('Survey Test', () => {
  describe('Surveys-Direct UI', () => {
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

    it('Create new Direct Survey without push to KM', () => {
      survey.name = generateName('UI-Survey-Direct');
      // Searching for campaign created last month to make sure there are data created by cypress
      survey.campaignSearchName = dayjs().subtract('1', 'month').format('YY.MM');
      survey.firstQuestion = 'Which of the following products / brand verticals are you considering in the near future?';
      survey.firstQuestionCategory = 'Consideration';
      survey.firstQuestionAnswers = ['20th Century', '20th Century Fox', '7Eleven', 'None of the above'];
      survey.secondQuestion = 'What is your overall opinion about product / brand?';
      survey.secondQuestionCategory = 'Attribute Rating';
      survey.secondQuestionAnswers = ['Very Favorable', 'Somewhat Favorable', 'Neutral', 'Somewhat Unfavorable', 'Very Unfavorable', 'Test Automation'];

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
      cy.get('section:nth-child(1) div.u-flex:nth-child(1) .radio-title').should('contain', 'Direct');
      cy.get('section:nth-child(1) div.u-flex:nth-child(1) .radio-inside').should('be.visible'); // Direct type is checked
      cy.get('.formContainer:nth-child(1) div:nth-child(5) h8').contains('Campaign').should('be.visible');
      cy.get('targeting h2').should('have.text', 'No Line Item Targeting').should('be.visible');
      cy.get('.QA-addEditUser--campaignTypeahead').type(survey.campaignSearchName);
      cy.get('.dropdown-menu li').contains('Cypress').first().click(); // Select Campaign Created by automation
      cy.get('.QA-addEditUser--campaignTypeahead').then((value) => { // getting campaign name value from UI
        survey.campaignName = value.text();
        cy.log(survey.campaignName);
      });
      cy.get('.formContainer:nth-child(1) targeting h8').contains('Targeting').should('be.visible');
      cy.get('.formContainer:nth-child(1) targeting .tooltip-toggle.info').click();
      cy.get('.formContainer:nth-child(1) targeting p').should('contain', 'KBR line items need the same targeting as the campaign. Select a line item to copy targeting from.');
      cy.get('li.targeting-list-item:nth-child(1)').should('have.class', 'is-active');
      cy.get('li.targeting-list-item:nth-child(1) .target-name span').should('have.attr', 'data-content-start').and('match', /[campaign]/);
      cy.get('targeting+section h8').contains('Background Image').should('be.visible');

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
      cy.get('.formContainer:nth-child(2) div:nth-child(3) h8').should('contain', 'Answers').should('contain', '- Multiple Choice');
      cy.get('.formContainer:nth-child(2) div:nth-child(3) .switch').should('be.visible');
      cy.get('.formContainer:nth-child(2) div:nth-child(3) p2').should('contain', 'Use text').should('be.visible');
      cy.get('.formContainer:nth-child(2) div:nth-child(3) .tooltip-toggle').should('be.visible');
      cy.get('.formContainer:nth-child(2) div:nth-child(3) .tooltip-toggle p').should('contain', 'If logos are enabled, a logo is required for all answer choices. If a logo is unavailable, please change to text.');
      cy.get('.questionSlat .answer:nth-child(3) input').click();
      cy.get('.questionSlat .answer:nth-child(3) a').contains(survey.firstQuestionAnswers[0]).click();
      cy.get('.questionSlat .answer:nth-child(3) .QA-addEditSurvey--desiredAnswer').should('have.class', 'is-active');
      cy.get('.questionSlat .answer:nth-child(4) input').click();
      cy.get('.questionSlat .answer:nth-child(4) a').contains(survey.firstQuestionAnswers[1]).click();
      cy.get('.questionSlat .answer:nth-child(4) .QA-addEditSurvey--desiredAnswer').should('not.have.class', 'is-active');
      cy.get('.questionSlat .answer:nth-child(4) .QA-addEditSurvey--desiredAnswer').click();
      cy.get('.questionSlat .answer:nth-child(4) .QA-addEditSurvey--desiredAnswer').should('have.class', 'is-active');
      cy.get('.questionSlat .answer:nth-child(5) input').click();
      cy.get('.questionSlat .answer:nth-child(5) a').contains(survey.firstQuestionAnswers[2]).click();
      cy.get('.questionSlat .answer:nth-child(5) .QA-addEditSurvey--desiredAnswer').should('not.have.class', 'is-active');
      cy.get('.questionSlat .answer:nth-child(6) .icon-close.icon--gray-7').click(); // remove answer option
      cy.get('.questionSlat .answer:nth-child(6) input').should('have.value', survey.firstQuestionAnswers[3]); // none of the above selected by default
      cy.get('.questionSlat .answer:nth-child(6) .QA-addEditSurvey--desiredAnswer').should('not.have.class', 'is-active');
      cy.get('.button--addAnswer').should('contain', '+ Add Another Answer').should('be.visible');
      cy.get('.preferredAnswer').contains('= Preferred Answer').find('.icon-success ');
      cy.get('.addQuestion').contains('+ Add Question').click();
      cy.get('.QA-addEditUser--selectQuestionTab.is-active').should('contain', '#2');
      cy.get('.QA-addEditUser--removeQuestion').contains('Delete').should('be.visible');
      cy.get('.questionContainer .title').should('contain', 'Question Type');
      cy.get('.questionContainer .dropdown').click();
      cy.get('li a').contains('Attribute Rating').click();
      cy.get('.question-text input').should('contain.value', survey.secondQuestion).should('be.visible');
      cy.get('.formContainer:nth-child(2) div:nth-child(3) h8').should('contain', 'Answers').should('contain', '- Single Choice');
      cy.get('.questionSlat .answer:nth-child(2) input').should('have.value', survey.secondQuestionAnswers[0]);
      cy.get('.questionSlat .answer:nth-child(2) .QA-addEditSurvey--desiredAnswer').should('have.class', 'is-active');
      cy.get('.questionSlat .answer:nth-child(3) input').should('have.value', survey.secondQuestionAnswers[1]);
      cy.get('.questionSlat .answer:nth-child(3) .QA-addEditSurvey--desiredAnswer').should('have.class', 'is-active');
      cy.get('.questionSlat .answer:nth-child(4) input').should('have.value', survey.secondQuestionAnswers[2]);
      cy.get('.questionSlat .answer:nth-child(4) .QA-addEditSurvey--desiredAnswer').should('not.have.class', 'is-active');
      cy.get('.questionSlat .answer:nth-child(5) input').should('have.value', survey.secondQuestionAnswers[3]);
      cy.get('.questionSlat .answer:nth-child(5) .QA-addEditSurvey--desiredAnswer').should('not.have.class', 'is-active');
      cy.get('.questionSlat .answer:nth-child(6) input').should('have.value', survey.secondQuestionAnswers[4]);
      cy.get('.questionSlat .answer:nth-child(6) .QA-addEditSurvey--desiredAnswer').should('not.have.class', 'is-active');
      cy.get('.button--addAnswer').click();
      cy.get('.questionSlat .answer:nth-child(7) input').type(survey.secondQuestionAnswers[5]);
      cy.get('.questionSlat .answer:nth-child(7) .QA-addEditSurvey--desiredAnswer').should('not.have.class', 'is-active');
      cy.get('.preferredAnswer').contains('= Preferred Answer').find('.icon-success ');
      cy.get('.title--answerType').should('contain', 'Presentation Order (Questions)');
      cy.get('.title--answerType+div .radio-wrapper:nth-child(1)').should('contain', 'Random (Recommended)');
      cy.get('.title--answerType+div .radio-wrapper:nth-child(1) .radio-inside').should('be.visible'); // checked by default
      cy.get('.title--answerType+div .radio-wrapper:nth-child(2)').should('contain', 'Freeze First Question');
      cy.get('.title--answerType+div .radio-wrapper:nth-child(3)').should('contain', 'Freeze All');

      // Save Survey without push to KM
      cy.get('.QA-addEditUser--saveButton').click();
      cy.get('.popup-main').should('contain', 'Save KBR Survey').should('contain', 'Would you like to save this KBR Survey?').should('be.visible');
      cy.get('.popup-footer .button--primary').click().wait('@surveyCreation')
        .then(({ response }) => { // getting survey & Campaign id from response
          assert.equal(response.statusCode, 200, 'Response Status value ');
          // eslint-disable-next-line prefer-destructuring
          survey.id = response.body.id;
          survey.campaignId = response.body.campaign_id;
          cy.log(survey.id);
          cy.task('log', `AD ID is: ${survey.id}`);
          cy.get('.popup-main').should('contain', 'KBR Saved').should('contain', 'Your KBR has been saved.').should('be.visible');
          cy.get('.button--primary').contains('Return to Dashboard').click();
          cy.url().should('include', 'kbr-builder.dev.kargo.com/'); // make sure user is navigated to dashboard
        });
    });

    it('Verify Survey Created under the selected Campaign in KM Site', () => {
      // will verfiy KM Side using API
      const kmSurveyOptions = requestOptions({
        url: `${Cypress.env('km')}/kbr-surveys?campaign_id=${survey.campaignId}&km_source=campaign`,
        auth: {
          bearer: Cypress.env('kmAuthToken'),
        },
      });

      cy.request(kmSurveyOptions).then((kmSurveyResponse) => {
        // getting last index of an array to check last created survey under selected Campaign
        const lastIndex = kmSurveyResponse.body.rows.length - 1;
        assert.equal(kmSurveyResponse.status, 200, 'Successful response status value ');
        assert.equal(kmSurveyResponse.body.rows[lastIndex].background_image, 0, 'Background image index ');
        assert.equal(kmSurveyResponse.body.rows[lastIndex].campaign_id, survey.campaignId, 'Survey Campaign id ');
        assert.equal(kmSurveyResponse.body.rows[lastIndex].id, survey.id, 'Survey id ');
        assert.equal(kmSurveyResponse.body.rows[lastIndex].name, survey.name, 'Survey name ');
        assert.equal(kmSurveyResponse.body.rows[lastIndex].questions[0].answers[0].text, survey.firstQuestionAnswers[0], 'Survey first Question Answers ');
        assert.equal(kmSurveyResponse.body.rows[lastIndex].questions[0].answers[1].text, survey.firstQuestionAnswers[1], 'Survey first Question Answers ');
        assert.equal(kmSurveyResponse.body.rows[lastIndex].questions[0].answers[2].text, survey.firstQuestionAnswers[2], 'Survey first Question Answers ');
        assert.equal(kmSurveyResponse.body.rows[lastIndex].questions[0].answers[3].text, survey.firstQuestionAnswers[3], 'Survey first Question Answers ');
        assert.equal(kmSurveyResponse.body.rows[lastIndex].questions[0].category, survey.firstQuestionCategory, 'Survey first Question category ');
        assert.equal(kmSurveyResponse.body.rows[lastIndex].questions[0].multi_answer, true, 'Survey first Question multi answer ');
        assert.equal(kmSurveyResponse.body.rows[lastIndex].questions[0].survey_id, survey.id, 'Survey first Question survey_id ');
        assert.equal(kmSurveyResponse.body.rows[lastIndex].questions[0].text, survey.firstQuestion, 'Survey first Question text ');
        assert.equal(kmSurveyResponse.body.rows[lastIndex].questions[1].answers[0].text, survey.secondQuestionAnswers[0], 'Survey second Question Answers ');
        assert.equal(kmSurveyResponse.body.rows[lastIndex].questions[1].answers[1].text, survey.secondQuestionAnswers[1], 'Survey second Question Answers ');
        assert.equal(kmSurveyResponse.body.rows[lastIndex].questions[1].answers[2].text, survey.secondQuestionAnswers[2], 'Survey second Question Answers ');
        assert.equal(kmSurveyResponse.body.rows[lastIndex].questions[1].answers[3].text, survey.secondQuestionAnswers[3], 'Survey second Question Answers ');
        assert.equal(kmSurveyResponse.body.rows[lastIndex].questions[1].answers[4].text, survey.secondQuestionAnswers[4], 'Survey second Question Answers ');
        assert.equal(kmSurveyResponse.body.rows[lastIndex].questions[1].answers[5].text, survey.secondQuestionAnswers[5], 'Survey second Question Answers ');
        assert.equal(kmSurveyResponse.body.rows[lastIndex].questions[1].category, survey.secondQuestionCategory, 'Survey second Question category ');
        assert.equal(kmSurveyResponse.body.rows[lastIndex].questions[1].multi_answer, false, 'Survey second Question single choice ');
        assert.equal(kmSurveyResponse.body.rows[lastIndex].questions[1].survey_id, survey.id, 'Survey second Question survey_id ');
        assert.equal(kmSurveyResponse.body.rows[lastIndex].questions[1].text, survey.secondQuestion, 'Survey second Question text ');
        assert.equal(kmSurveyResponse.body.rows[lastIndex].targeting_source.entity, 'Campaign', 'Survey targeting source ');
        assert.equal(kmSurveyResponse.body.rows[lastIndex].targeting_source.id, survey.campaignId, 'Survey targeting source ');
        assert.isNull(kmSurveyResponse.body.rows[lastIndex].published_at, 'Published at should be null '); // Survey is not pushed to KM
      });
    });

    it('Verify the Created survey details', () => {
      // getting flight dates for campaign to use them to verify flight dates for Survey
      const kmCampaignOptions = requestOptions({
        url: `${Cypress.env('km')}/campaigns/${survey.campaignId}?metrics=true&with=mediaPlan,placements`,
        auth: {
          bearer: Cypress.env('kmAuthToken'),
        },
      });

      cy.request(kmCampaignOptions).then((kmCampaignResponse) => {
        assert.equal(kmCampaignResponse.status, 200, 'Successful response status value ');

        survey.flightStartDate = dayjs(kmCampaignResponse.body.flight_date_start).format('MMM D, YYYY');
        survey.flightEndDate = dayjs(kmCampaignResponse.body.flight_date_end).format('MMM D, YYYY');

        cy.log(survey.flightStartDate);
        cy.log(survey.flightEndDate);


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
        cy.get('header h2').should('contain', survey.name);
        cy.get('.pushed').should('contain', 'Not Pushed to KM');
        cy.get('.actions-column .QA-surveyDetails--pushSurvey').should('contain', 'Push to KM').and('be.visible');
        cy.get('.actions-column .QA-surveyDetails--editSurvey').should('contain', 'Edit').and('be.visible');
        cy.get('.actions-column .QA-surveyDetails--previewSurvey').should('contain', 'Preview').and('be.visible');
        cy.get('.actions-column .QA-surveyDetails--deleteSurvey').should('contain', 'Archive').and('be.visible');
        cy.get('.sidebar div:nth-child(1) .key').should('contain', 'Campaign Name').and('be.visible');
        cy.get('.sidebar div:nth-child(1) p2').should('contain', survey.campaignName).and('be.visible');
        cy.get('.sidebar div:nth-child(2) .key').should('contain', 'Campaign ID').and('be.visible');
        cy.get('.sidebar div:nth-child(2) p2').should('contain', survey.campaignId).and('be.visible');
        cy.get('.sidebar div:nth-child(3) .key').should('not.be.visible');
        cy.get('.sidebar div:nth-child(4) .key').should('contain', 'Flight Dates').and('be.visible');
        cy.get('.sidebar div:nth-child(4) p2').should('contain', survey.flightStartDate.split(',')[0])
          .should('contain', survey.flightStartDate.split(',')[1])
          .and('be.visible');
        cy.get('.sidebar div:nth-child(4) p2').should('contain', survey.flightEndDate.split(',')[0])
          .should('contain', survey.flightEndDate.split(',')[1])
          .and('be.visible');
        cy.get('.sidebar div:nth-child(5) .key').should('contain', 'Targeting').and('be.visible');
        cy.get('.sidebar div:nth-child(5) p2').should('contain', `[campaign] ${survey.campaignName}`).and('be.visible');
        cy.get('.sidebar div:nth-child(6) .key').should('contain', 'Creation Date').and('be.visible');
        cy.get('.sidebar div:nth-child(6) p2').should('contain', survey.creationDate.split(',')[0])
          .and('contain', survey.creationDate.split(',')[1])
          .and('be.visible');
        cy.get('.sidebar div:nth-child(7) .key').should('contain', 'Created By').and('be.visible');
        cy.get('.sidebar div:nth-child(7) p2').should('contain', Cypress.env('username')).and('be.visible');
        cy.get('.sidebar div:nth-child(8) .key').should('contain', 'Last Edited').and('be.visible');
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
        cy.get('ul li:nth-child(4)').should('contain', survey.firstQuestionAnswers[3]).and('be.visible');
        cy.get('ul li:nth-child(4) .preferredAnswer').should('not.exist');
        cy.get('div.tab:nth-child(2)').click();
        cy.get('.questions .is-active').should('contain', survey.secondQuestionCategory).and('be.visible');
        cy.get('.question-content p').should('contain', survey.secondQuestion).and('be.visible');
        cy.get('ul li:nth-child(1)').should('contain', survey.secondQuestionAnswers[0]).and('be.visible');
        cy.get('ul li:nth-child(1) .preferredAnswer').should('contain', 'Preferred Answer').and('be.visible');
        cy.get('ul li:nth-child(2)').should('contain', survey.secondQuestionAnswers[1]).and('be.visible');
        cy.get('ul li:nth-child(2) .preferredAnswer').should('contain', 'Preferred Answer').and('be.visible');
        cy.get('ul li:nth-child(3)').should('contain', survey.secondQuestionAnswers[2]).and('be.visible');
        cy.get('ul li:nth-child(3) .preferredAnswer').should('not.exist');
        cy.get('ul li:nth-child(4)').should('contain', survey.secondQuestionAnswers[3]).and('be.visible');
        cy.get('ul li:nth-child(4) .preferredAnswer').should('not.exist');
        cy.get('ul li:nth-child(5)').should('contain', survey.secondQuestionAnswers[4]).and('be.visible');
        cy.get('ul li:nth-child(5) .preferredAnswer').should('not.exist');
        cy.get('ul li:nth-child(6)').should('contain', survey.secondQuestionAnswers[5]).and('be.visible');
        cy.get('ul li:nth-child(6) .preferredAnswer').should('not.exist');
        cy.get('.QA-surveyDetails--viewInKM').should('be.disabled');
        cy.get('.QA-surveyDetails--viewInLooker').should('be.disabled');
      });
    });

    it('Edit(from dashboard) & Push the Created survey ', () => {
      cy.intercept('/api/surveys?*').as('surveyAPI');
      cy.intercept(`/api/surveys?search=${survey.name}*`).as('searchAPI');
      cy.intercept('PUT', `/api/surveys/${survey.id}/save-and-push`).as('surveyPush');

      cy.visit('');
      cy.url().should('include', 'kbr-builder.dev.kargo.com/');
      cy.wait('@surveyAPI');
      cy.get('.search.QA-search input').should('be.visible').type(survey.name);
      cy.wait('@searchAPI');
      cy.get('.surveyType-dropdown:nth-child(2) .dropdown-toggle').should('contain', 'Mine'); // mine option is selected
      cy.get('survey-card').should('have.length', 1);
      cy.get('survey-card .title').should('contain', survey.name);
      cy.get('.icon-edit').click();
      cy.url().should('include', `edit-survey/${survey.id}`);

      // assign the updated values here to not affect search before edit
      survey.name += '-Updated';

      cy.get('.QA-addEditUser--surveyName', { timeout: 8000 }).clear().type(survey.name);
      cy.get('targeting+section h8').contains('Background Image').should('be.visible');
      cy.get('.questionSlat .answer:nth-child(3) .QA-addEditSurvey--desiredAnswer').should('have.class', 'is-active').click(); // remove desired Answer check
      cy.get('.QA-addEditUser--removeQuestion').contains('Delete').should('be.visible');
      cy.get('.formContainer:nth-child(2) div:nth-child(3) .switch').click(); // clicking on use text toggle
      cy.get('.questionSlat .answer:nth-child(3) input').clear().type(survey.firstQuestionAnswers[0]); // update first answer text
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

    it('Verify Survey Updated & Pushed under the selected Campaign in KM Site', () => {
      survey.pushedDate = dayjs().format('YYYY-MM-DD'); // Survey is pushed today

      // will verfiy KM Side using API
      const kmSurveyOptions = requestOptions({
        url: `${Cypress.env('km')}/kbr-surveys?campaign_id=${survey.campaignId}&km_source=campaign`,
        auth: {
          bearer: Cypress.env('kmAuthToken'),
        },
      });

      cy.request(kmSurveyOptions).then((kmSurveyResponse) => {
        // getting last index of an array to check last created survey under selected Campaign
        const lastIndex = kmSurveyResponse.body.rows.length - 1;
        assert.equal(kmSurveyResponse.status, 200, 'Successful response status value ');
        assert.equal(kmSurveyResponse.body.rows[lastIndex].campaign_id, survey.campaignId, 'Survey Campaign id ');
        assert.equal(kmSurveyResponse.body.rows[lastIndex].id, survey.id, 'Survey id ');
        assert.equal(kmSurveyResponse.body.rows[lastIndex].name, survey.name, 'Survey name ');
        assert.equal(kmSurveyResponse.body.rows[lastIndex].questions[0].answers[0].text, survey.firstQuestionAnswers[0], 'Survey first Question Answers ');
        assert.equal(kmSurveyResponse.body.rows[lastIndex].questions[0].answers[1].text, survey.firstQuestionAnswers[1], 'Survey first Question Answers ');
        assert.equal(kmSurveyResponse.body.rows[lastIndex].questions[0].answers[2].text, survey.firstQuestionAnswers[2], 'Survey first Question Answers ');
        assert.equal(kmSurveyResponse.body.rows[lastIndex].questions[0].answers[3].text, survey.firstQuestionAnswers[3], 'Survey first Question Answers ');
        assert.equal(kmSurveyResponse.body.rows[lastIndex].questions[0].category, survey.firstQuestionCategory, 'Survey first Question category ');
        assert.equal(kmSurveyResponse.body.rows[lastIndex].questions[0].multi_answer, true, 'Survey first Question multi answer ');
        assert.equal(kmSurveyResponse.body.rows[lastIndex].questions[0].survey_id, survey.id, 'Survey first Question survey_id ');
        assert.equal(kmSurveyResponse.body.rows[lastIndex].questions[0].text, survey.firstQuestion, 'Survey first Question text ');
        assert.equal(kmSurveyResponse.body.rows[lastIndex].questions[1].answers[0].text, survey.secondQuestionAnswers[0], 'Survey second Question Answers ');
        assert.equal(kmSurveyResponse.body.rows[lastIndex].questions[1].answers[1].text, survey.secondQuestionAnswers[1], 'Survey second Question Answers ');
        assert.equal(kmSurveyResponse.body.rows[lastIndex].questions[1].answers[2].text, survey.secondQuestionAnswers[2], 'Survey second Question Answers ');
        assert.equal(kmSurveyResponse.body.rows[lastIndex].questions[1].answers[3].text, survey.secondQuestionAnswers[3], 'Survey second Question Answers ');
        assert.equal(kmSurveyResponse.body.rows[lastIndex].questions[1].answers[4].text, survey.secondQuestionAnswers[4], 'Survey second Question Answers ');
        assert.equal(kmSurveyResponse.body.rows[lastIndex].questions[1].answers[5].text, survey.secondQuestionAnswers[5], 'Survey second Question Answers ');
        assert.equal(kmSurveyResponse.body.rows[lastIndex].questions[1].category, survey.secondQuestionCategory, 'Survey second Question category ');
        assert.equal(kmSurveyResponse.body.rows[lastIndex].questions[1].multi_answer, false, 'Survey second Question single choice ');
        assert.equal(kmSurveyResponse.body.rows[lastIndex].questions[1].survey_id, survey.id, 'Survey second Question survey_id ');
        assert.equal(kmSurveyResponse.body.rows[lastIndex].questions[1].text, survey.secondQuestion, 'Survey second Question text ');
        assert.equal(kmSurveyResponse.body.rows[lastIndex].targeting_source.entity, 'Campaign', 'Survey targeting source ');
        assert.equal(kmSurveyResponse.body.rows[lastIndex].targeting_source.id, survey.campaignId, 'Survey targeting source ');
        assert.include(kmSurveyResponse.body.rows[lastIndex].published_at, survey.pushedDate, 'Published at Today '); // Survey is pushed to KM
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
      cy.get('.actions-column .QA-surveyDetails--pushSurvey').should('contain', 'Push to KM').and('have.class', 'is-disabled');
      cy.get('.actions-column .QA-surveyDetails--editSurvey').should('contain', 'Edit').and('have.class', 'is-disabled');
      cy.get('.actions-column .QA-surveyDetails--previewSurvey').should('contain', 'Preview').and('be.visible');
      cy.get('.actions-column .QA-surveyDetails--deleteSurvey').should('contain', 'Archive').and('be.visible');
      cy.get('.sidebar div:nth-child(1) .key').should('contain', 'Campaign Name').and('be.visible');
      cy.get('.sidebar div:nth-child(1) p2').should('contain', survey.campaignName).and('be.visible');
      cy.get('.sidebar div:nth-child(2) .key').should('contain', 'Campaign ID').and('be.visible');
      cy.get('.sidebar div:nth-child(2) p2').should('contain', survey.campaignId).and('be.visible');
      cy.get('.sidebar div:nth-child(3) .key').should('contain', 'CMA Segment').and('be.visible');
      cy.get('.sidebar div:nth-child(4) .key').should('contain', 'Flight Dates').and('be.visible');
      cy.get('.sidebar div:nth-child(4) p2').should('contain', survey.flightStartDate.split(',')[0])
        .should('contain', survey.flightStartDate.split(',')[1])
        .and('be.visible');
      cy.get('.sidebar div:nth-child(4) p2').should('contain', survey.flightEndDate.split(',')[0])
        .should('contain', survey.flightEndDate.split(',')[1])
        .and('be.visible');
      cy.get('.sidebar div:nth-child(5) .key').should('contain', 'Targeting').and('be.visible');
      cy.get('.sidebar div:nth-child(5) p2').should('contain', `[campaign] ${survey.campaignName}`).and('be.visible');
      cy.get('.sidebar div:nth-child(6) .key').should('contain', 'Creation Date').and('be.visible');
      cy.get('.sidebar div:nth-child(6) p2').should('contain', survey.creationDate.split(',')[0])
        .and('contain', survey.creationDate.split(',')[1])
        .and('be.visible');
      cy.get('.sidebar div:nth-child(7) .key').should('contain', 'Created By').and('be.visible');
      cy.get('.sidebar div:nth-child(7) p2').should('contain', Cypress.env('username')).and('be.visible');
      cy.get('.sidebar div:nth-child(8) .key').should('contain', 'Last Edited').and('be.visible');
      cy.get('.sidebar div:nth-child(10) .key').should('contain', 'DFP Status').and('be.visible');
      cy.get('.sidebar div:nth-child(11) .key').should('contain', 'Controlled').and('be.visible');
      cy.get('.sidebar div:nth-child(11) p2').should('contain', 'Draft').and('be.visible');
      cy.get('.sidebar div:nth-child(12) .key').should('contain', 'Exposed').and('be.visible');
      cy.get('.sidebar div:nth-child(12) p2').should('contain', 'Draft').and('be.visible');
      cy.get('.impressions.wrapper').should('contain', 'Impressions').and('be.visible');
      cy.get('.response.wrapper').should('contain', 'Response Rate').and('be.visible');
      cy.get('.questions .is-active').should('contain', survey.firstQuestionCategory).and('be.visible');
      cy.get('.question-content p').should('contain', survey.firstQuestion).and('be.visible');
      cy.get('ul li:nth-child(1)').should('contain', survey.firstQuestionAnswers[0]).and('be.visible');
      cy.get('ul li:nth-child(1) .preferredAnswer').should('not.exist');
      cy.get('ul li:nth-child(2)').should('contain', survey.firstQuestionAnswers[1]).and('be.visible');
      cy.get('ul li:nth-child(2) .preferredAnswer').should('contain', 'Preferred Answer').and('be.visible');
      cy.get('ul li:nth-child(3)').should('contain', survey.firstQuestionAnswers[2]).and('be.visible');
      cy.get('ul li:nth-child(3) .preferredAnswer').should('not.exist');
      cy.get('ul li:nth-child(4)').should('contain', survey.firstQuestionAnswers[3]).and('be.visible');
      cy.get('ul li:nth-child(4) .preferredAnswer').should('not.exist');
      cy.get('div.tab:nth-child(2)').click();
      cy.get('.questions .is-active').should('contain', survey.secondQuestionCategory).and('be.visible');
      cy.get('.question-content p').should('contain', survey.secondQuestion).and('be.visible');
      cy.get('ul li:nth-child(1)').should('contain', survey.secondQuestionAnswers[0]).and('be.visible');
      cy.get('ul li:nth-child(1) .preferredAnswer').should('contain', 'Preferred Answer').and('be.visible');
      cy.get('ul li:nth-child(2)').should('contain', survey.secondQuestionAnswers[1]).and('be.visible');
      cy.get('ul li:nth-child(2) .preferredAnswer').should('contain', 'Preferred Answer').and('be.visible');
      cy.get('ul li:nth-child(3)').should('contain', survey.secondQuestionAnswers[2]).and('be.visible');
      cy.get('ul li:nth-child(3) .preferredAnswer').should('not.exist');
      cy.get('ul li:nth-child(4)').should('contain', survey.secondQuestionAnswers[3]).and('be.visible');
      cy.get('ul li:nth-child(4) .preferredAnswer').should('not.exist');
      cy.get('ul li:nth-child(5)').should('contain', survey.secondQuestionAnswers[4]).and('be.visible');
      cy.get('ul li:nth-child(5) .preferredAnswer').should('not.exist');
      cy.get('ul li:nth-child(6)').should('contain', survey.secondQuestionAnswers[5]).and('be.visible');
      cy.get('ul li:nth-child(6) .preferredAnswer').should('not.exist');
      cy.get('.QA-surveyDetails--viewInLooker').should('be.disabled');
      cy.get('.QA-surveyDetails--viewInKM').should('be.visible');
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
