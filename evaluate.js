const { isArray, isNumber, isBoolean, isString, isSymbol, isFunction } = require('util');

const evaluate = (expression, environment) => {
    if (isNumber(expression)) return expression;
    else if (isBoolean(expression)) return expression;
    else if (isString(expression)) return expression;
    else if (isSymbol(expression)) return environment(expression);
    else if (isArray(expression)) {
        const [rator, ...rand] = expression;
        if (rator === Symbol.for('and')) {
            if (rand.length == 0) return true;
            for (let i = 0; i < rand.length; i++) {
                if (evaluate(rand[i], environment) === false) return false;
            }
            return true;
        } else if (rator === Symbol.for('or')) {
            if (rand.length == 0) return false;
            for (let i = 0; i < rand.length; i++) {
                if (evaluate(rand[i], environment) !== false) return true;
            }
            return false;
        } else if (rator === Symbol.for('if')) {
            if (rand.length == 0) return false;
            const [c, t, e, ...nothing] = rand;
            if (nothing.length != 0) throw "if can have at most a then and an else clause";
            if (evaluate(c, environment)) {
                return evaluate(t, environment);
            } else {
                if (e === undefined) return undefined;
                else evaluate(e, environment);
            }
        } else if (rator === Symbol.for('lambda')) {
            const [arguments, ...bodies] = rand;
            if (bodies.length === 0) throw "lambda must have at least one body";
            if (arguments.filter(a => !isSymbol(a)).length != 0) throw "arguments must be a list of symbols";
            const argumentIndexMap = new Map(arguments.map((a, i) => [a, i]));
            return (...arguments) => {
                const newEnvironment = (s) => argumentIndexMap.has(s)
                    ? arguments[argumentIndexMap.get(s)]
                    : environment(s);
                let result;
                for (body in bodies) {
                    result = evaluate(body, newEnvironment);
                }
                return result;
            }
        } else {
            const func = evaluate(rator, environment);

            if (isFunction(func)) {
                var args = rand.map(r => evaluate(r, environment));
                return func.apply(null, args);
            } else {
                throw `cannot invoke non-function: ${rator}`;
            }
        }
    }
    else {
        throw `cannot evaluate the expression: ${expression}`;
    }
}

module.exports = { evaluate };