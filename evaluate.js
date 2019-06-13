const { isArray, isSymbol, isFunction } = require('util');

const s = (x) => Symbol.for(x);

const evaluateInvocation = (expression, environment) => {
    const [rator, ...rand] = expression;

    switch (rator) {
        case s('and'):
            if (rand.length == 0) return true;
            for (let i = 0; i < rand.length; i++) {
                if (evaluate(rand[i], environment) === false) return false;
            }
            return true;
        case s('or'):
            if (rand.length == 0) return false;
            for (let i = 0; i < rand.length; i++) {
                if (evaluate(rand[i], environment) !== false) return true;
            }
            return false;
        case s('if'):
            if (rand.length == 0) return false;
            const [c, t, e, ...nothing] = rand;
            if (nothing.length != 0) throw "if can have at most a then and an else clause";
            if (evaluate(c, environment)) {
                return evaluate(t, environment);
            } else {
                if (e === undefined) return undefined;
                else return evaluate(e, environment);
            }
            break;
        case s('cond'):
            if (rand.length == 0) throw "must specify at least one cond clause";
            if (rand.filter(c => !isArray(c) || c.length < 2).length) throw "cond clause must be a list with at least two entries";
            for (let i = 0; i < rand.length; i++) {
                const [test, ...tail] = rand[i];
                let testResult;
                if (i === rand.length - 1 && test === s('else')) testResult = true;
                else testResult = evaluate(test, environment) !== false;
                if (testResult) {
                    let result;
                    tail.forEach(body => result = evaluate(body, environment));
                    return result;
                }
            }
            return undefined;
        case s('lambda'):
            const [arguments, ...bodies] = rand;
            if (bodies.length === 0) throw "lambda must have at least one body";
            if (arguments.filter(a => !isSymbol(a)).length != 0) throw "arguments must be a list of symbols";
            const argumentIndexMap = new Map(arguments.map((a, i) => [a, i]));
            return (...arguments) => {
                const newEnvironment = (s) => argumentIndexMap.has(s)
                    ? arguments[argumentIndexMap.get(s)]
                    : environment(s);
                let result;
                bodies.forEach(body => result = evaluate(body, newEnvironment));
                return result;
            }
            break;
        case s('quote'):
            if (rand.length !== 1) throw "quote can only have one argument";
            return rand[0];
            break;
        default:
            const func = evaluate(rator, environment);

            if (isFunction(func)) {
                var args = rand.map(r => evaluate(r, environment));
                return func.apply(null, args);
            } else {
                throw `cannot invoke non-function: ${rator}`;
            }
    }
}

const evaluate = (expression, environment) => {
    if (isSymbol(expression)) return environment(expression);
    else if (isArray(expression)) return evaluateInvocation(expression, environment);
    else return expression;
}

module.exports = { evaluate };