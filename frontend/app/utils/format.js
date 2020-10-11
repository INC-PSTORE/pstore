export function incFormatBalance(balance, decimals) {
    return Number.parseFloat(balance / (10** (Number(decimals) || 0))).toFixed(4);
}

export function ethFormatBalance(balance) {
    return Number.parseFloat(balance).toFixed(4);
}