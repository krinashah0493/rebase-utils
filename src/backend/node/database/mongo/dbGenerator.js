"use strict";

const mongoose = require("mongoose");
const devJson = require("");
const parser=require("./parser")
const config=require("config")

let models = {};
const user = config.get("user");
const port = config.get("port");
const password = encodeURIComponent(config.get("password"));
const databaseName = config.get("databaseName");
const host = config.get("host");
const uri=config.get("uri")

const getModel = () => models;
const initialize = async (jsonBody) => {
  const body = {};
  for (var [key, value] of Object.entries(jsonBody)) {
    body[key] = typeof value;
  }
  const typeOfDB = jsonBody.projectSchema.type;
  if (typeOfDB === "mongo") {
    if(user && password && host && port){
      await mongoose.connect(
        `mongodb://${user}:${password}@${host}:${port}/${databaseName}`,
        {
          useUnifiedTopology: true,
          useNewUrlParser: true,
          useCreateIndex: true,
        }
      );
    }else if(!user || !password || !host || !port){
       await mongoose.connect(
        `${uri}/${databaseName}`,
        {
          useUnifiedTopology: true,
          useNewUrlParser: true,
          useCreateIndex: true,
        }
      );
    }else{
      return "Create a  config file with proper credentials and paramters"
    }
    
    const collections = [parser(jsonBody.projectSchema.collection)];
    collections.forEach((collection) => {
      if (collection.collection_name) {
        let modelName = `${collection.collection_name}models`;
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
};


module.exports = {
  initialize,
  getModel,
};