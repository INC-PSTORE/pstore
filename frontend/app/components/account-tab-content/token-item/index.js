
import Web3 from 'web3';
import React from 'react';
import { getBalanceByToken, getIncKeyFromAccount } from '../../../services/incognito/wallet';
import { getBalance as getETHBalance, getKeysFromAccount } from '../../../services/eth/wallet';
import { onError } from '../../../services/errorHandler';
import { incFormatBalance, ethFormatBalance } from '../../../utils/format';
import { Typography, withStyles, Button } from '@material-ui/core';
import styles from './styles';
import { ACCOUNT_TYPE } from '../../../containers/accounts/constants';
import { TOKEN_INFO } from '../../../common/constants';

import {
    getETHFullnodeHost,
    getIncContractABI,
    getIncognitoContractAddr,
} from '../../../common/utils';

class TokenItem extends React.Component {
    constructor() {
        super();

        this.state = {
            balance: null,
            isLoading: false,
            incTokenInstance: null,
            accountKeys: null,
            isShowTransfer: false,
            isIncToken: false
        };
    }

    componentDidUpdate(prevProps) {
        const { account, token, accountType } = this.props;
        const { tokenId } = token || {};

        if (prevProps && prevProps.token && prevProps.token.tokenId !== tokenId || account !== prevProps.account) {
            this.getTokenInfo(account, token, accountType);
        }
    }

    componentDidMount() {
        const { token, account, accountType } = this.props;
        this.getTokenInfo(account, token, accountType);
    }

    isPRVToken() {

        const { token } = this.props;
        return token && token.tokenId === TOKEN_INFO.PRV.tokenId;
    }

    isETHToken() {
        const { token } = this.props;
        return token && token.tokenId === '0x0000000000000000000000000000000000000000';
    }

    async getTokenInfo(account, token, type) {
        if (type === ACCOUNT_TYPE.ETH) {
            this.setState({ isIncToken: false });
            return await this.getETHToken(account, token);
        } else if (type === ACCOUNT_TYPE.INC) {
            this.setState({ isIncToken: true });
            return await this.getIncToken(account, token);
        } else if (type === ACCOUNT_TYPE.GEN_ETH) {
            this.setState({ isIncToken: false });
            return await this.getGeneratedETHToken(account, token);
        }
    }

    async getIncToken(account, token) {
        const { tokenId } = token;

        if (tokenId) {
            let incTokenInstance;
            if (this.isPRVToken()) {
                incTokenInstance = account.nativeToken;
            } else {
                incTokenInstance = await account.getFollowingPrivacyToken(tokenId);
                console.log({ account });
                console.log({ incTokenInstance });
            }

            this.setState({ incTokenInstance }, () => {
                this.loadIncBalance(incTokenInstance);
            });
        }
    }

    async loadIncBalance(incTokenInstance) {
        try {
            this.setState({ isLoading: true });
            const balance = await getBalanceByToken(incTokenInstance);
            this.setState({ balance });
        } catch(e) {
            onError(e);
        } finally {
            this.setState({ isLoading: false });
        }
    }

    async getETHToken(account, token) {
        this.setState({ incTokenInstance: token }, () => {
            this.loadETHBalance(account, token);
        })
    }

    async loadETHBalance(account, token) {
        try {
            const { tokenId } = token;
            this.setState({ isLoading: true });

            const address = account.getAddressString()
            const balance = await getETHBalance(address, tokenId);

            this.setState({ balance });
        } catch(e) {
            onError(e);
        } finally {
            this.setState({ isLoading: false });
        }
    }

    async getGeneratedETHToken(account, token) {
        this.setState({ incTokenInstance: token }, () => {
            this.loadDeployedBalance(account, token);
        })
    }

    async loadDeployedBalance(account, token) {
        console.log('hahah: ', account.getAddressString());
        try {
            this.setState({ isLoading: true });
            const incContractAddr = getIncognitoContractAddr();
            const web3 = new Web3(getETHFullnodeHost());
            const incContract = new web3.eth.Contract(getIncContractABI(), incContractAddr);
            const balance = await incContract.methods.getDepositedBalance(token.tokenId, account.getAddressString()).call();
            const convertedBal = balance / (10 ** token.eDecimals);
            this.setState({ balance: convertedBal });
        } catch (e) {
            onError(e);
        } finally {
            this.setState({ isLoading: false });
        }
    }

    render() {
        const { classes, onClick, token } = this.props;
        const { balance, incTokenInstance, isIncToken } = this.state;
        const formatedBalance = isIncToken ? incFormatBalance(balance, token.pDecimals) : ethFormatBalance(balance);
        // const name = isIncToken ? incTokenInstance && incTokenInstance.bridgeInfo && incTokenInstance.bridgeInfo.pSymbol : token && token.tokenSymbol;
        const symbol = isIncToken
            ? incTokenInstance && (incTokenInstance.bridgeInfo && incTokenInstance.bridgeInfo.pSymbol || incTokenInstance.symbol)
            : token && token.tokenSymbol;

        return (
            <div className={classes.container} onClick={() => onClick(incTokenInstance)}>
                <div>
                    <img src={token.icon} className={classes.icon} />
                </div>
                <div className={classes.nameView}>
                    <Typography noWrap className={classes.name}>{symbol || '---'}</Typography>
                </div>
                <Typography noWrap className={classes.balance}>{formatedBalance}</Typography>
            </div>
        );
    }
}

export default withStyles(styles)(TokenItem);
