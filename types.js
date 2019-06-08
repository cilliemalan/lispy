
class Pair {
    constructor(a,b) { this.a = a; this.b = b; }
}

class Macro {
    constructor(fn) { this.invoke = fn; }
}


module.exports = { Pair, Macro };