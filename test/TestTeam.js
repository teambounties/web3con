//const tc = artifacts.require("Payable");
const Factory = artifacts.require("Factory");
const Team = artifacts.require("Team");
const sending = '0.000001';

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
        var _nicks = ['@0xBosky','@elonmusk'], 
            _addresses = [accounts[2], accounts[3]],
             _avatars = ["🐑","💕"],
             _shares = [50,50];
             
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
        assert.equal(getCount,2);

        var member1 = await _teamMars.getMember(0).catch(er => er);
        console.log('mars member1:', member1);
        assert.equal(member1['0'],'@0xBosky');

        var member2 = await _teamMars.getMember(1).catch(er => er);
        console.log('mars member2:', member2, typeof member2['0']);
        assert.equal(member2['0'],'@elonmusk');
    });


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
