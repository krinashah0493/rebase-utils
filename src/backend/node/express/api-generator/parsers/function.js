// This file currently not in use kept for reference

const _ = require('underscore');
function insert(str, index, value) {
    return str.substr(0, index) + value + str.substr(index);
}

// Consist of js string for db
const dbObj = {
    mongo:{
        get: "await dbUtil.getAllByFilter(modelName, query || {})",
        upsert: "await dbUtil.upsertDatabase(modelName, upsertDBId, upsertDBBody)",
    }
}

/**
 * Generates a function by taking user function as string and replace keywords with double quotes to js string
 * and creates a function by creating anonymous function.
 */

const functionParser = async (dataObj) => {
    let stringFunc = dataObj.func.toString();
    const dataObjKeys = _.keys(dataObj.operation);
    for(let i = 0; i < dataObjKeys.length; i++){
        const operationObj = dataObj.operation[dataObjKeys[i]];
        let dbStr = dbObj[operationObj[operationObj.type]][operationObj.operation.type];
        stringFunc = stringFunc.replace(dataObjKeys[i], dbStr);
        stringFunc = stringFunc.replace('query', operationObj.operation.query);
        stringFunc = stringFunc.replace('modelName', `'${operationObj.operation.modelName}'`);
        if(operationObj.operation.type === 'upsert'){
            stringFunc = stringFunc.replace('upsertDBId', operationObj.operation.data.id);
            stringFunc = stringFunc.replace('upsertDBBody', operationObj.operation.data.value);
        }
    }
    const paramKeys = _.keys(dataObj.params);
    paramKeys.push('dbUtil');
    stringFunc = insert(stringFunc, stringFunc.indexOf(")"), paramKeys.join(','));
    stringFunc = stringFunc.replace(/["]+/g, '');
    stringFunc = new Function("return "+stringFunc)();
    return stringFunc;
};

module.exports = { functionParser };
