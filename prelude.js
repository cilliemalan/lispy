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
        prelude[s('car')] = (a) => a[0];
        prelude[s('cdr')] = (a) => { const r = a.slice(1); return r.length == 0 ? null : r };
        prelude[s('+')] = (...args) => { let a = 0; args.forEach(i => a += i); return a; };
        prelude[s('*')] = (...args) => { let a = 1; args.forEach(i => a *= i); return a; };
        prelude[s('-')] = (...args) => { let a = args[0]; args.slice(1).forEach(i => a -= i); return a; };
        prelude[s('/')] = (...args) => { let a = args[0]; args.slice(1).forEach(i => a /= i); return a; };

        return prelude;
    }
};