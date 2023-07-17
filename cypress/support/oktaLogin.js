//  The following is expected to be used for UI Test Cases
//  This will return the 'access_token' to be used as authorization bearer for UI Test cases
//  First Request will return 'sessionToken' after login using valid username and password
//  Second Request will get authorization and redirect the user to KBR Website
//  will use values defined in cypress.json file

Cypress.Commands.add('loginOkta', (username, password) => {
  const getSessionTokenRequest = {
    method: 'POST',
    url: Cypress.env('session_token_url'),
    body: {
      username,
      password,
      options: {
        warnBeforePasswordExpired: 'true',
      },
    },
  };
  cy.request(getSessionTokenRequest).then((getSessionTokenResponse) => {
    assert.equal(getSessionTokenResponse.status, 200, 'Response Status value ');
    const { sessionToken } = getSessionTokenResponse.body;

    const getAuthorizetoKBRSite = {
      url: Cypress.env('code_url'),
      qs: {
        // query string parameters
        client_id: Cypress.env('client_id'),
        code_challenge: Cypress.env('code_challenge'),
        state: Cypress.env('state'),
        nonce: Cypress.env('nonce'),
        code_challenge_method: 'S256',
        redirect_uri: Cypress.env('redirect_uri'),
        prompt: 'none',
        response_mode: 'fragment',
        response_type: 'code',
        scope: 'openid',
        sessionToken,
      },
    };
    cy.request(getAuthorizetoKBRSite).then((getAuthorizetoKBRSiteResponse) => {
      assert.equal(getAuthorizetoKBRSiteResponse.status, 200, 'Response Status value ');
      const redirectUrl = getAuthorizetoKBRSiteResponse.redirects[0].split(': ')[1];
      cy.log(getAuthorizetoKBRSiteResponse);
      cy.visit(redirectUrl);
    });
  });
});
