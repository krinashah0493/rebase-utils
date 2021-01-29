"use strict";

const jsonBody = require("../../config/dbGenerator.json");
const mongoose = require("mongoose");
const devJson = require("../../config/dev.json");

let models = {};

const getModel = () => models;
// console.log(config.get('mongoDB'),config.get('databaseName'));
const initialize = async () => {
  const typeOfDB = jsonBody.projectSchema.type;
  if (typeOfDB === "mongo") {
    const response = await mongoose.connect(
      `${devJson.mongoDB}/${devJson.databaseName}`,
      {
        useUnifiedTopology: true,
        useNewUrlParser: true,
      }
    );

    let collections = jsonBody.projectSchema.collection;

    collections.forEach((collection) => {
      if (collection.collection_name) {
        let modelName = `${collection.collection_name}models`;
        let collectionName = collection.collection_name;
        delete collection.collection_name;
        console.log(collectionName, collection, modelName);

        models[modelName] = mongoose.model(
          collectionName,
          new mongoose.Schema(collection)
        );
      } else {
        res.status(400)
      }
    });
  }
};

module.exports = {
  initialize,
  getModel,
};
