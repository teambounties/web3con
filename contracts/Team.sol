// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

struct Member{
	string _nick;
	string _avatar;
	address _address;
	uint8 _share;
}

contract Team {
	bool private initialized;
	uint8 private _count;
	Member[] members;
	string[] nicks;
	address payable[] addresses;
	event Debug(string msg);
	event DebugValue(string msg, uint);
	event DebugMember(string, string, address payable, uint);
	event DebugFromToValue(string, address, address, uint);
	event ReceivedFromToValue(address, address, uint);
    
	modifier isInitialized {
	  require(initialized, "Contract instance has already been initialized");
	  _;
	}

	modifier hasTeam(uint i) {
	  require(members.length>0, "No team yet");
	  require(i<members.length, "No such member");
	  _;
	}

	constructor (string[] memory _nicks, string[] memory _avatars, address payable[] memory _addresses, uint8[] memory _shares) {
	 	//require(!initialized, "Contract instance has already been initialized");
        initialized = true;
		emit Debug("initialize ok");
		for(uint i = 0; i< _addresses.length;i++){
			emit DebugMember(_nicks[i], _avatars[i], _addresses[i], _shares[i]);
			members.push(Member(_nicks[i], _avatars[i], _addresses[i], _shares[i]));
		}
	}

	function getCount() view public returns (uint){
		return members.length;
	}

	function getBalance() view public returns (uint256 _balance){
		return address(this).balance;
	}

	function getMember(uint i) view public isInitialized hasTeam(i) returns (string memory, string memory, address, uint8) {
		Member storage member = members[i];
		return (member._nick, member._avatar, member._address, member._share);
	}

	receive () external payable {
		emit ReceivedFromToValue(msg.sender, address(this), msg.value);
	}
	/*
	function distribute() external payable {
		uint balance = address(this).balance;
		if (balance > 0) {
			emit DebugValue("had balance ", address(this).balance);
			emit DebugValue("now got ", msg.value);
			// msg.value - received ethers
			uint donation = balance * 1/100;
			emit DebugFromToValue("Sent 1%", address(this), UKRAINE, donation);
			bool sent1 = UKRAINE.send(donation);
			require(sent1, "Failed to send to owner");
			uint majority = address(this).balance;
			// address(this).balance - contract balance after transaction to MY_ADDRESS (half of received ethers)  
			emit DebugFromToValue("Send 99%", address(this), owner, majority);
			bool sent2 = owner.send(majority);
			require(sent2, "Failed to send to ukraine");
		}else{
			emit DebugValue("asked to distribute 0? ", msg.value);
		}
	}
	*/	
	fallback () external payable { 
		emit Debug("fallback");
	}
	
}