import './App.css';
import contract from './contracts/MpTest.json';
import { useState } from 'react';
import { ethers } from 'ethers';

const contractAddress = "0xb4Cc619F07e6F171620621C776274b7E8E013587";
const abi = contract.abi;
const networkName = "Rinkeby"
const chainId = 4
const max_num = 10

function App() {
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



	const updateEthers = async() => {
		let tempProvider = new ethers.providers.Web3Provider(window.ethereum);
		setProvider(tempProvider);
		let network = await tempProvider.getNetwork();
		if (network.chainId === chainId){
			let tempSigner = tempProvider.getSigner();
			setSigner(tempSigner);

			let tempContract = new ethers.Contract(contractAddress, abi, tempSigner);
			setContract(tempContract);

			let val = await tempContract.totalSupply();
			setCurrentContractVal(parseInt(val["_hex"], 16));
		}else{
			setDefaultAccount(null);
		}
	}

  	const mintNftHandler = async () => {
      try {
        console.log("Initialize payment");
        let nftTxn = await contract.createToken();
        console.log("Mining... please wait");
        await nftTxn.wait();
        console.log(`Mined, see transaction: https://rinkeby.etherscan.io/tx/${nftTxn.hash}`);
      } catch (err) {
        console.log(err);
      }
  }

  	const mintNftButton = () => {
		if (currentContractVal < max_num){
			return (
				<button onClick={mintNftHandler} className='cta-button mint-nft-button'>
				  Mint NFT
				</button>
		  )
		}else{
			return (
				<font size="50"><b>sold out</b></font>
			)
		}
  	}

  	const connectWalletButton = () => {
    	return (
      		<button onClick={connectWalletHandler} className='cta-button connect-wallet-button'>
        		Connect Wallet
      		</button>
    	)
  	}

	const getAccountAddress=()=>{
		return(
			<div>
				<p className = "big"><br></br>Your address<br></br></p>
				<font size="4">
					<b>{defaultAccount}</b>
				</font>
			</div>
		)
	}

	const warningConnect=()=>{
		return(
			<div>
				<p className = "big"><br></br>Connect to the {networkName} network<br></br></p>
			</div>
		)
	}

	return (
			<div className='main-app'>
				<h1> Mint Page </h1>
					<div className="kakomi-box10">
						<p className = "big">Total Supply<br></br></p>
						<font size="50"><b>{currentContractVal} / {max_num}</b></font>
						{defaultAccount ? getAccountAddress() : warningConnect()}
						<p><br></br><br></br><br></br></p>
						<div>
							{defaultAccount ? mintNftButton() : connectWalletButton()}
						</div>
					</div>
			</div>
	);
}

export default App;