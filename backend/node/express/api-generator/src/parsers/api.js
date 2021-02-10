'use strict';
const _ = require('underscore');
const __ = require('lodash');
const mongoDB = require('../database/mongodb/mongodb');
const mongoParser = require('./mongo');
const { functionParser } = require('./function');
const dbUtil = require('../database/mongodb/utils');
const functionUtils = require('../functionStore');
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

const returnDataForOperations = (type = '', reqData, currentData) => {
    switch(type){
        case 'apiReqBody':
            return reqData.body;
        case 'apiReqParams':
            return reqData.query;
        default:
            return currentData;
    }
};

const returnUserActionResult = (type, data, customFunctionObject) => {
    const inputData = data.action.customFunction ? data.resultObj : data;
    const keyType = data.action.customFunction ? data.action.customFunction : type;
    return customFunctionObject[keyType](inputData);
}

const executeUserActions = async (actions, result, customFunctionObject) => {
    console.log(actions);
    if(actions && Array.isArray(actions) && actions.length > 0){
        const parallelOperations = __.map(actions, (action) => returnUserActionResult(action.operation, {resultObj: result, action}, customFunctionObject));
        const parallelOperationsResult = await Promise.all(parallelOperations);
        for(let j=0; j<actions.length; j++){
            const action = actions[j];
            // const value = await returnUserActionResult(action.operation, {resultObj: result, action});
            action.modify && await customFunctionObject['updateData'](action.modify, result, parallelOperationsResult[j]);
            action.saveAt && await customFunctionObject['updateData'](action.saveAt, result, parallelOperationsResult[j]);
        }
    }else if(actions && !_.isEmpty(actions)){
        console.log(actions);
        const value = await returnUserActionResult(actions.operation, {resultObj: result, action: actions}, customFunctionObject);
        actions.modify && await customFunctionObject['updateData'](actions.modify, result, value);
        actions.saveAt && await customFunctionObject['updateData'](actions.saveAt, result, value);
    }
}

const performOperations = async (tasks, reqData, customFunctionObject) => {
    let result = {};
    for(let i=0; i<tasks.length; i++){
        result = returnDataForOperations(tasks[i].use, reqData, result);
        const actions = tasks[i].actions;
        if(tasks[i].add){
            result = {...result, ...tasks[i].add};
        }else if(tasks[i].remove){
            result = customFunctionObject['removeObjectKeys'](result, tasks[i].remove);
        }
        if('condition' in tasks[i] && !(customFunctionObject['isStorePresent'](result))){
            return tasks[i].message || result;
        }else{
            await executeUserActions(actions, result, customFunctionObject);
            if(tasks[i].value){
                result = tasks[i].value;
            }
        }
    };
    return result;
};

const generateEndpoint = (apps, methodKey, base, path, functions, tasks, customFunctionObject) => {
    return apps[methodKey](base+path, async(req, res) => {
        try{
            let data = null;
            if(tasks && tasks.length > 0){
                data = await performOperations(tasks, req, customFunctionObject);
            }
            // if(functions && functions.length > 0){
            //     data = await executeFunctionsOfEndpoint(functions, req);
            // }
            res.status(200).json({success: true, data});
        }catch(err){
            console.log({[base+path]: err});
            res.status(500).json({success: false, message: err});
        }
    });
}

const routeMapper = (jsonData, apps, customObject) => {
    if(!_.isEmpty(jsonData.db) && jsonData.db.mongo && !_.isEmpty(jsonData.db.mongo)){
        jsonData.db.mongo.models = customObject[jsonData.db.mongo.models];
        mongoDB.initialize(jsonData.db.mongo);
    }else{
        console.log('No mongo service');
    }
    jsonData.endpoints.map(apiObj => {
        const {
            base,
            routes,
        } = apiObj;
        const functionsObj = {...functionUtils, ...customObject, mongo: mongoParser.mongoWrapperFunction};
        routes.map(route => {
            const { path, methods } = route;
            _.map(methods, (method, methodKey) => {
                const { functions } = method;
                if(validMethods.includes(methodKey)){
                    generateEndpoint(apps, methodKey, base, path, functions, method, functionsObj);
                }else{
                    console.log({error: `Check method value of enpoint "${base+path}"`});
                    return;
                }
            });
        });
    });
}

module.exports = { routeMapper };