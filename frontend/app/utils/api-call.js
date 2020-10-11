/*
* Api call util
*/

// import { AsyncStorage } from 'react-native';
import { isUserAuthenticated } from './auth';
import request from './request';
// import { handleSpinner } from '../containers/App/actions';

const defaultMethod = 'GET';

/**
 * Build options
 */
export function buildOptions(method = defaultMethod, bodyObj, customHeaders) {
  // const token = await AsyncStorage.getItem('userToken');
  const token = window.localStorage.getItem('userToken');
  return {
    method,
    headers: {
      ...{
        'Content-Type': 'application/json',
        Authorization: token,
      },
      ...customHeaders,
    },
    body: JSON.stringify(bodyObj),
  };
}

/**
 * Build api server
 */
export function buildApiServer() {
  return process.env.API_SERVER;
}

export async function handleFailure(
  dispatch,
  currentErrorHandler,
  globalErrorHandler,
  err,
  isUsingGlobalSpinner = false,
) {
  const status = err.status;
  let errContent;
  try {
    errContent =
      err && err.json
        ? await err.json()
        : { Error: 'Something went wrong, please try again' };
  } catch (e) {
    errContent = { Error: e.toString() };
  }
  // isUsingGlobalSpinner && dispatch(handleSpinner(false));
  currentErrorHandler &&
    dispatch(
      currentErrorHandler({
        status: status || 500,
        error: errContent,
      }),
    );
  globalErrorHandler &&
    dispatch(
      globalErrorHandler({
        status: status || 500,
        error: errContent,
      }),
    );
}

export function handleSuccess(
  dispatch,
  successHandler,
  result,
  isUsingGlobalSpinner = false,
) {
  // isUsingGlobalSpinner && dispatch(handleSpinner(false));
  dispatch(successHandler(result));
}

export async function makeCall(
  dispatch,
  requestURL,
  options,
  authNeeded,
  isUsingGlobalSpinner = false,
) {
  const isAuthenticated = isUserAuthenticated();
  if (authNeeded && !isAuthenticated) {
    const unauthorizedError = {
      response: {
        status: 401,
      },
    };
    throw unauthorizedError;
  }
  // isUsingGlobalSpinner && dispatch(handleSpinner(true));
  return await request(requestURL, options);
}
