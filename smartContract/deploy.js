"use strict";

let url = "http://127.0.0.1:8685";
let chainId = 100;
let contractPath = "/media/trydex/Мультимедиа/Рабочий стол/Nebulas/!MyProjects/cryptofunding/smartContract/projectContract.js";
let accountAdress = "n1H4MYms9F55ehcvygwWE71J8tJC4CRr2so";
let accountPassphrase = "passphrase";
let refreshInterval = 15000;

var Nebulas = require("nebulas");
var Neb = Nebulas.Neb;
var Account = Nebulas.Account;
var Transaction = Nebulas.Transaction;
var neb = new Neb();
var api = neb.api;
var admin = neb.admin;
var FS = require("fs");
var from = accountAdress;

neb.setRequest(new Nebulas.HttpRequest(url));

deployContract(contractPath);

function deployContract(filepath) {
    let nonce;   
    let value = 0;
    let gasPrice = 1000000;
    let gasLimit = 2000000;
    let contractSource = FS.readFileSync(filepath, "utf-8");

    let contract = {
        "source": contractSource,
        "sourceType": "js",
        "args": ""
    };

    api.getAccountState(from).then(function (state) {
        //get nonce
        nonce = state.nonce;

        //get gasLimit
        api.estimateGas({
            chainID: chainId,
            from: from,
            to: from,
            value: value,
            nonce: nonce,
            gasPrice: gasPrice,
            gasLimit: gasLimit
        }).then(function(gas) {
            admin.sendTransactionWithPassphrase({
                from: from,
                to: from,
                value: value,
                nonce: parseInt(nonce) + 1,
                gasPrice: gasPrice,
                gasLimit: gasLimit,
                passphrase: accountPassphrase,
                contract: contract
             }).then(function(tx) {
                console.log(tx);
                let interval = setInterval(function() {
                    api.getTransactionReceipt({hash: tx.txhash}).then(function(receipt) {
                        let curDate = new Date;
                        console.log("\r\n--------------------------------------------------------");
                        console.log("Время: " + curDate.getHours() + ":" +  curDate.getMinutes() + ":" + curDate.getSeconds());
                        console.log("--------------------------------------------------------\r\n");
                        console.log(receipt);
                        if(!receipt || receipt.status !== 2) {
                            let s = receipt.status == 1 ? "DEPLOYED" : "FAILED";
                            console.log("\r\n CONTRACT " + s + "!");
                            clearInterval(interval);
                        };
                    }).catch(function (err) {
                        console.log(err);
                        clearInterval(interval);
                    });                        
                }, refreshInterval);                
             });
             
        });
    }).catch(function (err) {
        console.log(err);
    });    
}


