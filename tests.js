const { read } = require('./reader');
const { evaluate } = require('./evaluate');
const { createPrelude } = require('./prelude');

const assert = require('assert');
const { isFunction } = require('util');

const s = (x) => Symbol.for(x);

const readSimple = (text) => {
    const [r, _] = read(text);
    return r;
}

const prelude = createPrelude(evaluate);

const tests = {

    // reader tests
    'read parses simple number': () => assert.strictEqual(readSimple("123"), 123),
    'read parses a number with decimal': () => assert.strictEqual(readSimple("123.123"), 123.123),
    'read parses a number starting with decimal': () => assert.strictEqual(readSimple(".123"), .123),
    'read parses a negative simple number': () => assert.strictEqual(readSimple("-123"), -123),
    'read parses a positive simple number': () => assert.strictEqual(readSimple("+123"), +123),
    'read ignores leading spaces': () => assert.strictEqual(readSimple("  123"), 123),

    'read reads a symbol': () => assert.strictEqual(readSimple("hello"), s('hello')),
    'read reads a symbol with leading spaces': () => assert.strictEqual(readSimple("  helloA"), s('helloA')),
    'read reads a symbol with funny characters': () => assert.strictEqual(readSimple("/?<>!$%^&*-=_+"), s('/?<>!$%^&*-=_+')),
    'read reads a symbol with number literals 1': () => assert.strictEqual(readSimple("+one"), s('+one')),
    'read reads a symbol with number literals 2': () => assert.strictEqual(readSimple("-a"), s('-a')),
    'read reads a symbol with number literals 3': () => assert.strictEqual(readSimple("1.0f"), s('1.0f')),
    'read reads a symbol with number literals 4': () => assert.strictEqual(readSimple("1.hello"), s('1.hello')),
    'read reads a symbol with number literals 4': () => assert.strictEqual(readSimple("1.0hello"), s('1.0hello')),
    'read reads a symbol with number literals 5': () => assert.strictEqual(readSimple("99balloons"), s('99balloons')),
    'read reads a symbol with number literals 6': () => assert.strictEqual(readSimple("..."), s('...')),
    'read reads a symbol with other literals 1': () => assert.strictEqual(readSimple(".five"), s('.five')),
    'read reads a symbol with other literals 2': () => assert.strictEqual(readSimple("="), s('=')),
    'read reads a symbol with other literals 3': () => assert.strictEqual(readSimple("!really?"), s('!really?')),
    'read reads a symbol with other literals 4': () => assert.strictEqual(readSimple("_"), s('_')),
    'read reads a symbol with well known name 1': () => assert.strictEqual(readSimple("string?"), s('string?')),
    'read reads a symbol with well known name 2': () => assert.strictEqual(readSimple("string->num"), s('string->num')),
    'read reads a symbol with well known name 3': () => assert.strictEqual(readSimple("+"), s('+')),

    'read reads a string': () => assert.strictEqual(readSimple('"hello"'), "hello"),
    'read reads a string with escapes': () => assert.strictEqual(readSimple('"hello\\n"'), "hello\n"),
    'read reads a string with double escapes': () => assert.strictEqual(readSimple('"hello\\\\n"'), "hello\\n"),
    'read reads a string with escaped quotes': () => assert.strictEqual(readSimple('"hello\\""'), "hello\""),
    'read reads a string with escaped confusion': () => assert.strictEqual(readSimple('"he\\\\llo\\\\\\"\\""'), "he\\llo\\\"\""),

    'read reads a list with strings': () => assert.deepStrictEqual(readSimple('("a" "b" "c")'), ["a", "b", "c"]),
    'read reads a list numbers': () => assert.deepStrictEqual(readSimple('(1 2 3)'), [1, 2, 3]),
    'read reads a list symbols': () => assert.deepStrictEqual(readSimple('(a b c)'), [s('a'), s('b'), s('c')]),
    'read reads a list numbers and spaces': () => assert.deepStrictEqual(readSimple('( 1 \t 2 \n 3 )'), [1, 2, 3]),
    'read reads a list numbers and more spaces': () => assert.deepStrictEqual(readSimple(' ( 1 \t 2 \n 3 )\t'), [1, 2, 3]),
    'read reads a list with one number': () => assert.deepStrictEqual(readSimple('(1)'), [1]),
    'read reads empty list as []': () => assert.deepStrictEqual(readSimple('()'), []),
    'read reads empty list as [] with spaces': () => assert.deepStrictEqual(readSimple('  (  )  '), []),
    'read reads empty list as [] inside other list 1': () => assert.deepStrictEqual(readSimple('(1 2 3 ())'), [1, 2, 3, []]),
    'read reads empty list as [] inside other list 2': () => assert.deepStrictEqual(readSimple('(1 2 () 3) '), [1, 2, [], 3]),
    'read reads empty list as [] inside other list 3': () => assert.deepStrictEqual(readSimple('(1 (()) () 3) '), [1, [[]], [], 3]),
    'read reads empty list as [] inside other list 4': () => assert.deepStrictEqual(readSimple('(1 ((())) () 3) '), [1, [[[]]], [], 3]),
    'read reads nested lists': () => assert.deepStrictEqual(readSimple('(1 (2 3) 4)'), [1, [2, 3], 4]),
    'read reads nested lists without spaces': () => assert.deepStrictEqual(readSimple('(1(2 3)4)'), [1, [2, 3], 4]),
    'read reads nested lists with symbols without spaces': () => assert.deepStrictEqual(readSimple('(a(b c)d)'), [s('a'), [s('b'), s('c')], s('d')]),
    'read reads nested lists with different brackets': () => assert.deepStrictEqual(readSimple('(1 [2 {3}] 4)'), [1, [2, [3]], 4]),
    'read expects matching brackets': () => assert.throws(() => readSimple('(1 2 3}'), /does not correspond/),
    'read reads multi line forms': () => assert.deepStrictEqual(readSimple('(\n1\n(2 \n 3)\n\t 4 \n)'), [1, [2, 3], 4]),

    'read supports semicolon comments': () => assert.deepStrictEqual(readSimple('(\n ; this is a comment \n 1 (2 3) 4)'), [1, [2, 3], 4]),
    'read supports pipe comments': () => assert.deepStrictEqual(readSimple('(\n #| this \n is \n a comment |# 1 (2 3) 4)'), [1, [2, 3], 4]),

    'read supports quote': () => assert.deepStrictEqual(readSimple("'1"), [s('quote'), 1]),
    'read supports unquote': () => assert.deepStrictEqual(readSimple(",1"), [s('unquote'), 1]),
    'read supports quasiquote': () => assert.deepStrictEqual(readSimple("`1"), [s('quasiquote'), 1]),
    'read supports quote in the middle of stuff': () => assert.deepStrictEqual(readSimple("(1 '2 3)"), [1, [s('quote'), 2], 3]),
    'read supports quote with whitespace': () => assert.deepStrictEqual(readSimple("' 1"), [s('quote'), 1]),
    'read supports quote with more whitespace': () => assert.deepStrictEqual(readSimple(" ( 1 '\n2  3 ) "), [1, [s('quote'), 2], 3]),
    'read supports quote with even more whitespace': () => assert.deepStrictEqual(readSimple(" ( 1 '\n(1 2)  3 ) "), [1, [s('quote'), [1, 2]], 3]),

    'read does not support dot': () => assert.throws(() => readSimple("(1 . 2)")),
    'read does not support dot 1': () => assert.throws(() => readSimple("(1 . 2 3)")),
    'read does not support dot 2': () => assert.throws(() => readSimple("(1 2 . 3)")),
    'read does not support dot 3': () => assert.throws(() => readSimple(".")),


    // evaluate tests
    'evaluate evaulates a number': () => assert.strictEqual(evaluate(1), 1),
    'evaluate evaulates a boolean 1': () => assert.strictEqual(evaluate(true), true),
    'evaluate evaulates a boolean 2': () => assert.strictEqual(evaluate(false), false),
    'evaluate evaulates a string': () => assert.strictEqual(evaluate("hello world"), "hello world"),
    'evaluate evaluates a function': () => assert.strictEqual(Object.toString, Object.toString),

    'evaluate looks up a symbol': () => assert.strictEqual(evaluate(s('symbol'), (z) => { assert.strictEqual(z, s('symbol')); return "value" }), "value"),
    'evaluate invokes a function': () => assert.strictEqual(evaluate([s('func')], () => () => "value"), "value"),
    'evaluate does evaluate arguments': () => evaluate([s('func'), s('a')], (p) => p == s('a') ? "a" : (f) => assert.strictEqual(f, "a")),

    'evaluate evaluates and to true': () => assert.strictEqual(evaluate([s('and')]), true),
    'evaluate evaluates and and it\'s paramters': () => assert.strictEqual(evaluate([s('and'), 5, 6, 7]), true),
    'evaluate evaluates and to false if there is a false': () => assert.strictEqual(evaluate([s('and'), 5, 6, false]), false),
    'evaluate evaluates and lazily': () => {
        let call_a = 0;
        let call_b = 0;
        let call_c = 0;
        const a = () => { call_a++; return true; }
        const b = () => { call_b++; return false; }
        const c = () => { call_c++; return false; }
        const env = (s) => eval(s.description);
        evaluate([s('and'), [s('a')], [s('b')], [s('c')]], env);
        assert.equal(call_a, 1);
        assert.equal(call_b, 1);
        assert.equal(call_c, 0);
    },

    'evaluate evaluates or to false': () => assert.strictEqual(evaluate([s('or')]), false),
    'evaluate evaluates or and it\'s paramters': () => assert.strictEqual(evaluate([s('or'), 5, 6, 7]), true),
    'evaluate evaluates or to false if all is false': () => assert.strictEqual(evaluate([s('or'), false, false, false]), false),
    'evaluate evaluates or to true if one is true': () => assert.strictEqual(evaluate([s('or'), false, true, false]), true),
    'evaluate evaluates or lazily': () => {
        let call_a = 0;
        let call_b = 0;
        let call_c = 0;
        const a = () => { call_a++; return false; }
        const b = () => { call_b++; return true; }
        const c = () => { call_c++; return true; }
        const env = (s) => eval(s.description);
        evaluate([s('or'), [s('a')], [s('b')], [s('c')]], env);
        assert.equal(call_a, 1);
        assert.equal(call_b, 1);
        assert.equal(call_c, 0);
    },

    'evaluate evaluates if true leg': () => assert.strictEqual(evaluate([s('if'), true, 1, 2]), 1),
    'evaluate evaluates if false leg': () => assert.strictEqual(evaluate([s('if'), false, 1, 2]), 2),
    'evaluate evaluates if true leg one legged': () => assert.strictEqual(evaluate([s('if'), true, 1]), 1),
    'evaluate evaluates if false leg one legged': () => assert.strictEqual(evaluate([s('if'), false, 1]), undefined),
    'evaluate evaluates if true leg and not other leg': () => {
        let call_a = 0;
        let call_b = 0;
        const a = () => { call_a++; return 1; }
        const b = () => { call_b++; return 2; }
        const env = (s) => eval(s.description);
        evaluate([s('if'), true, [s('a')], [s('b')]], env);
        assert.equal(call_a, 1);
        assert.equal(call_b, 0);
    },
    'evaluate evaluates if false leg and not other leg': () => {
        let call_a = 0;
        let call_b = 0;
        const a = () => { call_a++; return 1; }
        const b = () => { call_b++; return 2; }
        const env = (s) => eval(s.description);
        evaluate([s('if'), false, [s('a')], [s('b')]], env);
        assert.equal(call_a, 0);
        assert.equal(call_b, 1);
    },
    'evaluate evaluates cond': () => assert.strictEqual(evaluate([s('cond'), [false, 43], [true, 42]]), 42),
    'evaluate evaluates cond else': () => assert.strictEqual(evaluate([s('cond'), [false, 43], [s('else'), 42]]), 42),
    'evaluate cond returns unefined if all false': () => assert.strictEqual(evaluate([s('cond'), [false, 43], [false, 42]]), undefined),

    'evaluate evaluates lambda to a function': () => assert.equal(true, isFunction(evaluate([s('lambda'), [], 1]))),
    'evaluate evaluates lambda to a function that works': () => assert.strictEqual(evaluate([s('lambda'), [], 1])(), 1),
    'evaluate can evaluate a lambda': () => assert.strictEqual(evaluate([[s('lambda'), [], 1]]), 1),
    'evaluate evaluates lambda to a function that takes an arg': () => assert.strictEqual(evaluate([s('lambda'), [s('a')], s('a')])(33), 33),
    'evaluate evaluates lambda to a function that takes args': () => assert.strictEqual(evaluate([s('lambda'), [s('a'), s('b')], s('b')])(33, 34), 34),
    'evaluate lambda throws with too many args': () => assert.throws(() => evaluate([s('lambda'), [s('a')], s('a')])(1, 2, 3)),
    'evaluate lambda supports rest args': () => assert.deepStrictEqual(evaluate([s('lambda'), [s('a'), s('b'), s('...c')], s('c')])(1, 2, 3, 4, 5), [3, 4, 5]),
    'evaluate lambda with default rest supports too many args': () => assert.deepStrictEqual(evaluate([s('lambda'), [s('...')], 42])(1, 2, 3), 42),
    'evaluate lambda supports only one rest args': () => assert.throws(() => evaluate([s('lambda'), [s('a'), s('...b'), s('...c')], s('c')])),

    'evaluate evaluates macro to a function': () => assert.equal(true, isFunction(evaluate([s('macro'), [s('_')], 1]))),
    'evaluate evaluates macro to a function that works': () => assert.strictEqual(evaluate([s('macro'), [s('_')], 1])([]), 1),
    'evaluate macro gets passed input syntax': () => {
        const macro = [s('macro'), [s('_')], [s('test'), s('_')]];
        const invocation = [macro, 1, 2, 3];
        let argpassed;
        const environment = (sym) => {
            if (sym === s('test')) return (syntax) => {
                argpassed = syntax;
                return 42;
            }
        }
        const result = evaluate(invocation, environment);
        assert.strictEqual(result, 42);
        assert.deepStrictEqual(argpassed, [1, 2, 3])
    },
    'evaluate macro transforms syntax': () => {
        const macro = [s('macro'), [s('_')], [s('test'), s('_')]];
        const invocation = [macro, 1, [s('+'), 2, 3]];
        let argpassed1;
        let argpassed2;
        const environment = (sym) => {
            if (sym === s('test')) return (syntax) => {
                argpassed1 = syntax;
                return [s('sum'), ...syntax];
            };
            else if (sym === s('sum')) return (...args) => {
                argpassed2 = args;
                return prelude(s('+'))(...args);
            };
            else return prelude(sym);
        }
        const result = evaluate(invocation, environment);
        assert.strictEqual(result, 6);
        assert.deepStrictEqual(argpassed1, [1, [s('+'), 2, 3]]);
        assert.deepStrictEqual(argpassed2, [1, 5]);
    },

    'evaluate evaluates a quoted expression': () => assert.strictEqual(evaluate([s('quote'), 1]), 1),
    'evaluate evaluates a quoted list': () => assert.deepStrictEqual(evaluate([s('quote'), [1, 2, 3]]), [1, 2, 3]),


    // prelude tests
    'prelude is a function': () => assert.ok(isFunction(prelude)),
    'prelude has print': () => assert.ok(isFunction(prelude(s('print')))),
    'prelude has number?': () => assert.ok(isFunction(prelude(s('number?')))),
    'prelude has boolean?': () => assert.ok(isFunction(prelude(s('boolean?')))),
    'prelude has string?': () => assert.ok(isFunction(prelude(s('string?')))),
    'prelude has array?': () => assert.ok(isFunction(prelude(s('array?')))),
    'prelude has symbol?': () => assert.ok(isFunction(prelude(s('symbol?')))),
    'prelude has empty?': () => assert.ok(isFunction(prelude(s('empty?')))),
    'prelude has car': () => assert.ok(isFunction(prelude(s('car')))),
    'prelude has cdr': () => assert.ok(isFunction(prelude(s('cdr')))),
    'prelude has cons': () => assert.ok(isFunction(prelude(s('cons')))),
    'prelude has array': () => assert.ok(isFunction(prelude(s('array')))),
    'prelude has nth': () => assert.ok(isFunction(prelude(s('nth')))),
    'prelude has math': () => assert.ok(isFunction(prelude(s('*'))) && isFunction(prelude(s('-'))) && isFunction(prelude(s('+'))) && isFunction(prelude(s('/')))),
    'prelude has import': () => assert.ok(isFunction(prelude(s('import')))),
    'prelude has object': () => assert.ok(isFunction(prelude(s('object')))),

    'prelude number? identifies number': () => assert.ok(prelude(s('number?'))(55)),
    'prelude number? does not identify non-number': () => assert.ok(!prelude(s('number?'))("aa")),
    'prelude boolean? identifies boolean 1': () => assert.ok(prelude(s('boolean?'))(true)),
    'prelude boolean? identifies boolean 2': () => assert.ok(prelude(s('boolean?'))(false)),
    'prelude boolean? does not identify non-boolean': () => assert.ok(!prelude(s('boolean?'))("aa")),
    'prelude string? identifies string': () => assert.ok(prelude(s('string?'))("abc")),
    'prelude string? does not identify non-string': () => assert.ok(!prelude(s('string?'))(55)),
    'prelude array? identifies array': () => assert.ok(prelude(s('array?'))([2, 3, 4])),
    'prelude array? does not identify non-array': () => assert.ok(!prelude(s('array?'))("aa")),
    'prelude empty? identifies empty array': () => assert.ok(prelude(s('empty?'))([])),
    'prelude empty? does not identify a non-empty array': () => assert.ok(!prelude(s('empty?'))([1, 2, 3])),
    'prelude empty? does not identify a non-array': () => assert.ok(!prelude(s('empty?'))("hello")),
    'prelude car gets first': () => assert.deepStrictEqual(prelude(s('car'))([1, 2, 3]), 1),
    'prelude car doesn\'t like empty': () => assert.throws(() => prelude(s('car'))([])),
    'prelude cdr gets rest': () => assert.deepStrictEqual(prelude(s('cdr'))([1, 2, 3]), [2, 3]),
    'prelude cdr returns [] when empty': () => assert.deepStrictEqual(prelude(s('cdr'))([1]), []),
    'prelude cons creates an array': () => assert.deepStrictEqual(prelude(s('cons'))(1, []), [1]),
    'prelude cons prepends to an array': () => assert.deepStrictEqual(prelude(s('cons'))(3, [4, 5, 6]), [3, 4, 5, 6]),
    'prelude cons does not concat': () => assert.deepStrictEqual(prelude(s('cons'))([1, 2, 3], [4, 5, 6]), [[1, 2, 3], 4, 5, 6]),
    'prelude cons rejects non-array as second parm': () => assert.throws(() => prelude(s('cons'))(1, 2)),
    'prelude array creates an array': () => assert.deepStrictEqual(evaluate([s('array'), 1, 2, 3], prelude), [1, 2, 3]),
    'prelude array creates an empty array without args': () => assert.deepStrictEqual(evaluate([s('array')], prelude), []),
    'prelude nth subscripts an array': () => assert.deepStrictEqual(prelude(s('nth'))(3, [1, 2, 3, 4, 5, 6]), 4),
    'prelude nth throws out of bounds': () => assert.throws(() => prelude(s('nth'))(-1, [1])),
    'prelude length gets length of array': () => assert.deepStrictEqual(prelude(s('length'))([1, 2, 3, 4, 5, 6]), 6),
    'prelude length gets length of empty array': () => assert.deepStrictEqual(prelude(s('length'))([]), 0),

    'prelude + sums': () => assert.strictEqual(prelude(s('+'))(1, 2, 3), 1 + 2 + 3),
    'prelude + returns single': () => assert.strictEqual(prelude(s('+'))(43), 43),
    'prelude + identity is 0': () => assert.strictEqual(prelude(s('+'))(), 0),
    'prelude * products': () => assert.strictEqual(prelude(s('+'))(1, 2, 3), 1 + 2 + 3),
    'prelude * returns single': () => assert.strictEqual(prelude(s('*'))(66), 66),
    'prelude * identity is 1': () => assert.strictEqual(prelude(s('*'))(), 1),
    'prelude - subtracts': () => assert.strictEqual(prelude(s('-'))(10, 3), 7),
    'prelude - subtracts multiple': () => assert.strictEqual(prelude(s('-'))(10, 3, 3, 3), 1),
    'prelude - negates': () => assert.strictEqual(prelude(s('-'))(10), -10),
    'prelude / divides': () => assert.strictEqual(prelude(s('/'))(10, 3), 10 / 3),
    'prelude / divides multiple 1': () => assert.strictEqual(prelude(s('/'))(10, 3, 3), 10 / 9),
    'prelude / divides multiple 2': () => assert.strictEqual(prelude(s('/'))(10, 2, 2, 2), 10 / 8),
    'prelude / reciprocals': () => assert.strictEqual(prelude(s('/'))(10), 1 / 10),

    'prelude import imports': () => assert.strictEqual(prelude(s('import'))('fs').readFileSync, require('fs').readFileSync),
    'prelude object creates objects': () => assert.deepStrictEqual(prelude(s('object'))([['a', 1], ['b', 2]]), { a: 1, b: 2 }),
    'prelude -> accesses things with string': () => assert.strictEqual(prelude(s('->'))({ a: 1, b: 2, c: 3 }, 'b'), 2),
    'prelude -> accesses things with symbol': () => assert.strictEqual(prelude(s('->'))({ a: 1, b: 2, c: 3 }, Symbol.for('b')), 2),

    'prelude define defines': () => {
        evaluate([s('define'), s('a'), 5], prelude);
        assert.strictEqual(evaluate(s('a'), prelude), 5);
    }
}



let tcnt = 0, tot = 0;
Object.keys(tests).forEach(t => {
    tot++;
    process.stdout.write(`${t}: `);
    try {
        tests[t]();
        process.stdout.write(`OK\n`);
        tcnt++;
    } catch (e) {
        process.stdout.write(`FAIL\n`);
        if (e.message) console.error(e.message);
        else console.error(e);
    }
});

console.log(`Passed (${tcnt}/${tot})`);
process.exitCode = tcnt === tot ? 0 : 1;