const { read } = require('./reader');
const { Pair } = require('./types');
const assert = require('assert');
const { evaluate } = require('./evaluate');

const readSimple = (text) => {
    const [r, _] = read(text);
    return r;
}

const tests = {

    // reader tests
    'read parses simple number': () => assert.strictEqual(readSimple("123"), 123),
    'read parses a number with decimal': () => assert.strictEqual(readSimple("123.123"), 123.123),
    'read parses a number starting with decimal': () => assert.strictEqual(readSimple(".123"), .123),
    'read parses a negative simple number': () => assert.strictEqual(readSimple("-123"), -123),
    'read parses a positive simple number': () => assert.strictEqual(readSimple("+123"), +123),
    'read ignores leading spaces': () => assert.strictEqual(readSimple("  123"), 123),

    'read reads a symbol': () => assert.strictEqual(readSimple("hello"), Symbol.for('hello')),
    'read reads a symbol with leading spaces': () => assert.strictEqual(readSimple("  helloA"), Symbol.for('helloA')),
    'read reads a symbol with funny characters': () => assert.strictEqual(readSimple("/?<>!$%^&*-=_+"), Symbol.for('/?<>!$%^&*-=_+')),
    'read reads a symbol with number literals 1': () => assert.strictEqual(readSimple("+one"), Symbol.for('+one')),
    'read reads a symbol with number literals 2': () => assert.strictEqual(readSimple("-a"), Symbol.for('-a')),
    'read reads a symbol with number literals 3': () => assert.strictEqual(readSimple("1.0f"), Symbol.for('1.0f')),
    'read reads a symbol with number literals 4': () => assert.strictEqual(readSimple("1.hello"), Symbol.for('1.hello')),
    'read reads a symbol with number literals 4': () => assert.strictEqual(readSimple("1.0hello"), Symbol.for('1.0hello')),
    'read reads a symbol with number literals 5': () => assert.strictEqual(readSimple("99balloons"), Symbol.for('99balloons')),
    'read reads a symbol with other literals 1': () => assert.strictEqual(readSimple(".five"), Symbol.for('.five')),
    'read reads a symbol with other literals 2': () => assert.strictEqual(readSimple("="), Symbol.for('=')),
    'read reads a symbol with other literals 3': () => assert.strictEqual(readSimple("!really?"), Symbol.for('!really?')),
    'read reads a symbol with well known name 1': () => assert.strictEqual(readSimple("string?"), Symbol.for('string?')),
    'read reads a symbol with well known name 2': () => assert.strictEqual(readSimple("string->num"), Symbol.for('string->num')),
    'read reads a symbol with well known name 3': () => assert.strictEqual(readSimple("+"), Symbol.for('+')),

    'read reads a string': () => assert.strictEqual(readSimple('"hello"'), "hello"),
    'read reads a string with escapes': () => assert.strictEqual(readSimple('"hello\\n"'), "hello\n"),
    'read reads a string with double escapes': () => assert.strictEqual(readSimple('"hello\\\\n"'), "hello\\n"),
    'read reads a string with escaped quotes': () => assert.strictEqual(readSimple('"hello\\""'), "hello\""),
    'read reads a string with escaped confusion': () => assert.strictEqual(readSimple('"he\\\\llo\\\\\\"\\""'), "he\\llo\\\"\""),

    'read reads a list with strings': () => assert.deepStrictEqual(readSimple('("a" "b" "c")'), ["a", "b", "c"]),
    'read reads a list numbers': () => assert.deepStrictEqual(readSimple('(1 2 3)'), [1, 2, 3]),
    'read reads a list symbols': () => assert.deepStrictEqual(readSimple('(a b c)'), [Symbol.for('a'), Symbol.for('b'), Symbol.for('c')]),
    'read reads a list numbers and spaces': () => assert.deepStrictEqual(readSimple('( 1 \t 2 \n 3 )'), [1, 2, 3]),
    'read reads a list numbers and more spaces': () => assert.deepStrictEqual(readSimple(' ( 1 \t 2 \n 3 )\t'), [1, 2, 3]),
    'read reads a list with one number': () => assert.deepStrictEqual(readSimple('(1)'), [1]),
    'read reads empty list as null': () => assert.deepStrictEqual(readSimple('()'), null),
    'read reads empty list as null with spaces': () => assert.deepStrictEqual(readSimple('  (  )  '), null),
    'read reads empty list as null inside other list 1': () => assert.deepStrictEqual(readSimple('(1 2 3 ())'), [1, 2, 3, null]),
    'read reads empty list as null inside other list 2': () => assert.deepStrictEqual(readSimple('(1 2 () 3) '), [1, 2, null, 3]),
    'read reads empty list as null inside other list 3': () => assert.deepStrictEqual(readSimple('(1 (()) () 3) '), [1, [null], null, 3]),
    'read reads empty list as null inside other list 4': () => assert.deepStrictEqual(readSimple('(1 ((())) () 3) '), [1, [[null]], null, 3]),
    'read reads nested lists': () => assert.deepStrictEqual(readSimple('(1 (2 3) 4)'), [1, [2, 3], 4]),
    'read reads nested lists without spaces': () => assert.deepStrictEqual(readSimple('(1(2 3)4)'), [1, [2, 3], 4]),
    'read reads nested lists with symbols without spaces': () => assert.deepStrictEqual(readSimple('(a(b c)d)'), [Symbol.for('a'), [Symbol.for('b'), Symbol.for('c')], Symbol.for('d')]),
    'read reads nested lists with different brackets': () => assert.deepStrictEqual(readSimple('(1 [2 {3}] 4)'), [1, [2, [3]], 4]),
    'read expects matching brackets': () => assert.throws(() => readSimple('(1 2 3}'), /does not correspond/),
    'read reads multi line forms': () => assert.deepStrictEqual(readSimple('(\n1\n(2 \n 3)\n\t 4 \n)'), [1, [2, 3], 4]),

    'read supports semicolon comments': () => assert.deepStrictEqual(readSimple('(\n ; this is a comment \n 1 (2 3) 4)'), [1, [2, 3], 4]),
    'read supports pipe comments': () => assert.deepStrictEqual(readSimple('(\n #| this \n is \n a comment |# 1 (2 3) 4)'), [1, [2, 3], 4]),

    'read supports quote': () => assert.deepStrictEqual(readSimple("'1"), [Symbol.for('quote'), 1]),
    'read supports unquote': () => assert.deepStrictEqual(readSimple(",1"), [Symbol.for('unquote'), 1]),
    'read supports quasiquote': () => assert.deepStrictEqual(readSimple("`1"), [Symbol.for('quasiquote'), 1]),
    'read supports quote in the middle of stuff': () => assert.deepStrictEqual(readSimple("(1 '2 3)"), [1, [Symbol.for('quote'), 2], 3]),
    'read supports quote with whitespace': () => assert.deepStrictEqual(readSimple("' 1"), [Symbol.for('quote'), 1]),
    'read supports quote with more whitespace': () => assert.deepStrictEqual(readSimple(" ( 1 '\n2  3 ) "), [1, [Symbol.for('quote'), 2], 3]),
    'read supports quote with even more whitespace': () => assert.deepStrictEqual(readSimple(" ( 1 '\n(1 2)  3 ) "), [1, [Symbol.for('quote'), [1, 2]], 3]),

    'read supports dot': () => assert.deepStrictEqual(readSimple("(1 . 2)"), new Pair(1, 2)),
    'read turns dotted pair into list if possible 1': () => assert.deepStrictEqual(readSimple("(1 . (2 3))"), [1, 2, 3]),
    'read turns dotted pair into list if possible 2': () => assert.deepStrictEqual(readSimple("((1) . (2 3))"), [[1], 2, 3]),
    'read turns dotted pair into list if possible 3': () => assert.deepStrictEqual(readSimple("(1 . ())"), [1]),
    'read does not support improper dot 1': () => assert.throws(() => readSimple("(1 . 2 3)")),
    'read does not support improper dot 2': () => assert.throws(() => readSimple("(1 2 . 3)")),
    'read does not support improper dot 3': () => assert.throws(() => readSimple(".")),


    // evaluate tests
    'evaluate evaulates a number': () => assert.strictEqual(evaluate(1), 1),
    'evaluate evaulates a boolean 1': () => assert.strictEqual(evaluate(true), true),
    'evaluate evaulates a boolean 2': () => assert.strictEqual(evaluate(false), false),
    'evaluate evaulates a string': () => assert.strictEqual(evaluate("hello world"), "hello world"),
    'evaluate evaluates a function': () => assert.strictEqual(Object.toString, Object.toString),
    'evaluate does not evaluate null': () => assert.throws(() => evaluate(null)),
    'evaluate does not evaluate undefined': () => assert.throws(() => evaluate(undefined)),
    'evaluate does not evaluate nothing': () => assert.throws(() => evaluate()),
    'evaluate does not evaluate a pair': () => assert.throws(() => evaluate(new Pair(1, 2))),

    'evaluate looks up a symbol': () => assert.strictEqual(evaluate(Symbol.for('symbol'), (s) => { assert.strictEqual(s, Symbol.for('symbol')); return "value" }), "value"),
    'evaluate invokes a function': () => assert.strictEqual(evaluate([Symbol.for('func')], () => () => "value"), "value"),
    'evaluate does evaluate arguments': () => evaluate([Symbol.for('func'), Symbol.for('a')], (p) => p == Symbol.for('a') ? "a" : (f) => assert.strictEqual(f, "a")),
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