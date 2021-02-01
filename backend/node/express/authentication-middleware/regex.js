let authSchema;

let tempPath = '';

const initRegex = schemaPath => {
    authSchema = require(schemaPath);
}

const regexArray = authSchema.apiEndpoints.map(endpoint => {
    tempPath = endpoint.path;
    if(tempPath.includes(':')) {
        tempPath = tempPath.split(':')[0] + '([a-zA-Z0-9]+)';
    }
    tempPath = tempPath + '[\/]?$';
    return new RegExp(tempPath);
});

module.exports = {
    regexArray,
    initRegex
};