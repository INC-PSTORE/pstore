import React from 'react';
import AccountTabContent from '../../components/account-tab-content';
import {
    ETH_TAB_ID,
    PRIVATE_INC_ACC_NAME,
    TEMP_INC_ACC_NAME,
    PRIV_INC_ACC_TAB_ID,
    TEMP_INC_ACC_TAB_ID,
    ETH_DEPLOYED_BALANCES_ID,
} from '../accounts/constants';
import { getAccountByName } from '../../services/incognito/wallet';
import { connect } from 'react-redux';
import { getEthAccount, getGeneratedETHAccount, listAccountSelector } from './selectors';
import {
    createTempIncAccountAction, importTempIncAccountAction,
    createPrivateIncAccountAction, importPrivateIncAccountAction,
    createETHAccountAction, importETHAccountAction } from '../App/actions';
import { ACCOUNT_TYPE } from '../accounts/constants';
import { getDefaultSupportedTokens } from '../../common/utils';
import {makeSelectConfigNetwork} from "../App/selectors";

function mapAction(privIncAction, tempIncAction, ethAction, tabId) {
    if (tabId === PRIV_INC_ACC_TAB_ID) {
        return privIncAction;
    } else if (tabId === TEMP_INC_ACC_TAB_ID) {
        return tempIncAction;
    } else if (tabId === ETH_TAB_ID) {
        return ethAction;
    }
}

class AccountContent extends React.Component {
    constructor() {
        super();

        this.state = {
            account: null,
            accountType: null,
            tokenList: []
        };

        this.getAccount = this.getAccount.bind(this);
        this.handleCreateAccount = this.handleCreateAccount.bind(this);
        this.handleImportAccount = this.handleImportAccount.bind(this);
        this.getTokenList = this.getTokenList.bind(this);
    }

    componentDidMount() {
        this.getAccount();
    }

    componentDidUpdate(prevProps) {
        if (prevProps.tabId !== this.props.tabId || prevProps.listAccount !== this.props.listAccount) {
            this.getAccount();
        }
    }

    getAccount() {
        const { tabId, ethAccount, generatedETHAccount } = this.props;
        let account, accountType;

        if (tabId === PRIV_INC_ACC_TAB_ID) {
            account = getAccountByName(PRIVATE_INC_ACC_NAME);
            accountType = ACCOUNT_TYPE.INC;
        } else if (tabId === TEMP_INC_ACC_TAB_ID) {
            account = getAccountByName(TEMP_INC_ACC_NAME);
            accountType = ACCOUNT_TYPE.INC;
        } else if (tabId === ETH_TAB_ID) {
            account = ethAccount;
            accountType = ACCOUNT_TYPE.ETH;
        } else if (tabId === ETH_DEPLOYED_BALANCES_ID) {
            account = generatedETHAccount;
            accountType = ACCOUNT_TYPE.GEN_ETH;
        }

        this.setState({ accountType, account });

        return { account, accountType };
    }

    getTokenList() {
        const { accountType, configNetwork } = this.state;
        const supportedTokens = getDefaultSupportedTokens(configNetwork.isMainnet);
        
        if (accountType === ACCOUNT_TYPE.INC) {
            return supportedTokens.filter(token => !!token.incTokenId).map(token => ({
                tokenId: token.incTokenId,
                tokenSymbol: token.tokenSymbol,
                pDecimals: token.pDecimals,
                icon: token.icon,
            }));
        } else if (accountType === ACCOUNT_TYPE.ETH || accountType === ACCOUNT_TYPE.GEN_ETH) {
            return supportedTokens.filter(token => !!token.extTokenId).map(token => ({
                tokenId: token.extTokenId,
                tokenSymbol: token.tokenSymbol,
                eDecimals: token.eDecimals,
                icon: token.icon,
            }));
        }
    }

    handleCreateAccount() {
        const { createPrivateIncAccount, createTempIncAccount, createETHAccount, tabId } = this.props;
        return mapAction(createPrivateIncAccount, createTempIncAccount, createETHAccount, tabId);
    }

    handleImportAccount() {
        const { importPrivateIncAccount, importTempIncAccount, importETHAccount, tabId } = this.props;
        return mapAction(importPrivateIncAccount, importTempIncAccount, importETHAccount, tabId);
    }

    render() {
        const { account, accountType } = this.state;

        return (
            <AccountTabContent
                account={account}
                onCreate={this.handleCreateAccount()}
                onImport={this.handleImportAccount()}
                accountType={accountType}
                tokenList={this.getTokenList()}
            />
        )
    }
}

const mapStateToProps = state => ({
    ethAccount: getEthAccount(state),
    generatedETHAccount: getGeneratedETHAccount(state),
    listAccount: listAccountSelector(state),
    configNetwork: makeSelectConfigNetwork(),
});

const mapDispatchToProps = (dispatch) => ({
    createPrivateIncAccount: () => dispatch(createPrivateIncAccountAction()),
    createTempIncAccount: () => dispatch(createTempIncAccountAction()),
    importPrivateIncAccount: (privateKeyStr) => dispatch(importPrivateIncAccountAction(privateKeyStr)),
    importTempIncAccount: (privateKeyStr) => dispatch(importTempIncAccountAction(privateKeyStr)),
    createETHAccount: () => dispatch(createETHAccountAction()),
    importETHAccount: (privateKeyStr) => dispatch(importETHAccountAction(privateKeyStr)),
});

export default connect(mapStateToProps, mapDispatchToProps)(AccountContent);