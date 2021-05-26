'use strict';
const dbUtil = require('../database/mongodb/utils');
const __ = require('lodash');
const {isObject} = require('../functionStore');

// Perform mongo db operation based on get, upsert and delete keywords
const performMongoAction = async (dbValue) => {
    try{
        switch(dbValue.type){
            case 'get':
                console.log('DB mongo get: ', dbValue);
                const getResult = await dbUtil.getAllByFilter(dbValue.modelName, dbValue.query || {});
                console.log(getResult);
                return getResult;
                
            case 'upsert':
                console.log('DB mongo upsert: ', dbValue);
                const upsertResult = await dbUtil.upsertDatabase(dbValue.modelName, dbValue.data.id || null, dbValue.data.value, dbValue.query || null);
                return upsertResult;
            
            case 'delete':
                console.log('DB mongo delete: ', dbValue);
                const deleteResult = await dbUtil.removeById(dbValue.modelName, dbValue.query);
                return 'Deleted';
            default:
                return;
        }
    }catch(err){
        console.log(`Error for model "${dbValue.modelName}": ${err}`);
        return {
            modelName: dbValue.modelName,
            action: type,
            error: err
        }
    }
}

// This is a wrapper function for mongo which passes the valid values to mongo functions to get result
const mongoWrapperFunction = (data) => {
    let query = {};
    let dbData = null;
    const mongoData = data.action.values;
    if(mongoData.query){
        query[mongoData.query] = isObject(data.resultObj) ? __.get(data.resultObj, mongoData.use) : data.resultObj;
    }
    if(mongoData.on && mongoData.use){
        dbData = {id: __.get(data.resultObj, mongoData.on), value: __.get(data.resultObj, mongoData.use)};
    }else if(mongoData.use && !mongoData.query){
        dbData = {id: __.get(data.resultObj, 'id'), value: __.get(data.resultObj, mongoData.use)};
    }else if(mongoData.use && mongoData.query){
        dbData = {value: data.resultObj}
    }else{
        dbData = {id: __.get(data.resultObj, 'id'), value: data.resultObj};
    }
    return performMongoAction({type: mongoData.type, modelName: mongoData.modelName, ...(!__.isEmpty(query) && {query}), data: dbData});
}

module.exports = {
    performMongoAction,
    mongoWrapperFunction
}
