const moment = require('moment');
const __ = require('lodash');
const fs = require('fs');

// Uses moment unix timestamp to generate id
const generateId = () => {
    return moment().unix();
};

// get sub part of string and returns.
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

// Get id string from mongo Object id
const getMongoObjectIdAsString = (data) => {
    return __.get(data.resultObj, `${data.action.use}.upserted[0]._id`).toString();
}

// Update the object data
const updateData = (path, resultObj, value) => {
    return __.set(resultObj, path, value);
}

// Remove key value pair from provided object by passing array of keys to it
const removeObjectKeys = (dataObj, keys) => {
    return __.omit(dataObj, keys);
}

// Responsible to check whether provided value is object or not
const isObject = (val) => val && val.constructor && val.constructor.name === 'Object';


const removeFile = function (filePath) {
  try {
    fs.unlinkSync(filePath);
    console.log('File"' + filePath + '" removed!');     
  } catch (err) {
    console.log('File error: ', err);
  }
};

// Convert image to base64
const imgToBase64 = (path) => {
    return fs.readFileSync(path, 'base64');
};

module.exports = {
    generateId,
    getSubString,
    getMongoObjectIdAsString,
    updateData,
    removeObjectKeys,
    isObject,
    removeFile,
    imgToBase64,
};