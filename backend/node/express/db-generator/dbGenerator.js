"use strict";

const mongoose = require("mongoose");
const devJson = require("../../config/dev.json");
const parser=require("../../parser/parser")

let models = {};

const getModel = () => models;
const initialize = async (jsonBody) => {
  const body = {};
  for (var [key, value] of Object.entries(jsonBody)) {
    body[key] = typeof value;
  }

  const typeOfDB = jsonBody.projectSchema.type;
  if (typeOfDB === "mongo") {
    const response = await mongoose.connect(
      `${devJson.mongoDB}/${devJson.databaseName}`,
      {
        useUnifiedTopology: true,
        useNewUrlParser: true,
        useCreateIndex: true,
      }
    );
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
