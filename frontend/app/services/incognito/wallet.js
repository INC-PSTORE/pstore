import {
  WalletInstance, goServices, storageService, setConfig,
  NativeTokenInstance, PrivacyTokenInstance,
  isPaymentAddress, isPrivateKey,
} from 'incognito-js';
import { storage } from '../localStorage';
import { STORAGE_KEY, INC_WALLET_BACKUP_PASS, INC_WALLET_PASSPHRASE, DEFAULT_PRV_FEE } from '../../common/constants';

let wallet;

// set up environment and init new wallet or load wallet from storage
export async function setupIncWallet(isMainnet, chainURL, apiURL) {
  // load wasm
  await goServices.implementGoMethodUseWasm();

  // config SDK
  setConfig({
    mainnet: isMainnet,
    chainURL: chainURL,
    apiURL: apiURL,
  });

  // storage
  storageService.implement({
    namespace: 'inc-wallet',
    getMethod: (key) => {
      return new Promise((resolve, reject) => {
        try {
          const data = localStorage.getItem(key);
          resolve(data);
        } catch (e) {
          reject(e);
        }
      })
    },
    setMethod: (key, data) => {
      return new Promise((resolve, reject) => {
        try {
          localStorage.setItem(key, data);
          resolve();
        } catch (e) {
          reject(e);
        }
      })
    },
    removeMethod: (key) => {
      return new Promise((resolve, reject) => {
        try {
          localStorage.removeItem(key);
          resolve();
        } catch (e) {
          reject(e);
        }
      })
    }
  });

  // init wallet
  return await getWallet();
}

// getWallet returns global wallet or inits new wallet if wallet is undefined
export async function getWallet() {
  if (!wallet) {
    // load from local storage by KeyWallet
    const walletData = storage.getItem(STORAGE_KEY.INC_WALLET);
    if (walletData) {
      wallet = await WalletInstance.restore(walletData, INC_WALLET_BACKUP_PASS);
    } else { // create
      wallet = new WalletInstance();
      wallet = await wallet.init(INC_WALLET_PASSPHRASE);

      // save
      saveWallet(wallet);
    }
  }

  return wallet;
}

function saveWallet(incWalet = wallet) {
  const backupData = incWalet.backup(INC_WALLET_BACKUP_PASS);
  storage.setItem(STORAGE_KEY.INC_WALLET, backupData);
}

// createNewAccount generates new account and returns new wallet
export async function createNewAccount(accountName) {
  if (!wallet) {
    console.error("Wallet is null!!!!");
  }

  let newAccount = await wallet.masterAccount.addAccount(accountName);
  saveWallet(wallet);
  return newAccount;
}

// createNewAccount generates new account and returns new wallet
export async function importAccount(accountName, privateKeyStr) {
  if (!wallet) {
    console.log("Wallet is null!!!!");
  }

  let newAccount = await wallet.masterAccount.importAccount(accountName, privateKeyStr);
  saveWallet(wallet);
  return newAccount;
}

export function getAccountByName(name, incWallet = wallet) {
  if (!incWallet) {
    return null;
  }
  return incWallet.masterAccount.getAccountByName(name);
}

export function getAccountByPrivateKey(privateKey, incWallet = wallet) {
  if (!incWallet) {
    return null;
  }
  return incWallet.masterAccount.getAccountByPrivateKey(privateKey);
}

export function getPrivateKeyByNameAccount(name, incWallet = wallet) {
  if (!incWallet) {
    return null;
  }
  let account = incWallet.masterAccount.getAccountByName(name);
  return account.key.keySet.privateKeySerialized;
}

export function getPaymentAddressByNameAccount(name, incWallet = wallet) {
  let account = incWallet.masterAccount.getAccountByName(name);
  return account.key.keySet.paymentAddressKeySerialized;
}

export function getPublicKeyByNameAccount(name, incWallet = wallet) {
  let account = incWallet.masterAccount.getAccountByName(name);
  return account.key.keySet.publicKeyCheckEncode;
}

export async function getToken(account, tokenId) {
  if (tokenId && tokenId !== '') {
    return await account.getFollowingPrivacyToken(tokenId);
  }
  return account.nativeToken;
}

export async function getBalanceByToken(token) {
  if (!token) {
    return;
  }
  try {
    const balance = await token.getTotalBalance();
    return balance.toNumber();
  } catch (e) {
    console.error(`Error loading balance ${token} - ${e}`);
    return 0;
  }

}

export async function getBalanceByPrivateKey(privateKey, tokenId = null) {
  const account = getAccountByPrivateKey(privateKey);
  const token = await getToken(account, tokenId);
  return getBalanceByToken(token);
}

export function getIncKeyAccountByName(name, incWallet = wallet) {
  const account = getAccountByName(name, incWallet);
  return getIncKeyFromAccount(account);
}

export function getIncKeyFromAccount(account) {
  return account ? {
    address: account.key.keySet.paymentAddressKeySerialized,
    privateKey: account.key.keySet.privateKeySerialized,
    publicKey: account.key.keySet.publicKeyCheckEncode
  } : null;
}

export function incTransfer(token, toAddress, amount) {
  if (!token) return;

  return token.transfer([
    {
      paymentAddressStr: toAddress,
      amount,
      message: ''
    }
  ], DEFAULT_PRV_FEE, token.isPrivacyToken ? 0 : null);
}

// return base58 check encode tx data in string
export async function incCreateRawTx(token, toAddress, amount) {
  if (!token) return;

  try {
    const res = await token.createRawTx([
      {
        paymentAddressStr: toAddress,
        amount,
        message: ''
      }
    ], DEFAULT_PRV_FEE, token.isPrivacyToken ? 0 : null);
    console.log("res: ", res);
    console.log("txInfo: ", res.txInfo);

    return res && res.txInfo && res.txInfo.b58CheckEncodeTx;
  } catch (e) {
    console.error("Error when create raw tx" , e);
    return null;
  }
}

// default is PRV (isPrivacyToken == false)
// return { txId }
export async function sendRawTx(base58, isPrivacyToken = false) {
  const sendHandler = isPrivacyToken ? PrivacyTokenInstance.sendRawTx : NativeTokenInstance.sendRawTx;
  return sendHandler(base58);
}

export async function createRawTxForBurningToken(token, externalAddress, burningAmount) {
  if (!token) return;

  try {
    const res = await token.createRawTxForBurningToken(externalAddress, burningAmount, DEFAULT_PRV_FEE, 0);

    return res && res.txInfo && res.txInfo.b58CheckEncodeTx;
  } catch (e) {
    console.error("Error when create raw tx" , e);
    return null;
  }
}

export async function createRawTxForBurningDepositToSC(token, externalAddress, burningAmount) {
  if (!token) return;

  try {
    const res = await token.createRawTxForBurningDepositToSCRequest(externalAddress, burningAmount, DEFAULT_PRV_FEE, 0);

    return res && res.txInfo && res.txInfo.b58CheckEncodeTx;
  } catch (e) {
    console.error("Error when create raw tx" , e);
    return null;
  }
}

export function isIncAddressService(addressStr) {
  return isPaymentAddress(addressStr);
}

export function isIncPrivateKeyService(privateKeyStr) {
  return isPrivateKey(privateKeyStr);
}