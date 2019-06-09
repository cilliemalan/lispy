const { isArray, isNumber, isBoolean, isString, isSymbol, isFunction } = require('util');

const evaluate = (expression, environment) => {
    if (isNumber(expression)) return expression;
    else if (isBoolean(expression)) return expression;
    else if (isString(expression)) return expression;
    else if (isSymbol(expression)) return environment(expression);
    else if (isArray(expression)) {
        var func = evaluate(expression[0], environment);
        if (isFunction(func)) {
            return func.apply(null, expression.slice(1).map(x => evaluate(x, environment)));
        }
        else {
            throw `cannot invoke non-function: ${func}`;
        }
    }
    else {
        throw `cannot evaluate the expression: ${expression}`;
    }
}

module.exports = { evaluate };