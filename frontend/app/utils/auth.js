/**
* Authenticate a user. Save a token string in  window.localStorage
*
* @param {string} token
*/
export function authenticateUser(token) {
  window.localStorage.setItem('userToken', token);
}

/**
* Check if a user is authenticated - check if a token is saved in Local window.localStorage
*
* @returns {boolean}
*/
export function isUserAuthenticated() {
  const userToken = window.localStorage.getItem('userToken');
  return userToken !== null;
}

/**
* Deauthenticate a user. Remove a token from Local window.localStorage.
*
*/
export function deauthenticateUser() {
  window.localStorage.removeItem('userToken');
}

/**
* Get a token value.
*
* @returns {string}
*/
export function getToken() {
  window.localStorage.getItem('userToken');
}
