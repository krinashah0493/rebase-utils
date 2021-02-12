const moment = require('moment');
const __ = require('lodash');

const generateId = () => {
    return moment().unix();
};

const getSubString = (data) => {
    const string = __.get(data.resultObj, data.action.use);
    const indexes = data.action.indexes;
    if(string && !__.isEmpty(indexes)){
        return string.substr(indexes.from,indexes.to);
    }else if(!string){
        return 'String missing'
    }else{
        return 'Indexes missing';
    }
};

const getMongoObjectIdAsString = (data) => {
    return __.get(data.resultObj, `${data.action.use}.upserted[0]._id`).toString();
}

const updateData = (path, resultObj, value) => {
    return __.set(resultObj, path, value);
}

const removeObjectKeys = (dataObj, keys) => {
    return __.omit(dataObj, keys);
}

const isObject = (val) => val && val.constructor && val.constructor.name === 'Object';

module.exports = {
    generateId,
    getSubString,
    getMongoObjectIdAsString,
    updateData,
    removeObjectKeys,
    isObject,
};