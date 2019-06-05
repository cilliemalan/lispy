
const read = (text, offset = 0, len = 0) => {
    if (len == 0) len = text.length;
    if (len == 0) return undefined;

    let state = "form";
    let currentform = "";

    for (let i = offset; i <= len; i++) {
        const c = i < len ? text[i] : "eof";
        switch (state) {
            case "form":
                currentform = "";
                if (c >= '0' && c <= '9' || c == '.' || c == '-' || c == '+') {
                    state = "number";
                    currentform += c;
                    break;
                }
                else if (/\s/.test(c)) {
                    break;
                }
                else if (c == "") {
                    return undefined;
                }
                else {
                    throw "unexpected character found: " + c;
                }
            case "number":
            case "number after decimal":
                if (c >= '0' && c <= '9') {
                    currentform += c;
                    break;
                }
                else if (state == "number" && c == '.') {
                    currentform += c;
                    state = "number after decimal"
                    break;
                }
                else if (/\s/.test(c) || c == "eof") {
                    return parseFloat(currentform);
                }
                else {
                    throw "unexpected character found: " + c;
                }
        }
    }
}











module.exports = { read };