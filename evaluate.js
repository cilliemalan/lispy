const { isArray, isNumber, isBoolean, isString, isSymbol, isFunction } = require('util');

const evaluate = (expression, environment) => {
    if (isNumber(expression)) return expression;
    else if (isBoolean(expression)) return expression;
    else if (isString(expression)) return expression;
    else if (isSymbol(expression)) return environment(expression);
    else if (isArray(expression)) {
        var [rator, ...rand] = expression;
        if (rator === Symbol.for('and')) {

        } else if (rator === Symbol.for('or')) {

        } else if (rator === Symbol.for('lambda')) {

        } else {
            var func = evaluate(rator, environment);

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