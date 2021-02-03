class RegexApiEndpoints {
    constructor(authSchema) {
        this.authSchema = authSchema;
    }

    getRegExpArray = () => {
        let tempPath = '';
        const regexArray = this.authSchema.apiEndpoints.map(endpoint => {
            tempPath = endpoint.path;
            if(tempPath.includes(':')) {
                tempPath = tempPath.split(':')[0] + '([a-zA-Z0-9]+)';
            }
            tempPath = tempPath + '[\/]?$';
            return new RegExp(tempPath);
        });
        return regexArray;
    }
}

module.exports = RegexApiEndpoints;