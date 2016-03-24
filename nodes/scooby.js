/**
 * Copyright 2015 Adrian Lansdown
 * Not created by, affiliated with, or supported by Slack Technologies, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 **/
var web3, RAppAccount, RAppID
module.exports = function(RED) {
    "use strict";

    var request = require('request');
    var slackBotGlobal = {};
    var connecting = false;
    RAppID = "0xac19dcdafbd2396339d2b4ae961ae212db2831cf"
    
    var Web3 = require("web3")
    if(web3 !== undefined)
        web3 = new Web3(web3.currentProvider);
    else {
        web3 = new Web3(new Web3.providers.HttpProvider("http://162.243.248.133:8545"))
    }
    //var HookedWeb3Provider = require("hooked-web3-provider")
    /*var provider = new HookedWeb3Provider({
        host: "http://162.243.248.133:8545",
        transaction_signer: /*{ 
            // Can be any object that implements the following methods:
            hasAddress: function(address, callback) {
                
            },
            signTransaction: function(tx_params, callback) {
                
            }
        }*/
     //   web3.currentProvider
    //})*/
    //web3.setProvider(web3.currentProvider)
    
    RAppAccount = web3.eth.accounts[0] 
    var tokenContract = web3.eth.contract([{"constant":true,"inputs":[],"name":"name","outputs":[{"name":"","type":"bytes32"}],"type":"function"},{"constant":false,"inputs":[{"name":"_spender","type":"address"},{"name":"_value","type":"uint256"}],"name":"approve","outputs":[{"name":"success","type":"bool"}],"type":"function"},{"constant":true,"inputs":[],"name":"totalSupply","outputs":[{"name":"","type":"uint256"}],"type":"function"},{"constant":false,"inputs":[{"name":"_from","type":"address"},{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transferFrom","outputs":[{"name":"success","type":"bool"}],"type":"function"},{"constant":true,"inputs":[],"name":"decimals","outputs":[{"name":"","type":"uint256"}],"type":"function"},{"constant":false,"inputs":[{"name":"_owner","type":"address"},{"name":"_amount","type":"uint256"}],"name":"mint","outputs":[],"type":"function"},{"constant":false,"inputs":[{"name":"_s","type":"bytes32"}],"name":"setSymbol","outputs":[],"type":"function"},{"constant":false,"inputs":[{"name":"_n","type":"bytes32"}],"name":"setName","outputs":[],"type":"function"},{"constant":true,"inputs":[{"name":"_owner","type":"address"}],"name":"balanceOf","outputs":[{"name":"balance","type":"uint256"}],"type":"function"},{"constant":false,"inputs":[{"name":"_d","type":"uint256"}],"name":"setDecimals","outputs":[],"type":"function"},{"constant":false,"inputs":[{"name":"_from","type":"address"},{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"tranferFrom","outputs":[{"name":"success","type":"bool"}],"type":"function"},{"constant":true,"inputs":[],"name":"symbol","outputs":[{"name":"","type":"bytes32"}],"type":"function"},{"constant":false,"inputs":[{"name":"_to","type":"address"},{"name":"_value","type":"uint256"}],"name":"transfer","outputs":[{"name":"success","type":"bool"}],"type":"function"},{"constant":true,"inputs":[{"name":"_owner","type":"address"},{"name":"_spender","type":"address"}],"name":"allowance","outputs":[{"name":"remaining","type":"uint256"}],"type":"function"},{"constant":false,"inputs":[{"name":"_new_owner","type":"address"}],"name":"transferOwnership","outputs":[],"type":"function"},{"constant":false,"inputs":[{"name":"_spender","type":"address"}],"name":"unapprove","outputs":[{"name":"success","type":"bool"}],"type":"function"},{"inputs":[],"type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"name":"_owner","type":"address"}],"name":"TokenCreated","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"_owner","type":"address"},{"indexed":false,"name":"_amount","type":"uint256"}],"name":"TokenMinted","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"_from","type":"address"},{"indexed":true,"name":"_to","type":"address"}],"name":"OwnershipTransfer","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"_from","type":"address"},{"indexed":true,"name":"_to","type":"address"},{"indexed":false,"name":"_value","type":"uint256"}],"name":"Transfer","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"_owner","type":"address"},{"indexed":true,"name":"_spender","type":"address"},{"indexed":false,"name":"_value","type":"uint256"}],"name":"Approved","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"_owner","type":"address"},{"indexed":true,"name":"_spender","type":"address"}],"name":"Unapproved","type":"event"}]);
    function makeContractTemplate(iface) {
        return web3.eth.contract(JSON.parse(iface))
    }
    var tokens = []
    
    var subscriptions = []
    var subscriptionContains = function(target, filter){
        var needle = subscriptions.filter(function(subscription){
            return subscription[target] === filter
        })
        return needle.length > 0
    }
    
    function subscribeByHash(node, msg){
        if (node.interface) {
            tokenContract = makeContractTemplate(node.interface.interface)
        }
        return getTokenContract(msg.contractHash || node.contractHash, tokenContract, function(contractInstance) {
            //console.log("Subscribing", msg)
            var needle = subscriptions.filter(function(subscription){
                        return subscription.contract === msg.contractHash || node.contractHash
                    })
                    if (needle.length < 1) {
                        eventSubscribe(contractInstance, function(event) {
                            if (event.requestManager) {
                                //console.log("event subscribed", event, typeof event)
                                    
                                    subscriptions.push({contract: msg.contractHash || node.contractHash})
                                    msg.subscriptions = subscriptions
                                            
                            }
                            //msg.payload = "Get Balance"
                            //msg.type = "balance"
                            msg.payload = event
                            //console.log("received event", msg)
                            node.send(msg)
                        })
                    }
        })
    }
    
    function historyByHash(node, msg){
        if (node.interface) {
            tokenContract = makeContractTemplate(node.interface.interface)
        }
        return getTokenContract(msg.contractHash || node.contractHash, tokenContract, function(contractInstance) {
            eventHistory(contractInstance, function(event) {
                msg.payload = event
                node.send(msg)
            })
        })
    }
    
    function balanceByHash(node, msg) {
        if (node.interface) {
            tokenContract = makeContractTemplate(node.interface.interface)
        }
         return getTokenContract(node.contractHash || msg.contractHash, tokenContract, function(contractInstance) {
             getBalance(contractInstance, node.agentAddress || msg.agentAddress || msg.payload, function(balance){
                msg.payload = balance
                node.send(msg)
            })
        })
    }
    
    function mintByHash(node, msg) {
        if (node.interface) {
            tokenContract = makeContractTemplate(node.interface.interface)
        }
         return getTokenContract(node.contractHash || msg.contractHash, tokenContract, function(contractInstance) {
             mintReward(contractInstance, node.agentAddress || msg.agentAddress || msg.payload, node.amount || msg.amount || msg.payload, function(err, balance){
                
                msg.payload = balance
                msg.err = err
                node.send(msg)
            })
        })
    }
    
    function saveSubscriptionLocally(msg, event, node){
        if (!msg) {msg = {subscriptions: []}}
        if (!msg.subscriptions){msg.subscriptions = []}
        msg.payload = event
        var newSubscriber = {contract: msg.contractHash || node.contractHash}                
        subscriptions.push(newSubscriber)
        msg.subscriptions.push(newSubscriber)
        return msg
    }
    
    /* SUBSCRIBE TO EVENTS */
    function subscribe(n) {
        this.contractHash = n.contractHash
        this.interface = RED.nodes.getNode(n.interface)
        var contractHash
        RED.nodes.createNode(this,n)
        var node = this
        this.on('input', function (msg) {
            msg.subscriptions = subscriptions
            if (!msg.payload.event && (msg.contractHash || node.contractHash)) {
                contractHash = (msg.contractHash || node.contractHash)
                //console.log("peek into subscribe", msg)
                if (!subscriptionContains(contractHash, {contract: contractHash})) {
                    subscribeByHash(node, msg)
                }
            }
        })
    }
    RED.nodes.registerType("Scooby Subscribe",subscribe)
    
    /* HISTORICAL EVENTS */
    function history(n) {
        this.contractHash = n.contractHash;
        this.interface = RED.nodes.getNode(n.interface)
        var contractHash        
        RED.nodes.createNode(this,n)
        var node = this
        this.on('input', function (msg) {          
            historyByHash(node, msg)
        })        
    }
    RED.nodes.registerType("Scooby History",history)
    
    /* BALANCE */
    function balance(n) {
        this.contractHash = n.contractHash
        this.agentAddress = n.agentAddress
        this.interface = RED.nodes.getNode(n.interface)
        RED.nodes.createNode(this,n)
        var node = this
        this.on('input', function (msg) {
            node.send(msg)        
            balanceByHash(node, msg)
        })        
    }
    RED.nodes.registerType("Scooby Balance",balance)
    
     /* MINT */
    function mint(n) {
        this.contractHash = n.contractHash
        this.agentAddress = n.agentAddress
        this.interface = RED.nodes.getNode(n.interface)
        this.amount = n.amount
        web3.setProvider(new Web3.providers.HttpProvider(RED.nodes.getNode(n.interface).rpc))
        console.log(RED.nodes.getNode(n.interface).rpc)
        RED.nodes.createNode(this,n)
        var node = this
        this.on('input', function (msg) {
            //console.log("Mint!", msg)
            node.send(msg)        
            mintByHash(node, msg)
        })        
    }
    RED.nodes.registerType("Scooby Mint",mint)
    
     /* DB In */
    function dbin(n) {
        this.key = n.key
        this.db = n.db
        this.agentAddress = n.agentAddress
        //web3.setProvider(new Web3.providers.HttpProvider(RED.nodes.getNode(n.interface).rpc))
        //console.log(RED.nodes.getNode(n.interface).rpc)
        RED.nodes.createNode(this,n)
        var node = this
        this.on('input', function (msg) {
            console.log("PUT",msg)
            var result = web3.db.putString(msg.db || this.db, msg.key || this.key , JSON.stringify(msg.payload))
            if (result) {
                result = web3.db.getString(msg.db || this.db, msg.key || this.key)
                msg.payload = JSON.parse(result)
            } else {
                msg.error = true
                msg.payload = "Not Found"
            }              
            node.send(msg)          
        })        
    }
    RED.nodes.registerType("Scooby DB Put", dbin)
    
    /* DB Out */
    function dbout(n) {
        this.key = n.key
        this.db = n.db
        this.agentAddress = n.agentAddress
        //web3.setProvider(new Web3.providers.HttpProvider(RED.nodes.getNode(n.interface).rpc))
        //console.log(RED.nodes.getNode(n.interface).rpc)
        RED.nodes.createNode(this, n)
        var node = this
        var result
        this.on('input', function(msg) {
            try {
                //console.log("Requesting", n, msg)
                result = web3.db.getString(msg.db || this.db, msg.key || this.key)
                msg.payload = JSON.parse(result)
                msg.error = false
            } catch(e){
                //console.log("result", result, e)
                msg.errorMsg = e.toString()
                msg.error = true
            }
            node.send(msg)
        })
    }
    RED.nodes.registerType("Scooby DB Get", dbout)
    
    /* CONFIG */   
    function IFace(n) {
        RED.nodes.createNode(this,n);
        this.name = n.name;
        this.interface = n.interface;
        this.rpc = n.rpc;
    }
    RED.nodes.registerType("Interface",IFace);
    
}

function eventSubscribe(contractInstance, cb){
    //console.log("starting subscribe")
	var events = contractInstance.allEvents({fromBlock: 'latest'})
    events.watch(function(error, result){
                    console.log("result", result)
                  return cb(result)     
        })
}

function eventHistory(contractInstance, cb){
	var events = contractInstance.allEvents({fromBlock: 0, toBlock: 'latest'})    
    events.get(function(error, logs){
        //console.log("history", logs)
        return cb(logs)
    })
}

function newTokenContract(account, tokenContract ,cb){
	tokenContract.new({
			from: account, 
			data: '60606040525b5b33600060006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908302179055505b33600060006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908302179055506000600160005081905550600060009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff167f2e2b3f61b70d2d131b2a807371103cc98d51adcaa5e9a8f9c32658ad8426e74e60405180905060405180910390a25b610d42806100df6000396000f3606060405236156100e2576000357c01000000000000000000000000000000000000000000000000000000009004806306fdde03146100e4578063095ea7b31461010757806318160ddd1461013c57806323b872dd1461015f578063313ce5671461019d57806340c10f19146101c057806349e65440146101e15780635ac801fe146101f957806370a08231146102115780638c8885c81461023d5780639264a1691461025557806395d89b4114610293578063a9059cbb146102b6578063dd62ed3e146102eb578063f2fde38b14610320578063fbf1f78a14610338576100e2565b005b6100f16004805050610aae565b6040518082815260200191505060405180910390f35b6101266004808035906020019091908035906020019091905050610908565b6040518082815260200191505060405180910390f35b6101496004805050610ac0565b6040518082815260200191505060405180910390f35b61018760048080359060200190919080359060200190919080359060200190919050506106fc565b6040518082815260200191505060405180910390f35b6101aa60048050506105b3565b6040518082815260200191505060405180910390f35b6101df6004808035906020019091908035906020019091905050610c45565b005b6101f76004808035906020019091905050610b9d565b005b61020f6004808035906020019091905050610b33565b005b6102276004808035906020019091905050610c07565b6040518082815260200191505060405180910390f35b6102536004808035906020019091905050610ac9565b005b61027d6004808035906020019091908035906020019091908035906020019091905050610364565b6040518082815260200191505060405180910390f35b6102a06004805050610ab7565b6040518082815260200191505060405180910390f35b6102d560048080359060200190919080359060200190919050506105bc565b6040518082815260200191505060405180910390f35b61030a600480803590602001909190803590602001909190505061047e565b6040518082815260200191505060405180910390f35b610336600480803590602001909190505061036e565b005b61034e60048080359060200190919050506104e7565b6040518082815260200191505060405180910390f35b60005b9392505050565b6000600060009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff161415156103cc57610002565b600060009054906101000a900473ffffffffffffffffffffffffffffffffffffffff16905081600060006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908302179055508173ffffffffffffffffffffffffffffffffffffffff168173ffffffffffffffffffffffffffffffffffffffff167f22500af037c600dd7b720644ab6e358635085601d9ac508ad83eb2d6b2d729ca60405180905060405180910390a35b5050565b6000600460005060008473ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060005060008373ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000206000505490506104e1565b92915050565b60006000600460005060003373ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060005060008473ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020600050819055508173ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff167f1ab270601cc6b54dd5e8ce5c70dbac96a01ff12939e4e76488df62adc8e6837360405180905060405180910390a3600190506105ae565b919050565b60026000505481565b600081600360005060003373ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060005054101580156105fd5750600082115b156106ec5781600360005060003373ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008282825054039250508190555081600360005060008573ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000206000828282505401925050819055508273ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff167fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef846040518082815260200191505060405180910390a3600190506106f6566106f5565b600090506106f6565b5b92915050565b600081600360005060008673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000206000505410158015610796575081600460005060008673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060005060003373ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000206000505410155b80156107a25750600082115b156108f75781600360005060008673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008282825054039250508190555081600360005060008573ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060008282825054019250508190555081600460005060008673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060005060003373ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000206000828282505403925050819055508273ffffffffffffffffffffffffffffffffffffffff168473ffffffffffffffffffffffffffffffffffffffff167fddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef846040518082815260200191505060405180910390a36001905061090156610900565b60009050610901565b5b9392505050565b6000600460005060003373ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060005060008473ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000206000505482600460005060003373ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060005060008673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060005054011115610a9e5781600460005060003373ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002060005060008573ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000206000828282505401925050819055508273ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff167f80da462ebfbe41cfc9bc015e7a9a3c7a2a73dbccede72d8ceb583606c27f8f90846040518082815260200191505060405180910390a360019050610aa856610aa7565b60009050610aa8565b5b92915050565b60056000505481565b60066000505481565b60016000505481565b600060009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff16141515610b2557610002565b806002600050819055505b50565b600060009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff16141515610b8f57610002565b806005600050819055505b50565b600060009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff16141515610bf957610002565b806006600050819055505b50565b6000600360005060008373ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020600050549050610c40565b919050565b600060009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff16141515610ca157610002565b80600160008282825054019250508190555080600360005060008473ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000206000828282505401925050819055508173ffffffffffffffffffffffffffffffffffffffff167fb9144c96c86541f6fa89c9f2f02495cccf4b08cd6643e26d34ee00aa586558a8826040518082815260200191505060405180910390a25b505056', 
			gas: 3000000
		}, function(e, contract){
			if (contract.mint !== undefined) {
				return cb(contract)
			}
		})
}

function getTokenContract(contractLocation, tokenContract, cb){
	return cb(tokenContract.at(contractLocation))
}

function getBalance(contractInstance, account, cb){
	return cb(contractInstance.balanceOf(RAppAccount))
}

function mintReward(contractInstance, account, amount, cb){
	contractInstance.mint.sendTransaction(account, Number(amount), {from:account, gas: 3000000}, function(err, result){
        console.log("err", err, "result", result)
        return cb(err, JSON.stringify(result))
    })
}
