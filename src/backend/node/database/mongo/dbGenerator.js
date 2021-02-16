"use strict";

const mongoose = require("mongoose");
const __ = require('lodash');
const parser=require("./parser")
// const config=require("config")

let models = {};
// const user = config.get("user");
// const port = config.get("port");
// const password = encodeURIComponent(config.get("password"));
// const databaseName = config.get("databaseName");
// const host = config.get("host");

const getModel = () => models;
const initialize = async (jsonBody) => {
  const body = {};
  for (var [key, value] of Object.entries(jsonBody)) {
    body[key] = typeof value;
  }
  const typeOfDB = __.keys(jsonBody);
  console.log(typeOfDB);
  for(let i = 0; i < typeOfDB.length; i++){
    if (typeOfDB[i] === "mongo") {
      const response = await mongoose.connect(
        `${jsonBody.mongo.uri}/${jsonBody.mongo.name}`,
        {
          useUnifiedTopology: true,
          useNewUrlParser: true,
          useCreateIndex: true,
        }
      );
      const collections = [parser(jsonBody.mongo.models)];
      console.log(collections);
      collections.forEach((collection) => {
        if (collection.collection_name) {
          let modelName = `${collection.collection_name}`;
          let collectionName = collection.collection_name;
          delete collection.collection_name;
  
          models[modelName] = mongoose.model(
            collectionName,
            new mongoose.Schema(collection)
          );
        } else {
          console.log("No Collection name");
        }
      });
    }
  } 
  console.log(models);
};


module.exports = {
  initialize,
  getModel,
};