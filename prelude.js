const { isArray, isSymbol, isString, isBoolean, isNumber } = require('util');

module.exports = {
    createPrelude: (eval) => {
        const prelude = {};
        const s = (n) => Symbol.for(n);

        prelude[s('print')] = (...args) => console.log(...args);
        prelude[s('number?')] = isNumber;
        prelude[s('boolean?')] = isBoolean;
        prelude[s('string?')] = isString;
        prelude[s('array?')] = isArray;
        prelude[s('symbol?')] = isSymbol;
        prelude[s('empty?')] = (a) => isArray(a) && a.length === 0;
        prelude[s('car')] = (a) => { if (a.length == 0) throw "cannot car an empty array"; return a[0]; }
        prelude[s('cdr')] = (a) => a.slice(1);
        prelude[s('cons')] = (a, b) => { if (!isArray(b)) throw "cons must have array as second arg"; return [a].concat(b); }
        prelude[s('array')] = (...args) => args;

        prelude[s('+')] = (...args) => { let a = 0; args.forEach(i => a += i); return a; };
        prelude[s('*')] = (...args) => { let a = 1; args.forEach(i => a *= i); return a; };
        prelude[s('-')] = (...args) => { if (args.length == 1) return -args[0]; let a = args[0]; args.slice(1).forEach(i => a -= i); return a; };
        prelude[s('/')] = (...args) => { if (args.length == 1) return 1 / args[0]; let a = args[0]; args.slice(1).forEach(i => a /= i); return a; };

        return (s) => {
            if (!isSymbol(s)) throw `cannot evaluate non-symbol ${s}`;
            const v = prelude[s];
            if (v === undefined) throw `undefined symbol: ${s.description}`;
            return v;
        }
    }
};