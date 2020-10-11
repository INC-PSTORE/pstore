import Wallet from 'ethereumjs-wallet';
import { storage } from '../localStorage';
import { STORAGE_KEY, ETHER_ID } from '../../common/constants';
import Web3 from "web3";
import { getETHFullnodeHost, getEtherScanAPIHost } from "../../common/utils";
import {countDownRequests} from "../../containers/App/actions";
import {HANDLE_FAILURE_GLOBALLY} from "../../containers/App/constants";


const web3 = new Web3(getETHFullnodeHost());

export function createNewETHAccount() {
    let ethAccount = Wallet.generate();
    const keys = getKeysFromAccount(ethAccount);

    if (keys.privateKey) {
        saveETHPrivateKey(keys.privateKey);
    }

    return ethAccount;
}

export function getETHAccountFromPrivateKeyStr(privateKeyStr) {
    let buffPrivateKey = Buffer.from(privateKeyStr, 'hex');
    return Wallet.fromPrivateKey(buffPrivateKey);
}

export function importETHAccount(privateKeyStr) {
    let ethAccount = getETHAccountFromPrivateKeyStr(privateKeyStr);
    const keys = getKeysFromAccount(ethAccount);

    if (keys && keys.privateKey) {
        saveETHPrivateKey(keys.privateKey);
    }

    return ethAccount;
}

export function getKeysFromAccount(ethAccount) {
    if (ethAccount) {
        const privateKey = ethAccount.getPrivateKeyString().replace("0x", "");
        return {
            address: ethAccount.getAddressString(),
            publicKey: getPublicKeyFromPrivateKey(privateKey),
            privateKey,
          };
    }

    return null;
}

export function getKeyFromPrivateKey(privateKeyStr) {
    let ethAccount = getETHAccountFromPrivateKeyStr(privateKeyStr);
    return getKeysFromAccount(ethAccount);
}

//todo:
export function getPublicKeyFromPrivateKey(privateKeyStr) {
    return '';
}

export function loadETHAccountFromStorage(){
    const ethPrivateKey = storage.getItem(STORAGE_KEY.ETH_PRIVATE_KEY);
    if (ethPrivateKey) {
        return getETHAccountFromPrivateKeyStr(ethPrivateKey);
    }
    return null;
}

export function saveETHPrivateKey(ethPrivateKey) {
    storage.setItem(STORAGE_KEY.ETH_PRIVATE_KEY, ethPrivateKey);
}

export async function getBalance(ethAddress, tokenId) {
    if (tokenId === ETHER_ID) {
        let weiBalance = await web3.eth.getBalance(ethAddress);
        return web3.utils.fromWei(weiBalance, 'ether');
    } else {
        const getBalance = [
            {"constant":true,"inputs":[{"name":"_owner","type":"address"}],"name":"balanceOf","outputs":[{"name":"balance","type":"uint256"}],"payable":false,"type":"function"},
            {"constant":true,"inputs":[],"name":"decimals","outputs":[{"name":"","type":"uint256"}],"payable":false,"type":"function"},
        ];
        const tokenInstance = new web3.eth.Contract(getBalance, tokenId);
        let balance = await tokenInstance.methods.balanceOf(ethAddress).call();
        let decimal =  await tokenInstance.methods.decimals().call();
        return balance / (10 ** decimal);
        // TODO: uncomment for product env
        // const ethscanHost = getEtherScanAPIHost();
        // const res = await fetch(ethscanHost+'?module=account&action=tokenbalance&contractaddress='+tokenId+'&address='+address+'&tag=latest&apikey=GGNTHK5V14XPUD87G2NGRU9RT6RP5INWWR');
        // const data = await res.json();
        // return data.result;
    }
}

export function isETHAddressService(address) {
    return !web3.utils.isAddress(address.toLowerCase());
}

export function isETHPrivateKeyService(privateKeyStr) {
    try {
        let w = Wallet.fromPrivateKey(new(Buffer).from(privateKeyStr, 'hex'));
        return w.getPrivateKey().length > 0;
    } catch (e){
        console.error(`Error ETH private key ${e}`);
        return false;
    }
}

