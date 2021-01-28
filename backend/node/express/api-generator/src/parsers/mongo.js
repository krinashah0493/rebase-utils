'use strict';
const dbUtil = require('../database/mongodb/utils')

const performMongoAction = async (dbValue) => {
    try{
        switch(dbValue.type){
            case 'get':
                console.log('DB mongo get: ', dbValue);
                const getResult = await dbUtil.getAllByFilter(dbValue.modelName, dbValue.query || {});
                return getResult;
                
            case 'upsert':
                console.log('DB mongo upsert: ', dbValue);
                const upsertResult = await dbUtil.upsertDatabase(dbValue.modelName, dbValue.data.id, dbValue.data, dbValue.query || null);
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

module.exports = {
    performMongoAction
}
