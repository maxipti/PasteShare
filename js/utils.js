function convertUnixStampToScreenDate(unixstamp, withTime = false) {
    let date = new Date(+unixstamp);
    let screenDate = addZeroIfOneCharacter(date.getDate()) + "." + addZeroIfOneCharacter(date.getMonth()) + "." + date.getFullYear();
    if (withTime) {
        screenDate += ` at ${addZeroIfOneCharacter(date.getHours())}:${addZeroIfOneCharacter(date.getMinutes())}`;
    }

    return screenDate;
}

function convertScreenDateToUnixStamp(date) {
    //format: 22.04.1999
    let pattern = /(\d{2})\.(\d{2})\.(\d{4})/;
    let dt = new Date(date.replace(pattern, '$3-$2-$1'));
    return +dt;
}

function addZeroIfOneCharacter(value) {
    let str = value.toString();
    return str.length == 1 ? "0" + str : str;
}

const weiAtNas = new BigNumber(1000000000000000000);

function convertWeiToNas(value) {
    return new BigNumber(value).dividedBy(weiAtNas).toNumber();
}

function convertNasToWei(value) {
    return new BigNumber(value).multipliedBy(weiAtNas).toNumber();
}