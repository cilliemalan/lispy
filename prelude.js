const { Macro } = require('./types');

module.exports = {
    createPrelude: (eval) => {
        const prelude = {};
        const s = (n) => Symbol.for(n);

        prelude[s('print')] = (...args) => console.log(...args);
        prelude[s('number?')] = isNumber;
        prelude[s('boolean?')] = isBoolean;
        prelude[s('string?')] = isString;
        prelude[s('array?')] = isArray;
        prelude[s('car')] = (a) => a[0];
        prelude[s('cdr')] = (a) => { const r = a.slice(1); return r.length == 0 ? null : r };
        prelude[s('+')] = (...args) => { let a = 0; args.forEach(i => a += i); return a; };
        prelude[s('*')] = (...args) => { let a = 1; args.forEach(i => a *= i); return a; };
        prelude[s('-')] = (...args) => { let a = args[0]; args.slice(1).forEach(i => a -= i); return a; };
        prelude[s('/')] = (...args) => { let a = args[0]; args.slice(1).forEach(i => a /= i); return a; };
        prelude[s('lambda')] = (arguments, body) => {
            return (...args) =>
                eval(body, a => {
                    var ix = arguments.indexOf(a);
                    if (ix >= 0) {
                        return args[ix];
                    }
                    else {
                        return environmentLookup(a);
                    }
                })
        };
        prelude[s('and')] = new Macro((...expressions) => {
            for (e in expressions) {
                if (evaluate(e) === false) return false;
            }
            return true;
        });
        prelude[s('or')] = new Macro((...expressions) => {
            for (e in expressions) {
                if (evaluate(e) !== false) return true;
            }
            return false;
        });
        prelude[s('if')] = new Macro((i, t, e) => evaluate(i) !== false
            ? evaluate(t)
            : (e !== null
                ? evaluate(e)
                : null));

        return prelude;
    }
};