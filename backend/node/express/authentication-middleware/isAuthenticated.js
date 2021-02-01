const jwt = require('jsonwebtoken');
const { initRegex } = require('./regex');
let regExpArray;
let authSchema;

const initAuth = schemaPath => {
    authSchema = require(schemaPath);
    initRegex(authSchema);
    regExpArray = require('./regex').regexArray;
}

const isAuthenticated = (req, res, next) => {
    let match;
    let matchedEndpoint;
    const path = req.path.split('?')[0];
    regExpArray.every((regExp, index) => {
        match = regExp.exec(path);
        if(match)
            matchedEndpoint = authSchema.apiEndpoints[index];
        return !match;
    });
    console.log('[MATCHED ENDPOINT] - ', matchedEndpoint);
    if(!matchedEndpoint)
        return res.status(404).json({message: 'Invalid route. Please enter a valid route..'});
    if(!matchedEndpoint.methods[req.method])
        return res.status(404).json({message: 'Method not allowed...'});
    if(!matchedEndpoint.methods[req.method].authRequired)
        return next();
    const token = req.get('Authorization');
    let tokenOG;
    let error;
    try {
        tokenOG = jwt.verify(token, 'secretKey');
    }
    catch(err) {
        console.log(err);
        error = err;
        return res.status(403).json({message: 'Authentication Failed! Please login with valid credentials'});
    }
    req.header.userId = tokenOG.userId;
    req.header.role = tokenOG.role;
    if(!matchedEndpoint.roles.includes(tokenOG.role))
        return res.status(403).json({message: 'User not allowed!!'});
    next();
}

module.exports = {
    isAuthenticated,
    initAuth
};