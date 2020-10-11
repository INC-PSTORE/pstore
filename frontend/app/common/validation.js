import {isIncAddressService, isIncPrivateKeyService} from '../services/incognito/wallet';
import {isETHAddressService, isETHPrivateKeyService} from '../services/eth/wallet';

export function isFiniteNumber(number) {
  return isFinite(number);
}

export function isIncAddress(address) {
  return isIncAddressService(address);
}

export function isIncPrivateKey(privateKey) {
  return isIncPrivateKeyService(privateKey);
}

export function isETHAddress(address) {
  return isETHAddressService(address);
}

export function isETHPrivateKey(privateKey) {
  return isETHPrivateKeyService(privateKey);
}