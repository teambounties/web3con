//const tc = artifacts.require("Payable");
const Factory = artifacts.require("Factory");
const Team = artifacts.require("Team");
const sending = 1 * Math.pow(10,18); // 1

contract('TestTeam', async (accounts) => {

    let factory;

    before(async () => {
        // deploy stores contract address in build, new does not
        factory = await Factory.new();
    });

    it('there should exist no team first', async () => {
        var count = await factory.getCount();
        assert.equal(count,0);
    });

    it('getMember should fail without a team', async () => {
        var getTeam = await factory.getTeamAddress(0).catch(er => "");
        assert.equal(getTeam, "");
    });

    it('create a team', async () => {
        var _nicks = ['@0xBosky','@elonmusk','@michaelbolton'], 
            _addresses = [accounts[2], accounts[3],accounts[4]],
             _avatars = ["🐑","💕",":)"],
             _shares = [33,33,33];
             
        var team = await factory.createTeam("Team Mars", _nicks, _avatars, _addresses, _shares)
        .then(function(result) {
            var events = result.receipt.logs;
            console.log('got events:', events);
            assert.equal(events[0].event, 'TeamCreated');
            return result;
        })
        ;

        assert.exists(team.tx);
        assert.exists(team.receipt);
    });

    it('getTeamAddress should work with a team', async () => {
        var getTeam = await factory.getTeamAddress(0).catch(er => "");
        assert.equal(getTeam.substr(0,2),"0x");
    });

    it('getTeam should return a team of 2', async () => {
        var _addressMars = await factory.getTeam(0);
        assert.equal(_addressMars.substr(0,2),"0x");
        console.log('addressMars:',_addressMars);
        var _teamMars = await Team.at(_addressMars);
        var getCount = (await _teamMars.getCount().catch(er => 0)).toNumber();
        console.log('got team count of mars as ',getCount);
        assert.equal(getCount,3);

        var member1 = await _teamMars.getMember(0).catch(er => er);
        /**
         * Result {
            '0': '@0xBosky',
            '1': '🐑',
            '2': '0x9B210F7b629C939d5a26108724C763d59048c489',
            '3': BN {
                negative: 0,
                words: [ 50, <1 empty item> ],
                length: 1,
                red: null
            }
            }
         */
        assert.equal(member1['0'],'@0xBosky');

        var member2 = await _teamMars.getMember(1).catch(er => er);
        assert.equal(member2['0'],'@elonmusk');
    });

    it('deposit into team address', async () => {
        var _addressMars = await factory.getTeam(0);
        
        var contract_wei1 = await web3.eth.getBalance(_addressMars);
        var contract_ether1 = web3.utils.fromWei(contract_wei1, "ether");
      
        //console.log('sending ', sending);
        var sent = await web3.eth.sendTransaction({
            from: accounts[5], 
            to: _addressMars,
            value: sending
        });
        var contract_wei2 = await web3.eth.getBalance(_addressMars);
        var contract_ether2 = web3.utils.fromWei(contract_wei2, "ether");

        assert.equal(contract_ether1,0);
        assert.equal(contract_ether2,1);
    })

    it('distribute', async () => {
        var _addressMars = await factory.getTeam(0);
        var _teamMars = await Team.at(_addressMars);
        var contract_wei1 = await web3.eth.getBalance(_addressMars);
        var contract_ether1 = web3.utils.fromWei(contract_wei1, "ether");
      
        await _teamMars.distribute().then(result => {
            var events = result.receipt.logs;
            for(var i in events){
                //console.log(`event[${i}]:`, events[i].args);
            }
            return result;
        });
        
        var contract_wei2 = await web3.eth.getBalance(_addressMars);
        var contract_ether2 = web3.utils.fromWei(contract_wei2, "ether");
        //console.log('new balance after distribute in contract ', _addressMars,' is ', contract_ether2);

        assert.equal(contract_ether1,1);
        assert.equal(contract_ether2,0.01);
     
    });

    it('dust', async () => {
        var _addressMars = await factory.getTeam(0);
        var _teamMars = await Team.at(_addressMars);

        var contract_wei1 = await web3.eth.getBalance(factory.address);
        var contract_ether1 = web3.utils.fromWei(contract_wei1, "ether");
        //console.log('balance before dust in contract ', factory.address,' is ', contract_ether1);

        await _teamMars.dust().then(result => {
            var events = result.receipt.logs;
            for(var i in events){
                //console.log(`event[${i}]:`, events[i].args);
            }
            return result;
        });
        
        var contract_wei2 = await web3.eth.getBalance(_addressMars);
        var contract_ether2 = web3.utils.fromWei(contract_wei2, "ether");
        //console.log('new balance after dust in contract ', _addressMars,' is ', contract_ether2);

        var contract_wei3 = await web3.eth.getBalance(factory.address);
        var contract_ether3 = web3.utils.fromWei(contract_wei3, "ether");
        //console.log('new balance after dust in factory contract ', factory.address,' is ', contract_ether3);
        
        assert.equal(contract_ether1,0);
        assert.equal(contract_ether2,0);
        assert.equal(contract_ether3,0.01);

    })


    /*it('create a child ', async () => {
        var child = await factory.createChild(accounts[4]);
        console.log('child created', child);
        await getTransactionReceiptMined(child.txn);
        var mined = await web3.eth.getTransactionReceipt(child);
        console.log('mined is now', mined);
    })

    it('TestContract balance should starts with 0 ETH', async () => {
        let balance = await web3.eth.getBalance(factory.address);
        assert.equal(balance, 0);
    })

    it('TestContract balance should has 1 ETH after deposit', async () => {
        let sending_eth = web3.utils.toWei(sending, "ether");

        let balance_before_receive_wei = await web3.eth.getBalance(accounts[0]);
        let balance_before_receive_ether = web3.utils.fromWei(balance_before_receive_wei, "ether");
        console.log('new balance before receive in account[0]', accounts[0],' is ', balance_before_receive_ether);

        let contract_wei = await web3.eth.getBalance(factory.address);
        let contract_ether1 = web3.utils.fromWei(contract_wei, "ether");
        console.log('new balance before receive in contract ', factory.address,' is ', contract_ether1);

        var sent = await web3.eth.sendTransaction({
            from: accounts[0], 
            to: factory.address, 
            value: sending_eth
        });
        contract_wei = await web3.eth.getBalance(factory.address);
        contract_ether2 = web3.utils.fromWei(contract_wei, "ether");
        console.log('new balance after receive in contract ', factory.address,' is ', contract_ether2);
        
        assert.equal(parseFloat(contract_ether1,10)+parseFloat(sending,10), parseFloat(contract_ether2,10));

        let balance_after_receive_wei = await web3.eth.getBalance(accounts[0]);
        let balance_after_receive_ether = web3.utils.fromWei(balance_after_receive_wei, "ether");
        console.log('new balance after receive in account[0]', accounts[0],' is ', balance_after_receive_ether);
        //assert.equal(parseFloat(balance_before_receive_ether,10) - parseFloat(sending,10) < parseFloat(balance_after_receive_ether,10), true);
        return;
})

    it('TestContract balance should has 1 ETH after deposit', async () => {
        await factory.distribute();
        let balance_wei = await web3.eth.getBalance(factory.address);
        let balance_ether = web3.utils.fromWei(balance_wei, "ether");
        console.log('new balance post distribute is ', balance_ether)
        assert.equal(balance_ether, '0');

        let balance_after_receive_wei = await web3.eth.getBalance(accounts[0]);
        let balance_after_receive_ether = web3.utils.fromWei(balance_after_receive_wei, "ether");
        console.log('new balance after receive in account[0]', accounts[0],' is ', balance_after_receive_ether);
        return;
    })
    */
})
