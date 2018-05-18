const CONTRACT_ADDRESS = "n1wVG7L9Xtm4D8mYmS3McUMovuXquWroSs4"; //e84f43506cf8569d55f3068a5ef1d75f9710d74b15c8dc10c2e500432f1f4ac2

class SmartContractApi {
    constructor(contractAdress) {
        let NebPay = require("nebpay");
        this.nebPay = new NebPay();
        this._contractAdress = contractAdress || CONTRACT_ADDRESS;
    }

    getContractAddress() {
        return this.contractAdress;
    }

    _simulateCall({ value = "0", callArgs = "[]", callFunction, callback }) {
        this.nebPay.simulateCall(this._contractAdress, value, callFunction, callArgs, {
            callback: function (resp) {
                if (callback) {
                    callback(resp);
                }
            }
        });
    }

    _call({ value = "0", callArgs = "[]", callFunction, callback }) {
        this.nebPay.call(this._contractAdress, value, callFunction, callArgs, {
            callback: function (resp) {
                if (callback) {
                    callback(resp);
                }
            }
        });
    }
}

class PasteContract extends SmartContractApi {
    createPaste(paste, cb) {
        this._call({
            callArgs: JSON.stringify([JSON.stringify(paste)]),
            callFunction: "createPaste",
            callback: cb
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
