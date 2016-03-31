var initialized, accounts, newAccount, provider, tokenContract, instance, result
var toLoad = [
    "../js/UI/CircularJson.js",
    "../js/Models/Persistance/pouchdb-3.4.0.min.js",
    "../js/Models/Persistance/pouchdb.localstorage.js",
    "../js/Models/Persistance/pouchdb.transform-pouch.js",
    "../js/Models/Persistance/pouchdb.find.js",
    "../js/Models/Persistance/pouchdb.upsert.js",
    "../js/Models/Persistance/pouch-crypto.js",
    "../js/Models/Persistance/store.pouchdb.js",
    "../js/UI/qrcode.js",
    "../js/Models/AppModel.js",
    "../js/Models/ChatTip.js",
    "../js/Models/Peer.js",
    "../js/Models/Me.js",
    "../js/Models/Identity.js",
    "../js/Models/Vault.js",
    "../js/Crypto/crypto-min.js",
    "../js/Crypto/crypto-sha256.js",
    "../js/Crypto/crypto-sha256-hmac.js",
    "../js/Crypto/ripemd160.js",
    "../js/Crypto/aes.js",
    "../js/Crypto/ellipticcurve.js",
    "../js/Crypto/Bitcore/bitcore.min.js",
    "../js/Crypto/Bitcore/bitcore-mnemonic.js",
    "../js/Crypto/Bitcore/bitcore-ecies.min.js",
    "../js/Crypto/Bitcore/bitcore-message.js",
    "../js/Crypto/Bitcore/bitcore-p2p.js",
    "../js/Crypto/Bitcore/bitcore-explorers-multi.js",
    "../js/Crypto/Ethereum/ethereumjs-tx.js"]/*,
    "../js/Crypto/Ethereum/web3.js",
    "../js/Crypto/Ethereum/ethereumjs-accounts.js",
    "../js/Crypto/Ethereum/ethereumjs-tx.js",
    "../js/Crypto/Ethereum/walletimport.js"]*/
    
head.load(toLoad, function() {
    // Call a function when done
    console.log("Done loading js")
    checkLogin()
    if (typeof angular === 'undefined') {
        return init()
    }    
    initbasic()
})


function initbasic() {
    initialized = true
    console.log("Gulp watch-relaunch-again")
    setProvider()
    try {
        accounts = new Accounts({ minPassphraseLength: 6 });
        if (typeof angular !== 'undefined') {
            console.log("Logging In")
            //try {
            //    send("Login", {topic: "Logged In", payload: accounts.get().selected})
            //    $("p:contains('Wallet')").click()
            //} catch(e){
                dispatch({type: "toast", topic: "Logged In", payload: accounts.get().selected})
                $("p:contains('Wallet')").click()
            //}
            
        }
    } catch (e) {
        setTimeout(function() {
            send("Login", {topic: "Logged In", payload: accounts.get().selected})
            //return initbasic()
        }, 500)
    }
}

function getSelectedAccount(){
    var myAccount = accounts.get(accounts.get().selected)
    return myAccount;
}

function setProvider(){
    setTimeout(function() {
        provider = new HookedWeb3Provider({
            host: "http://localhost:1880/web3Proxy",
            transaction_signer: accounts
        });
        web3.setProvider(provider);
        this.transaction_signer = accounts
        accounts.log = function(msg) {
            console.log(msg)
        }
    }, 2000)
}

function checkLogin(){
    setTimeout(function(){
        if (!accounts) {
            $("p:contains('Home')").click()
        }
    },500)
}

var CircularJSON = window.CircularJSON
var debug = getQueryParams(document.location.search).debug
var verbose = true
oldconsole = window.console
function customLog(msg) {
    oldconsole.log("Hooked "+msg)
    msg = "<br>----------------<br>" + msg
    
    $(".log").html($(".log").html() + "\r\n"+msg)
}
if (debug) {
    window.console = {
        log: function(msg) { customLog(CircularJSON.stringify(msg)) },
        info: function(msg) { customLog(CircularJSON.stringify(msg)) },
        warn: function(msg) { customLog(CircularJSON.stringify(msg)) }
    }
    window.onerror = function(errorMsg, url, lineNumber){
        console.log("Error: "+ errorMsg + " \r\nScript:  "+ url + "\r\nLine: "+lineNumber)
    }
    var cmd = getQueryParams(document.location.search).eval
    if (cmd)
        eval(cmd)
}
function init(){
    initialized = true
    try {
            accounts = new Accounts({minPassphraseLength: 6});
            if (typeof angular !== 'undefined') {
                setTimeout(function(){
                    $("p:contains('Wallet')").click()
            },200)
        }
    } catch(e){
        setTimeout(function(){
            console.log("Account not loaded yet, retrying in 500ms")
            return init()
        },500)
    }
    foundIdentity = []
    bitcore = require('bitcore')
    Mnemonic = require('bitcore-mnemonic');
    ECIES = require('bitcore-ecies')
    explorers = require('bitcore-explorers-multi')
    bitcore.Networks.AvailableNetworks.set("ethereum")
    var insight = bitcore.Networks.AvailableNetworks.currentNetwork().insight
    //console.log(CircularJSON.stringify(me))
    
    //Lookup Identity      
    isReady(function(){
        lookupIdentity()
    })
}
function isReady(cb){
    console.log(me.data.privkey)
    console.log("Ready: "+me.data.privkey.table.taskqueue.isReady)
    if (me.data.privkey.table.taskqueue.isReady) {
        return cb()
    } else {
        console.log("waiting...")
        setTimeout(function(){
            return isReady(cb)
        },500)
    }
}
    
function lookupIdentity(){
    console.log(foundIdentity)
    newtables.privkey.allRecordsArray(function (rows) {
        if (rows) {
            $.each(rows, function () {
                var record = $(this)[0]
                if (!record.isIdentity) {
                    record.address = record.key.address
                    foundIdentity.push(record)
                }
            })                              
        }         
        createIdentityIfNew(function(identity){
            console.log("sending")
            send("Login", {topic: "Logged In", payload: identity.address || identity.key.address})
            //$(".out").html(identity.address || identity.key.address)
        })
    })
    //console.log("issue")
}

function createIdentityIfNew(cb){
    if (foundIdentity.length < 1) { 
        me.password = generatePassword()            
        newtables.privkey.newIdentity("Identity",function(out) {
            newtables.privkey.allRecordsArray(function (rows) {
                $.each(rows, function () {
                    var record = $(this)[0]
                    if (record.isIdentity) {
                        foundIdentity.push(record.key)
                        newtables.privkey.newHD("EthIdentity", function(record) {
                            foundIdentity = []
                            newtables.privkey.allRecordsArray(function (rows) {
                                $.each(rows, function () {
                                    var record = $(this)[0]
                                    if (!record.isIdentity) {
                                        $(this)[0].isIdentity = true
                                        foundIdentity.push(record.key)
                                        console.log(record)
                                        getMyMnemonic(me.password,function(mnemonic){
                                            generateQr(mnemonic+"|"+me.password)
                                        })
                                        return cb(record)
                                    } else {
                                        //return cb(null)
                                    }
                                })
                            })
                        })
                    }
                })
            })
        })
    } else {
        return cb(foundIdentity[0])
    }
}
function generatePassword(){
    var randomstring = Math.random().toString(36).slice(-8)
    return randomstring
}
function getQueryParams(qs) {
    qs = qs.split('+').join(' ')
    var params = {}, tokens, re = /[?&]?([^=]+)=([^&]*)/g
    while (tokens = re.exec(qs)) {
        params[decodeURIComponent(tokens[1])] = decodeURIComponent(tokens[2])
    }
    return params;
}

/*function send(name, payload){
    if (typeof angular !== 'undefined') {
        console.log("SEND", payload)
        if (typeof payload !== 'object') {
            payload = {payload: payload}
        }
        var msgPort = angular.element(panel(name,"Default").find("port")).scope()
        if (msgPort.send !== undefined) {
            msgPort.send(payload)
        }
    } else {
        console.log(payload)
        $(".out").append(payload.payload)
    }
}*/

function dispatch(payload) {
    if (typeof payload !== 'object') {
            payload = {payload: payload}
        }
    var send = $(".msgPort").scope().send
    if (send) {
        send(payload)
    }
}

function panel(name, orname) {
    if (typeof angular !== 'undefined') {
        if (angular.element($("[panel='"+name+"']")).length > 0) {
            return angular.element($("[panel='"+name+"']").parent())
        } 
        if(angular.element($("[panel='"+orname+"']")).length > 0) {
            return angular.element($("[panel='"+orname+"']").parent())
        }
        var panel = angular.element($("md-card-content").find("h2:contains('"+name+"')").parent())
        if (panel.length > 0) {
            return angular.element($("md-card-content").find("h2:contains('"+name+"')").parent())
        }
        return angular.element($("md-card-content").find("h2:contains('"+orname+"')").parent())
    } else {
        return null
    }
}