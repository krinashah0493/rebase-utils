const jwt = require('jsonwebtoken');
const RegexApiEndpoints = require('./regex');
class Authentication {
    constructor(authSchema) {
        this.authSchema = authSchema;
    }

    initAuth = () => {
        const regex = new RegexApiEndpoints(this.authSchema);
        this.regExpArray = regex.getRegExpArray();
        console.log(this.regExpArray);
    }

    isAuthenticated = (req, res, next) => {
        let match;
        let matchedEndpoint;
        const path = req.path.split('?')[0];
        this.regExpArray.every((regExp, index) => {
            match = regExp.exec(path);
            // console.log('[REGEX] - ', regExp, '[req PATH] - ', req.path);
            if(match)
                matchedEndpoint = this.authSchema.apiEndpoints[index];
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

}

module.exports = Authentication;