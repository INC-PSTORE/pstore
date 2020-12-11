
export const PSAFE_DOMAIN = 'https://psafe.app';
export const PTRADE_DOMAIN = 'https://ptrade.app';

export const PRIMARY_COLOR = '#fb958b';

export const INITIAL_PAGING_SKIP = 0;
export const PAGING_LIMIT = 15;

export const INCOGNITO_TESTNET_CONTRACT_ADDRESS = '0x7c7e371D1e25771f2242833C1A354dCE846f3ec8';
export const INCOGNITO_MAINNET_CONTRACT_ADDRESS = '0x97875355eF55Ae35613029df8B1C8Cf8f89c9066';

export const INCOGNITO_TESTNET_FULLNODE = 'https://testnet.incognito.org/fullnode';
export const INCOGNITO_MAINNET_FULLNODE = 'https://mainnet.incognito.org/fullnode';

export const INCOGNITO_TESTNET_BURN_ADDRESS = '12RxahVABnAVCGP3LGwCn8jkQxgw7z1x14wztHzn455TTVpi1wBq9YGwkRMQg3J4e657AbAnCvYCJSdA9czBUNuCKwGSRQt55Xwz8WA';
export const INCOGNITO_MAINNET_BURN_ADDRESS = '12RxahVABnAVCGP3LGwCn8jkQxgw7z1x14wztHzn455TTVpi1wBq9YGwkRMQg3J4e657AbAnCvYCJSdA9czBUNuCKwGSRQt55Xwz8WA';

export const ETHER_ID = '0x0000000000000000000000000000000000000000';

// shield
export const ETH_INT_SHIELD = 0;
export const ETH_DEPOSITING_TO_INC_CONTRACT = 1;
export const ETH_DEPOSITED_TO_INC_CONTRACT = 2;
export const SHIELDING_PROOF_SUBMITTING = 3;
export const SHIELDING_PROOF_SUBMITTED = 4;
export const SHIELDING_PROOF_SUBMIT_REJECTED = 5;
export const SHIELDING_FINISHED = 6;
export const ETH_DEPOSIT_FAILED = 11;

export const PRIVATE_TRANSFERRING = 6;
export const PRIVATE_TRANSFERRED = 7;
export const PRIVATE_TRANSFER_FAILED = 8;

// Burn to withdraw
export const INC_BURN_TO_UNSHIELD_INIT = 1
export const INC_BURNED_TO_UNSHIELD    = 2
export const INC_BURNED_NOT_FOUND      = 3
export const INC_BURNED_SUCCESS        = 4
export const INC_BURNED_FAILED         = 5
export const INC_TRANSACTION_REJECTED  = 6

// Unshield statuses
export const ETH_WITHDRAW_SUCCESS      = 10
export const ETH_WITHDRAW_FAILED       = 11
export const ETH_SUBMITING_TX          = 12
export const ETH_WITHDRAW_REJECTED     = 13
export const ETH_SUBMITED_TX           = 14
export const ETH_WITHDRAW_UNKNOWN      = 15
export const ETH_TRANSACTION_RECJECTED = 16

// Deploy statuses
export const INC_BURN_TO_DEPLOY_INIT = 1
export const INC_BURNED_TO_DEPLOY = 2
export const ETH_DEPLOY_SUCCESS = 10
export const ETH_DEPLOY_FAILED = 11
export const ETH_DEPLOY_UNKNOWN = 15

// Undeploy statuses
export const ETH_UNDEPLOYING_FROM_INC_CONTRACT = 1
export const ETH_UNDEPLOYED_FROM_INC_CONTRACT = 2
export const UNDEPLOYED_PROOF_SUBMITTING = 3
export const UNDEPLOYED_PROOF_SUBMITTED = 4
export const UNDEPLOYED_PROOF_SUBMIT_REJECTED = 5
export const UNDEPLOY_FINISHED = 6
export const ETH_UNDEPLOYING_FAILED = 7

export const STORAGE_KEY = {
    INC_WALLET: 'INC_WALLET',
    ETH_PRIVATE_KEY: 'ETH_PRIVATE_KEY',
}

export const INC_WALLET_BACKUP_PASS = '123';
export const INC_WALLET_PASSPHRASE = '123';

export const ETH_MAINNET_ID = "0x1";
export const ETH_KOVAN_ID = "0x2a";
export const INCOGNITO_FULLNODE_TESTNET = "https://testnet.incognito.org/fullnode";
export const INCOGNITO_FULLNODE_MAINNET = "https://fullnode.incognito.best";
export const ETH_INFURA_TESTNET = "https://kovan.infura.io/v3/34918000975d4374a056ed78fe21c517";
export const ETH_INFURA_MAINNET = "https://mainnet.infura.io/v3/34918000975d4374a056ed78fe21c517";
export const INCOGNITO_API_TESTNET = "https://test-api2.incognito.org";
export const INCOGNITO_API_MAINNET = "https://api.incognito.org";

export const DEFAULT_PRV_FEE = 100;   // in nano PRV
export const DEFAULT_PRV_FEE_VALIDATE_SHIELD = 100;

export const TOKEN_INFO = {
    PRV: {
        tokenId: '0000000000000000000000000000000000000000000000000000000000000004',
        name: 'Privacy coin',
        symbol: 'PRV'
    }
};