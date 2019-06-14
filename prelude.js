const { isArray, isSymbol, isString, isBoolean, isNumber, isObject, isFunction } = require('util');

module.exports = {
    createPrelude: (eval) => {
        const prelude = {};
        const s = (n) => Symbol.for(n);

        const lookup = (s) => {
            if (!isSymbol(s)) throw `cannot evaluate non-symbol ${s}`;
            const v = prelude[s];
            if (v === undefined) throw `undefined symbol: ${s.description}`;
            return v;
        }

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
        prelude[s('nth')] = (ix, arr) => {
            if (!isNumber(ix)) throw "nth must have number as first arg";
            if (!isArray(arr)) throw "nth must have array as second arg";
            ix = parseInt(ix);
            if (isNaN(ix)) throw "ix cannot be nan";
            if (!isFinite(ix)) throw "ix must be finite";
            if (ix < 0 || ix >= arr.length) throw "ix was out of bounds of the array";
            return arr[ix];
        }
        prelude[s('length')] = (arr) => { if (!isArray(arr)) throw "length must have array as second arg"; return arr.length; }

        prelude[s('+')] = (...args) => { let a = 0; args.forEach(i => a += i); return a; };
        prelude[s('*')] = (...args) => { let a = 1; args.forEach(i => a *= i); return a; };
        prelude[s('-')] = (...args) => { if (args.length == 1) return -args[0]; let a = args[0]; args.slice(1).forEach(i => a -= i); return a; };
        prelude[s('/')] = (...args) => { if (args.length == 1) return 1 / args[0]; let a = args[0]; args.slice(1).forEach(i => a /= i); return a; };

        const macro = (f) => { f[s('macro')] = true; return f; }
        prelude[s('import')] = (module) => require(module);
        prelude[s('object')] = macro((entries) => Object.fromEntries(entries));
        prelude[s('->')] = (ob, key) => {
            if (!isObject(ob)) throw "-> can only be used on objects";
            if (isString(key)) {
                const result = ob[key];
                if (isFunction(result)) return result.bind(ob);
                else return result;
            }
            else throw "-> must have a symbol or string as a second arg";
        };

        prelude[s('define')] = macro((...args) => {
            const [name, value] = args;
            if (!isSymbol(name)) throw "name must be a symbol";
            const evaluatedValue = eval(value, lookup);
            prelude[name] = evaluatedValue;
            return evaluatedValue;
        });

        return lookup;
    }
};