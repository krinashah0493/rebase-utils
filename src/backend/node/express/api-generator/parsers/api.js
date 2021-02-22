'use strict';
const _ = require('underscore');
const __ = require('lodash');
const mongoDB = require('../../../database/mongo/dbGenerator');
const mongoDBParser = require('../../../database/mongo/parser');
const mongoParser = require('./mongo');
const functionUtils = require('../functionStore');
const validMethods = ['get', 'post', 'patch', 'delete'];
const uploadFiles = require('../file-upload');

// Responsible to return data which will be used in further function operations
const returnDataForOperations = (type = '', reqData, currentData) => {
    switch(type){
        case 'apiReqForm':
            return reqData;
        case 'apiReqBody':
            return reqData.body;
        case 'apiReqQuery':
            return reqData.query;
        case 'apiReqParams':
            return reqData.params.id;
        default:
            return currentData;
    }
};

// Responsible to select and return a function based on data and key type for ongoing operation
const returnUserActionResult = (type, data, customFunctionObject) => {
    const inputData = data.action.customFunction ? data.resultObj : data;
    const keyType = data.action.customFunction ? data.action.customFunction : type;
    
        return customFunctionObject[keyType](inputData);
    
}

/**
 * This function responsiblity to perform either single or parallel function execution.
 * If actions is an array then its a parallel else it will be single
 * If user provided modify or saveAt key then this will overwrite result to those provided keys
 */
const executeUserActions = async (actions, result, customFunctionObject) => {
    if(actions && Array.isArray(actions) && actions.length > 0){
        const parallelOperations = __.map(actions, (action) => returnUserActionResult(action.operation, {resultObj: result, action}, customFunctionObject));
        const parallelOperationsResult = await Promise.all(parallelOperations);
        for(let j=0; j<actions.length; j++){
            const action = actions[j];
            action.modify && await customFunctionObject['updateData'](action.modify, result, parallelOperationsResult[j]);
            action.saveAt && await customFunctionObject['updateData'](action.saveAt, result, parallelOperationsResult[j]);
        }
    }else if(actions && !_.isEmpty(actions)){
        let value = await returnUserActionResult(actions.operation, {resultObj: result, action: actions}, customFunctionObject);
        actions.modify && customFunctionObject['updateData'](actions.modify, result, value);
        actions.saveAt && customFunctionObject['updateData'](actions.saveAt, result, value);
        if(actions.operation === 'uploadFiles'){
            value = {
                ...value.body,
                ...(actions.saveAt && {[actions.saveAt]: result[actions.saveAt][actions.fileType]}),
                ...(actions.modify && {[actions.modify]: result[actions.modify][actions.fileType]}),
            }
        }
        return value;
    }else{
        return result;
    }
}

/**
 * This function maps to get, post, patch, delete array value from json and return result.
 * Calls returnDataForOperations() to get intial result to perform further operations.
 * Checks if add key is available or not so that it can add keys to existing data.
 * Checks if remove key exist so that it can remove keys from existing object data.
 * If condition key is present in operation and if its true then it will perform further 
 * operation or it will return false or error message provided by user.
 * Checks for value key if it exist then it will return that else by default it will return the operational data.
 */
const performOperations = async (methodKey, tasks, reqData, customFunctionObject) => {
    let result = {};
    for(let i=0; i<tasks.length; i++){
        result = returnDataForOperations(tasks[i].use, reqData, result);
        const actions = tasks[i].actions;
        if(tasks[i].add){
            result = {...result, ...tasks[i].add};
        }else if(tasks[i].remove){
            result = customFunctionObject['removeObjectKeys'](result, tasks[i].remove);
        }
        if('condition' in tasks[i] && !(customFunctionObject[tasks[i].condition](result))){
            return tasks[i].message || result;
        }else{
            if(methodKey === 'get' || actions.operation === 'uploadFiles'){
                result = await executeUserActions(actions, result, customFunctionObject);
            }else{
                await executeUserActions(actions, result, customFunctionObject);
            }
            if(tasks[i].value){
                result = tasks[i].value;
            }
        }
    };
    return result;
};

/**
 * This function responsibility to generate endpoints by using methodkey which consist of names like get, post, patch, delete
 * and uses the express app provided to it, path of endpoint and customFunctionObject which has generic and custom function
 */
const generateEndpoint = (apps, methodKey, base, path, tasks, customFunctionObject) => {
    if(methodKey === 'post'){
        return apps[methodKey](base+path, async(req, res) => {
            try{
                let data = null;
                if(tasks && tasks.length > 0){
                    data = await performOperations(methodKey, tasks, req, customFunctionObject);
                }
                res.status(200).json({success: true, data});
            }catch(err){
                console.log({[base+path]: err});
                res.status(500).json({success: false, message: err});
            }
        });
    }else{
        return apps[methodKey](base+path, async(req, res) => {
            try{
                let data = null;
                if(tasks && tasks.length > 0){
                    data = await performOperations(methodKey, tasks, req, customFunctionObject);
                }
                res.status(200).json({success: true, data});
            }catch(err){
                console.log({[base+path]: err});
                res.status(500).json({success: false, message: err});
            }
        });
    }
}

/**
 * This is root level function which initializes mongo and merges and return generic functions and custom user function
 * for further operations and it maps over to the methods and checks if its valid method name or not.
 */
const routeMapper = (jsonData, apps, customObject) => {
    // apps.use('/v1/uploadss', saveFile);
    if(!_.isEmpty(jsonData.db) && jsonData.db.mongo && !_.isEmpty(jsonData.db.mongo)){
        // jsonData.db.mongo.models = customObject[jsonData.db.mongo.models];
        mongoDB.initialize(jsonData.db);
    }else{
        console.log('No mongo service');
    }
    apps.get('/models', (req, res) => {
        const frontEndModels = mongoDBParser(jsonData.db.mongo.models, 'FrontEnd');
        res.status(200).json({success: true, data: frontEndModels})
    });
    
    apps.post('/v1/uploadss', function(req, res) {
        uploadFiles(req, {})
        .then(resData => {
            res.status(200).json(resData);
        })
        .catch(err => res.status(403).json(err));
    });
    jsonData.endpoints.map(apiObj => {
        const {
            base,
            routes,
        } = apiObj;
        const functionsObj = {...functionUtils, ...customObject, mongo: mongoParser.mongoWrapperFunction, uploadFiles};
        routes.map(route => {
            const { path, methods } = route;
            _.map(methods, (method, methodKey) => {
                if(validMethods.includes(methodKey)){
                    generateEndpoint(apps, methodKey, base, path, method, functionsObj);
                }else{
                    console.log({error: `Check method value of enpoint "${base+path}"`});
                    return;
                }
            });
        });
    });
}

module.exports = { routeMapper };