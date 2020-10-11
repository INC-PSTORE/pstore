export function incToNanoAmount(amount, decimals) {
    return Number(amount) * (10 ** (Number.parseInt(decimals) || 0));
}

export function incToUIAmount(amount, decimals) {
    return Number.parseFloat(amount) / (10 ** (Number.parseInt(decimals) || 0));
}
