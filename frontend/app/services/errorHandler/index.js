export function onError(e) {
    alert(`ERR: ${e.message || e}`);

    console.error(e);
}