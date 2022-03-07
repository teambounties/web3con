import { useEffect, useState } from 'react';
//const awaitTransactionMined = require ('await-transaction-mined');
import {ethers } from 'ethers';
import {Team} from './TeamLocal';
import {Factory} from './FactoryLocal';
// initialize notify
const CHILD_ABI = Team.abi;
const CONTRACT_ABI = Factory.abi;
const CONTRACT_ADDRESS = Factory.networks["5777"].address;
const {ethereum } = window;

function useInput({ type /*...*/ }) {
	const [value, setValue] = useState("");
	const input = <input value={value} onChange={e => setValue(e.target.value)} type={type} />;
	return [value, input];
};

function App() {
	const [contractWalletAddress, setContractWalletAddress] = useState(CONTRACT_ADDRESS);
	const [contractOwner, setContractOwner] = useState();
	const [account, setAccount] = useState();
	const [amount, amountInput] = useInput({ type: "text" });	
	const [walletBalance, setWalletBalance] = useState(0);
	const [count, setCount] = useState(0);
	const [balance, setBalance] = useState();
	const [contract, setContract] = useState();
	const [provider, setProvider] = useState();
	const [child, setChild] = useState({address:false,balance:0});
	const [childCount, setChildCount] = useState();
	const [signer, setSigner] = useState();
	const [time, setTime] = useState(new Date().toString());
	const [ctr, setCtr] = useState(0);

	const updateBalanceClicked = async (evt) => {
		evt.preventDefault();
		updateBalances();
	};

	const pay = async function(){
		const tx = {
			from: account,
			to: child.address,
			value: ethers.utils.parseEther(amount)
			/*
			nonce: window.ethersProvider.getTransactionCount(send_account, "latest"),
			gasLimit: ethers.utils.hexlify(gas_limit), // 100000
			gasPrice: gas_price,*/
		  };
		  signer.sendTransaction(tx).then((transaction) => {
			console.dir('sent:', transaction);
			alert("Send finished!");
			updateBalances();
		  });
	};
	const updateBalances = async function(){
		if(child.address){
			var _childBalance = await provider.getBalance(child.address);
			// we use the code below to convert the balance from wei to eth
			setChild({address:child.address, balance:ethers.utils.formatEther(_childBalance)});
		}
	};
	
	const distribute = async function(){
		if(child.address){
			const _childContract = new ethers.Contract(child.address, CHILD_ABI, signer);
			var _childOwner = await _childContract.getOwner();
			console.log('child owner is ', _childOwner);			
			_childContract.on("DebugFromToValue", async (_childAddr, _owner, amount, event) => {
				if(_owner == account){
					console.log('createChild from:', _childAddr, ' _owner:', _owner,'amount:', amount, ' ev:',event, '\n args:',arguments);
					setCtr(ctr+1);
				}else{
					console.log('got another DebugFromToValue', event);
				}
				updateBalances();
			});
			var sent = await _childContract.distribute();
			console.log('child dsitributed:', sent);
		}

	};

	const deploy = async (evt) => {
		evt.preventDefault();
		
		var _nicks = ['@0xBosky','@elonmusk','@michaelbolton'], 
		_addresses = [
			"0x8B097df22F1466f08Ed5795879b91c0F1f4B851c", 
			"0xDaec1333DEF50067A39973bD39b98a622A198056",
			"0x2095A8A7bc75c5Cb2C8e2bBDe838d4A7882B8576"
		],	
		 _avatars = ["🐑","💕",":)"],
		 _shares = [33,33,33];
		
		const child = await contract.createTeam("Team Mars", _nicks, _avatars, _addresses, _shares).catch ( er => console.log('child er:',er));
      	console.log('child is ', child);

		var filter = {
			address: contractWalletAddress
		}
		provider.on(filter, (x) => {
			console.log('event:',x);
			// do whatever you want here
			// I'm pretty sure this returns a promise, so don't forget to resolve it
		});

		contract.on("TeamCreated", async (_child, _owner, event) => {
			if(_owner == account){
				console.log('createChild from:', _child, ' _owner:', _owner,' ev:',event, '\n args:',arguments);
				var _childBalance = await provider.getBalance(_child);
				setChild({address:_child, balance: ethers.utils.formatEther(_childBalance)});
				setCtr(ctr+1);

				const _childContract = new ethers.Contract(_child, CHILD_ABI, signer);
				//var _childOwner = await _childContract.getOwner();
				//console.log('child owner is ', _childOwner);
			}else{
				console.log('got another TeamCreated', _child, _owner, event);
			}
		});
	};

	useEffect(async () => {
		if(contract){
			var _childCount = await contract.getCount();
			setChildCount(_childCount.toNumber());
		}
		if(account){
			var _walletBalance = await provider.getBalance(account);
			// we use the code below to convert the balance from wei to eth
			setWalletBalance(ethers.utils.formatEther(_walletBalance));
		}
		if(child.address){
			updateBalances();
		}
		setTime(new Date().toString());
	},[ctr]);

	useEffect(() => {
		if(typeof ethereum == "undefined"){
			console.log('please install a crypto wallet');
			return;
		}
	
		async function load() {
			console.log('into load');
			const _provider = new ethers.providers.Web3Provider(ethereum);
			setProvider(_provider);
			const ethAccounts = await ethereum.request({method:'eth_requestAccounts'});
			console.log('got ethAccounts', ethAccounts);
			const _signer = _provider.getSigner();
			await setSigner(_signer);
			var userAddress = await _signer.getAddress();
			setAccount(userAddress);

			const _contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, _signer);
			setContract(_contract);
	
			setCtr(ctr+1);
		}
		load();
		console.log('load called');
	}, []);

  return (
    <div style={{margin:'100px', lineHeight:'20px' }}>
		<h1> factoryTeam </h1> {time}
    	<p>
			Your account is: 
			<br></br><code>{account}</code> with Balance {walletBalance}
		</p>
		<p>
			Contract address 
			<br></br><code>{contractWalletAddress}</code> with children {childCount} and balance {balance}
			<br></br>
			Contract owner
			<br></br><code>{contractOwner}</code>
		</p>
		<p>Deploy Child
			<button onClick={deploy} >Deploy Child</button> {count}
		</p>
		{child.address  && <p>
			Child contract 
			<br></br>{child.address} with balance {child.balance} 
			<br></br>Amount {amountInput}  {amount}
			<br></br><button onClick={pay}>Pay</button>
			<br></br><button onClick={distribute}>Withdraw</button>
		</p>}
		<p>
			<button onClick={updateBalanceClicked}>Update Balances</button>
		</p>

    </div>
  );
}

export default App;
