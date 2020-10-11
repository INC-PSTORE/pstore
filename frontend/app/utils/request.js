import 'whatwg-fetch';

/**
 * Parses the JSON returned by a network request
 *
 * @param  {object} response A response from a network request
 *
 * @return {object}          The parsed JSON from the request
 */
function parseJSON(response) {
  if (response.status === 204) {
    return null;
  }
  return response.json();
}

/**
 * Checks if a network request came back fine, and throws an error if not
 *
 * @param  {object} response   A response from a network request
 *
 * @return {object|undefined} Returns either the response, or throws an error
 */
function checkStatus(response) {
  if (response.status >= 200 && response.status < 300) {
    return response;
  }
  // const error = new Error(response.statusText);
  // error.response = response;
  // throw error;
  throw response;
}

/**
 * Add set timeout for api call,
 * if time is exceeded then throwing error timeout
 * regardless request is still calling in background
 *
 * @param  {promise function} fetchPromise Promise function
 * @param  {integer} ms                    Timeout in ms
 * @return {promise}                       The response
 */
function fetchWithTimeout(fetchPromise, ms) {
  return new Promise((resolve, reject) => {
    const timeoutId = setTimeout(() => reject(new Error('Time out')), ms);
    fetchPromise
      .then(
        (res) => {
          clearTimeout(timeoutId);
          resolve(res);
        },
        (err) => {
          clearTimeout(timeoutId);
          reject(err);
        }
      );
  });
}

/**
 * Requests a URL, returning a promise
 *
 * @param  {string} url       The URL we want to request
 * @param  {object} [options] The options we want to pass to "fetch"
 *
 * @return {object}           The response data
 */
export default function request(url, options) {
  return fetchWithTimeout(fetch(url, options), 20000)
    .then(checkStatus)
    .then(parseJSON);
}
