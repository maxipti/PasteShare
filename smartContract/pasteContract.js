"use strict";

class Paste {
    constructor(text) {
        let obj = text ? JSON.parse(text) : {};
        this.id = obj.id || 0;
        this.date = obj.date;
        this.title = obj.title;
        this.text = obj.text;
        this.author = obj.author;
        this.accessOnlyByLink = obj.accessOnlyByLink;
        this.isAnonymously = obj.isAnonymously;
        this.alias = obj.alias;
    }

    toString() {
        return JSON.stringify(this);
    }
}

class PasteContract {
    constructor() {
        LocalContractStorage.defineProperty(this, "pasteCount");
        LocalContractStorage.defineMapProperty(this, "userPastes");
        LocalContractStorage.defineMapProperty(this, "aliasPastes");
        LocalContractStorage.defineMapProperty(this, "pastes", {
            parse: function (text) {
                return new Paste(text);
            },
            stringify: function (o) {
                return o.toString();
            }
        });
    }

    init() {
        this.pasteCount = 1;
    }

    totalPastes() {
        return new BigNumber(this.pasteCount).minus(1).toNumber();
    }

    createPaste(pasteJson) {
        let wallet = Blockchain.transaction.from;
        let index = new BigNumber(this.pasteCount).toNumber();

        let paste = new Paste(pasteJson);
        paste.id = index;

        paste.title = paste.title || "Untitled";
        paste.alias = this.getUnusedAlias();

        if (!paste.isAnonymously) {
            paste.author = wallet;
            let userPastes = this.userPastes.get(wallet) || [];
            userPastes.push(index);
            this.userPastes.put(wallet, userPastes);
        }

        this.pastes.put(index, paste);
        this.aliasPastes.put(paste.alias, index);

        this.pasteCount = new BigNumber(index).plus(1).toNumber();

        return paste.alias;
    }

    getUnusedAlias() {
        while (true) {
            let alias = this.generateAlias();
            if (!this.getByAlias(alias)) {
                return alias;
            }
        }
    }

    generateAlias(length = 5) {
        const str = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890';
        let alias = "";
        while (alias.length < length) {
            let charIndex = Math.floor(Math.random() * str.length);
            alias += str[charIndex];
        }

        return alias;
    }

    getByAlias(alias) {
        let pasteId = this.aliasPastes.get(alias);
        if (pasteId) {
            return this._getById(pasteId);
        }
    }

    _getById(id) {
        return this.pastes.get(id);
    }

    getUserPastes() {
        let wallet = Blockchain.transaction.from;
        let ids = this.userPastes.get(wallet) || [];

        let items = [];
        for (const id of ids) {
            let paste = this._getById(id);
            if (paste) {
                items.push(paste);
            }
        }

        return items;
    }

    getLatestPublicPastes(count = 10) {
        count = new BigNumber(count);

        let items = [];
        for (let i = new BigNumber(this.pasteCount).minus(count); i < this.pasteCount; i = i.plus(1)) {
            let index = i.toNumber();
            let paste = this._getById(index);
            if (paste && !paste.accessOnlyByLink) {
                items.push(paste);
            }
        }

        return items;
    }
}

module.exports = PasteContract;