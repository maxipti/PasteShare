const CONTRACT_ADDRESS = "n1wVG7L9Xtm4D8mYmS3McUMovuXquWroSs4"; //e84f43506cf8569d55f3068a5ef1d75f9710d74b15c8dc10c2e500432f1f4ac2

class SmartContractApi {
    constructor(contractAdress) {
        let Nebulas = require("nebulas");
        this.neb = new Nebulas.Neb();
        this.neb.setRequest(new Nebulas.HttpRequest("https://mainnet.nebulas.io"));

        let NebPay = require("nebpay");
        this.nebPay = new NebPay();
        this._contractAdress = contractAdress || CONTRACT_ADDRESS;
    }

    getContractAddress() {
        return this._contractAdress;
    }

    _simulateCall({
        value = "0",
        callArgs = "[]",
        callFunction,
        callback
    }) {
        this.nebPay.simulateCall(this._contractAdress, value, callFunction, callArgs, {
            callback: function (resp) {
                if (resp && resp.result && resp.result.startsWith('TypeError')) {
                    console.error(resp);
                }
                if (callback) {
                    callback(resp);
                }
            }
        });
    }

    _call({
        value = "0",
        callArgs = "[]",
        callFunction,
        callback,
        callbackError
    }) {
        let self = this;
        this.nebPay.call(this._contractAdress, value, callFunction, callArgs, {
            callback: resp => {
                if (resp) {
                    if (resp.result && resp.result.startsWith('TypeError')) {
                        console.error(resp);
                    }
                    if (resp == "Error: Transaction rejected by user") {
                        console.warn(resp);
                        if (callbackError) {
                            callbackError({
                                rejected: true
                            });
                        }
                        return;
                    }
                    self._waitTransaction(resp.txhash, callback, callbackError);
                }
            }
        });
    }

    _waitTransaction(txhash, callback, callbackError) {
        let self = this;
        this.neb.api.getTransactionReceipt({
            hash: txhash
        }).then(function it(receipt) {
            let status = receipt.status;
            if (status == 0) { // failed
                console.error(receipt);
                if (callbackError) {
                    callbackError(receipt);
                }
            }
            if (status == 1 && callback) { // successful
                callback(receipt);
            }
            if (status == 2) { // pending
                setTimeout(() => self.neb.api.getTransactionReceipt({
                    hash: txhash
                }).then(it), 1000);
                return;
            }
            return status;
        });
    }
}

class PasteContract extends SmartContractApi {
    createPaste(paste, cb, cbErr) {
        this._call({
            callArgs: JSON.stringify([JSON.stringify(paste)]),
            callFunction: "createPaste",
            callback: cb,
            callbackError: cbErr
        });
    }

    getByAlias(alias, cb) {
        this._simulateCall({
            callArgs: `["${alias}"]`,
            callFunction: "getByAlias",
            callback: cb
        });;
    }

    getLatestPublicPastes(count, cb) {
        this._simulateCall({
            callArgs: `[${count}]`,
            callFunction: "getLatestPublicPastes",
            callback: cb
        });;
    }

    getUserPastes(cb) {
        this._simulateCall({
            callArgs: `[]`,
            callFunction: "getUserPastes",
            callback: cb
        });;
    }
}
