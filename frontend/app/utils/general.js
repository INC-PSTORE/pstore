// this section is for util functions which are common or don't know where to put them in.

export function debounce(func, waitTimeInMs) {
  let timeout;
  return function() {
    const context = this;
    const args = arguments;

    const executeFunc = function() {
      func.apply(context, args);
    }

    clearTimeout(timeout);
    timeout = setTimeout(executeFunc, waitTimeInMs);
  }
}