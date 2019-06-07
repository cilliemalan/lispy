const { isArray, isNumber, isBoolean, isString, isSymbol, isNull, isFunction } = require('util');
const { Pair } = require('./reader');

const isPair = (a) => a instanceof Pair;

const evaluateLight = (expression, environment) => {
    if (isNumber(expression)) return expression;
    else if (isBoolean(expression)) return expression;
    else if (isString(expression)) return expression;
    else if (isPair(expression)) throw "Cannot evaluate a pair";
    else if (isNull(expression)) throw "Cannot evaluate null";
    else if (isArray(expression)) {
        var func = evaluateLight(expression[0], environment);
        if (!isFunction(func)) throw `cannot invoke non-function: ${func}`;
        return func.apply(null, expression.slice(1).map(x => evaluateLight(x, environment)));
    } else if (isSymbol(expression)) {
        return environment(expression);
    } else {
        throw `unsupported type of expression: ${expression}`;
    }
}

module.exports = { evaluateLight };