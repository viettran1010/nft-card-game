
import { ADDRESS, ABI } from '../contracts/index';
import AVAXGods from '../contracts/AVAXGods.json';
import { ethers } from 'ethers';

function isEthereum() {
  if (window.ethereum) return true;

  return false;
}

function getChainID() {
  if (isEthereum())  return parseInt(window.ethereum.chainId, 16);
  
  return 0;
}

async function handleConnection(accounts) {
  if (accounts.length === 0) {
    const fetchedAccounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    
    return fetchedAccounts;
  }

  return accounts;
}

async function requestAccount() {
  let currentAccount = 0x0;

  if (isEthereum() && getChainID() !== 0) {
    let accounts = await window.ethereum.request({ method: 'eth_accounts' });
    accounts = await handleConnection(accounts);
    currentAccount = accounts[0];
  }

  return currentAccount;
}

async function requestBalance(currentAccount) {
  let currentBalance = 0;

  if (isEthereum()) {
    try {
      currentBalance = await window.ethereum.request({
        method: 'eth_getBalance',
        params: [currentAccount, 'latest'],
      });

      currentBalance = parseInt(currentBalance, 16) / 1e18;

      return { currentBalance, err: false };
    } catch (err) {
      return { currentBalance, err: true };
    }
  }

  return { currentBalance, err: true };
}

export const GetParams = async () => {
  const response = {
    isError: false,
    message: '',
    step: -1,
    balance: 0,
    account: '0x0',
  };

  if (!isEthereum()) {
    response.step = 0;

    return response;
  }

  const currentAccount = await requestAccount();
  if (currentAccount === 0x0) {
    response.step = 1;

    return response;
  }

  response.account = currentAccount;

  if (getChainID() !== 43113) {
    response.step = 2;

    return response;
  }

  const { currentBalance, err } = await requestBalance(currentAccount);
  if (err) {
    response.isError = true;
    response.message = 'Error fetching balance!';

    return response;
  }
  
  response.balance = currentBalance;

  if (currentBalance < 0.2) {
    response.step = 3;

    return response;
  }

  return response;
};

export async function SwitchNetwork() {
  await window?.ethereum?.request({
    method: 'wallet_addEthereumChain',
    params: [{
      chainId: '0xA869',
      chainName: 'Fuji C-Chain',
      nativeCurrency: {
        name: 'AVAX',
        symbol: 'AVAX',
        decimals: 18,
      },
      rpcUrls: ['https://api.avax-test.network/ext/bc/C/rpc'],
      blockExplorerUrls: ['https://testnet.snowtrace.io'],
    }],
  }).catch((error) => {
    console.log(error);
  });
}

export async function sendTreatmentPlanRequest(requestBody) {
  if (!window.ethereum) {
    throw new Error('Ethereum object not found, install MetaMask.');
  }

  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  const contract = new ethers.Contract(ADDRESS, AVAXGods.abi, signer);

  try {
    const transaction = await contract.createTreatmentPlanRequest(
      requestBody.email,
      requestBody.displayName,
      requestBody.dateOfBirth,
      requestBody.gender,
      requestBody.area,
      requestBody.menu,
      requestBody.description,
      requestBody.images
    );
    await transaction.wait();
    return transaction;
  } catch (error) {
    console.error('Error sending treatment plan request:', error);
    throw error;
  }
}
