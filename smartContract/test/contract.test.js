var assert = require("assert")
let Stubs = require("../contractStubs.js");
let Contract = require("../pasteContract.js");

var Blockchain = Stubs.Blockchain;
var LocalContractStorage = Stubs.LocalContractStorage;

let contract = new Contract();
contract.init();
console.clear();

describe('SmartContract', () => {
    describe('getUnusedAlias()', () => {
        let alias = contract.getUnusedAlias();

        it('alias generated', () => {
            assert(alias);
        });
    });

    describe('create and get paste', () => {
        let paste = {
            title: "test",
            text: "but what if not"
        };

        let alias = contract.createPaste(JSON.stringify(paste));
        let total = contract.totalPastes();
        let getted = contract.getByAlias(alias);

        contract.createPaste(JSON.stringify(paste));
        contract.createPaste(JSON.stringify(paste));
        let latest = contract.getLatestPublicPastes();
        let userPastes = contract.getUserPastes();

        it('paste created', () => {
            assert(alias);
            assert(total > 0);
            assert(getted);
            assert(latest.length == 3);
            assert(userPastes.length == 3);
        });
    });

});