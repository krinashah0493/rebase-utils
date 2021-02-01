const _ = require('underscore');
const mongoDB = require('../database/mongodb/mongodb');
const mongoParser = require('./mongo');
const { functionParser } = require('./function');
const dbUtil = require('../database/mongodb/utils');
const validMethods = ['get', 'post', 'patch', 'delete'];
const functionObj = {
    mongo: mongoParser.performMongoAction
};

const executeFunctionsOfEndpoint = async (functions, reqData) => {
    const { body, params } = reqData;
    let result = null;
    // console.log(body);
    for(let i = 0; i < functions.length; i++){
        const currFunc = functions[i];
        if(currFunc.type === 'customWithDB'){
            currFunc.params.req = reqData;
            const paramsValues = _.values(currFunc.params);
            paramsValues.push(dbUtil);
            const generatedFunction = await functionParser(currFunc);
            return await generatedFunction(...paramsValues);
        }else if(_.isArray(currFunc.operation)){
            const  operationReq = [...(result !== null && [result])];
            currFunc.operation.map(obj => {
                if(currFunc.type === 'db'){
                    if(obj.query === 'prev') obj.query = result;
                    else if(obj.data === 'req') obj.data = body;
                    else if(obj.query === 'params') obj.query = params;
                    operationReq.push(functionObj[currFunc[currFunc.type]](obj));
                }else{
                    operationReq.push(obj());
                }       
            });
            result = await Promise.all(operationReq);
        }else{
            if(currFunc.type === 'db'){
                const obj = {...currFunc.operation};
                if(obj.query === 'prev') obj.query = result;
                else if(obj.data === 'req') obj.data = body;
                else if(obj.query === 'params') obj.query = params;
                result = await functionObj[currFunc[currFunc.type]](obj);
            }else{
                result = currFunc.operation(result);
            }
        }
        
    }
    return result;
}

const generateEndpoint = (apps, methodKey, base, path, functions) => {
    return apps[methodKey](base+path, async(req, res) => {
        try{
            let data = null;
            if(functions && functions.length > 0){
                data = await executeFunctionsOfEndpoint(functions, req);
            }
            res.status(200).json({success: true, data});
        }catch(err){
            console.log({[base+path]: err});
            res.status(500).json({success: false, message: err});
        }
    });
}

const routeMapper = (jsonData, apps) => {
    if(!_.isEmpty(jsonData.db) && jsonData.db.mongo && !_.isEmpty(jsonData.db.mongo)){
        mongoDB.initialize(jsonData.db.mongo);
    }else{
        console.log('No mongo service');
    }
    jsonData.endpoints.map(apiObj => {
        const {
            base,
            routes,
        } = apiObj;

        routes.map(route => {
            const { path, methods } = route;
            _.map(methods, (method, methodKey) => {
                const { functions } = method;
                if(validMethods.includes(methodKey)){
                    generateEndpoint(apps, methodKey, base, path, functions);
                }else{
                    console.log({error: `Check method value of enpoint "${base+path}"`});
                    return;
                }
            });
        });
    });
}

module.exports = { routeMapper };