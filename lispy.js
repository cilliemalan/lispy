
const read = (text) => {
    const [r, _] = readInternal(text);
    return r;
}

const readInternal = (text, offset = 0, len = 0) => {
    if (len == 0) len = text.length;
    if (len == 0) return undefined;

    const rxSpace = /\s/;
    const rxNumber = /[0-9.+-]/;
    const rxSymbolStart = /[_$a-zA-Z\xA0-\uFFFF]/i;
    const rxSymbolRest = /[_$a-zA-Z0-9\xA0-\uFFFF]/i;

    let i = offset;
    const result = (r) => [r, i - offset];
    const space = (c) => /\s/.test(c) || c === "";

    let state = "form";
    let currentform = "";

    for (; i <= len; i++) {
        const c = i < len ? text[i] : "";
        switch (state) {
            case "form":
                currentform = "";
                if (rxNumber.test(c)) {
                    state = "number";
                    currentform += c;
                    break;
                }
                else if (rxSymbolStart.test(c)) {
                    state = "symbol";
                    currentform += c;
                    break;
                }
                else if (rxSpace.test(c)) {
                    break;
                }
                else if (c === "") {
                    return result(undefined);
                }
                else {
                    throw "unexpected character found: " + c;
                }
                break;
            case "number":
            case "number after decimal":
                if (c >= '0' && c <= '9') {
                    currentform += c;
                    break;
                }
                else if (state === "number" && c === '.') {
                    currentform += c;
                    state = "number after decimal"
                    break;
                }
                else if (space(c)) {
                    return result(parseFloat(currentform));
                }
                else {
                    throw "unexpected character found while parsing number: " + c;
                }
                break;
            case "symbol":
                if (rxSymbolRest.test(c)) {
                    currentform += c;
                    break;
                }
                else if (space(c)) {
                    return result(Symbol.for(currentform));
                }
                else {
                    throw "unexpected character found while parsing symbol: " + c;
                }
                break;
            default:
                throw "unrecognized state: " + state;
        }
    }
    
    throw "exited loop without return";
}











module.exports = { read };