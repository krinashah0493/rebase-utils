'use strict';

const mongoDB = require('./mongodb');

module.exports = {
  upsertDatabase,
  getById,
  getAllByFilter,
  removeById,
};

async function upsertDatabase(modelName, id, body, filterObj = null) {
  let models = mongoDB.getModel();
  let filter = filterObj || { id: id };
  try {
    return models[modelName].updateOne(
      filter,
      { "$set": body },
      { upsert: true, safe: false }
    );
  } catch (e) {
    console.log(e);
  }
}

async function getById(modelName, id, filterObj = null) {
  let models = mongoDB.getModel();
  let filter = filterObj || { id: id };

  try {
    return models[modelName].findOne(filter)
  } catch (e) {
    console.log(e);
  }
}

async function getAllByFilter(modelName, filterConditions, filterationQuery = { _id: 0},pageLength,pageNumber) {
  let models = mongoDB.getModel();
  
  try {
    return models[modelName].find(filterConditions, filterationQuery).limit(pageLength).skip((pageNumber-1)*pageLength)
  } catch (e) {
    console.log(e);
  }
}

async function removeById(modelName, query) {
  let models = mongoDB.getModel();
  try{
    return models[modelName].deleteOne(query);
  }catch (e){
    console.log(e);
  }
}