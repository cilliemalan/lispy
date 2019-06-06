const { isArray, isNumber, isBoolean, isString } = require('util');


const evaluate = (expression) => {
    if (isNumber(expression)) return expression;
    else if (isBoolean(expression)) return expression;
    else if (isString(expression)) return expression;
}

module.exports = { evaluate };