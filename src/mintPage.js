import './App.css';
import contract from './contracts/MpTest.json';
import { useEffect, useState } from 'react';
import { ethers } from 'ethers';

const contractAddress = "0x441A02F510381856d4C7DE6e26978Ab25B4cB7ac";
const abi = contract.abi;

function App() {

	// deploy simple storage contract and paste deployed contract address here. This value is local ganache chain
	let contractAddress = '0xCF31E7c9E7854D7Ecd3F3151a9979BC2a82B4fe3';

	const [errorMessage, setErrorMessage] = useState(null);
	const [defaultAccount, setDefaultAccount] = useState(null);
	const [connButtonText, setConnButtonText] = useState('Connect Wallet');

	const [currentContractVal, setCurrentContractVal] = useState(null);

	const [provider, setProvider] = useState(null);
	const [signer, setSigner] = useState(null);
	const [contract, setContract] = useState(null);

	const connectWalletHandler = () => {
		if (window.ethereum && window.ethereum.isMetaMask) {
			window.ethereum.request({ method: 'eth_requestAccounts'})
			.then(result => {
				accountChangedHandler(result[0]);
				setConnButtonText('Wallet Connected');
			})
			.catch(error => {
				setErrorMessage(error.message);
			});
		} else {
			console.log('Need to install MetaMask');
			setErrorMessage('Please install MetaMask browser extension to interact');
		}
	}

	// update account, will cause component re-render
	const accountChangedHandler = (newAccount) => {
		setDefaultAccount(newAccount);
		updateEthers();
	}

	const chainChangedHandler = () => {
		// reload the page to avoid any errors with chain change mid use of application
		window.location.reload();
	}

	// listen for account changes
	window.ethereum.on('accountsChanged', accountChangedHandler);
	window.ethereum.on('chainChanged', chainChangedHandler);



	const updateEthers = () => {
		let tempProvider = new ethers.providers.Web3Provider(window.ethereum);
		setProvider(tempProvider);

		let tempSigner = tempProvider.getSigner();
		setSigner(tempSigner);

		let tempContract = new ethers.Contract(contractAddress, abi, tempSigner);
		setContract(tempContract);
	}

	const getCurrentVal = async () => {
		let val = await contract.totalSupply();
		setCurrentContractVal(val);
	}


    const mintNftHandler = async () => {
        try {
          const { ethereum } = window;
          if (ethereum) {
            const provider = new ethers.providers.Web3Provider(ethereum);
            const signer = provider.getSigner();
            const nftContract = new ethers.Contract(contractAddress, abi, signer);
            console.log("Initialize payment");
            let nftTxn = await nftContract.createToken(1);
            console.log("Mining... please wait");
            await nftTxn.wait();
            console.log(`Mined, see transaction: https://rinkeby.etherscan.io/tx/${nftTxn.hash}`);
          } else {
            return 0;
          }
        } catch (err) {
          console.log(err);
        }
      }

      const mintNftButton = () => {
        return (
          <button onClick={mintNftHandler} className='cta-button mint-nft-button'>
            Mint NFT
          </button>
        )
      }

      const connectWalletButton = () => {
        return (
          <button onClick={connectWalletHandler} className='cta-button connect-wallet-button'>
            Connect Wallet
          </button>
        )
      }

	return (
		<div>
		<h4> {"Get/Set Contract interaction"} </h4>
            {defaultAccount ? mintNftButton() : connectWalletButton()}
			<div>
				<h3>Address: {defaultAccount}</h3>
			</div>
			<div>
			<button onClick={getCurrentVal} style={{marginTop: '5em'}}> Get Current Contract Value </button>
			</div>
			{currentContractVal}
			{errorMessage}
		</div>
	);
}

export default App;