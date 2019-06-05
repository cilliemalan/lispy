
const read = (text) => {
    const [r, _] = readInternal(text);
    return r;
}

const readInternal = (text, offset = 0) => {
    const len = text.length;
    if (len == 0) len = text.length;
    if (len == 0) return undefined;

    const rxSpace = /\s/;
    const rxNumber = /[0-9.+-]/;
    const rxSymbolStart = /[_$a-zA-Z\xA0-\uFFFF]/i;
    const rxSymbolRest = /[_$a-zA-Z0-9\xA0-\uFFFF]/i;

    let i = offset;
    const result = (r) => {
        while (rxSpace.test(text[i])) i++;
        return [r, i - offset];
    }
    const start = (c) => c === "(" || c === "[" || c === "{";
    const end = (c) => c === ")" || c === "]" || c === "}";
    const space = (c) => /\s/.test(c) || c === "" || end(c) || start(c);

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
                else if (c === '"') {
                    state = "string";
                    currentform += c;
                    break;
                }
                else if (rxSpace.test(c)) {
                    break;
                }
                else if (start(c)) {
                    ///////
                    i++;
                    const res = [];
                    for (; ;) {
                        const [form, advance] = readInternal(text, i);
                        i += advance;
                        const c2 = i < len ? text[i] : "";
                        if (form) {
                            res.push(form);
                        } else {
                            if (end(c2) && res.length == 0) {
                                return result(null);
                            } else {
                                throw "unexpected situation";
                            }
                        }
                        if (end(c2)) {
                            i++;
                            if (res.length == 0) throw "unexpected empty list";
                            else return result(res);
                        } else if (c2 == "") {
                            throw "unexpected eof while reading list";
                        }
                    }
                }
                else if (end(c)) {
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
            case "string":
                if (c == '"') {
                    currentform += c;
                    let numslashes = 0;
                    for (let j = i - 1; j >= 0; j--) {
                        if (text[j] === '\\') numslashes++;
                        else break;
                    }
                    if (numslashes % 2 == 0) {
                        i++;
                        return result(JSON.parse(currentform))
                    }
                } else if (c == "") {
                    throw "unexpected end of file while parsing string";
                } else {
                    currentform += c;
                }
                break;
            default:
                throw "unrecognized state: " + state;
        }
    }

    throw "exited loop without return";
}











module.exports = { read };