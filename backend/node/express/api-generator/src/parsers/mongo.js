'use strict';
const dbUtil = require('../database/mongodb/utils');
const __ = require('lodash');

const performMongoAction = async (dbValue) => {
    try{
        switch(dbValue.type){
            case 'get':
                // console.log('DB mongo get: ', dbValue);
                const getResult = await dbUtil.getAllByFilter(dbValue.modelName, dbValue.query || {});
                return getResult;
                
            case 'upsert':
                // console.log('DB mongo upsert: ', dbValue);
                const upsertResult = await dbUtil.upsertDatabase(dbValue.modelName, dbValue.data.id, dbValue.data.value, dbValue.query || null);
                return upsertResult;
            
            case 'delete':
                // console.log('DB mongo delete: ', dbValue);
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

const mongoWrapperFunction = (data) => {
    let query = {};
    let dbData = null;
    const mongoData = data.action.values;
    if(mongoData.query && mongoData.use){
        query[mongoData.query] = __.get(data.resultObj, mongoData.use);
    }
    if(mongoData.on && mongoData.use){
        dbData = {id: __.get(data.resultObj, mongoData.on), value: __.get(data.resultObj, mongoData.use)};
    }else if(mongoData.use){
        dbData = {id: __.get(data.resultObj, 'id'), value: __.get(data.resultObj, mongoData.use)};
    }else{
        dbData = {id: __.get(data.resultObj, 'id'), value: data.resultObj};
    }
    return performMongoAction({type: mongoData.type, modelName: mongoData.modelName, ...(!__.isEmpty(query) && {query}), data: dbData});
}

module.exports = {
    performMongoAction,
    mongoWrapperFunction
}
