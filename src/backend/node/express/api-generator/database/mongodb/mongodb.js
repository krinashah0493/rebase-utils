const mongoose = require('mongoose');
const _ = require('underscore');

let models = {
};

function getModel() {
  return models;
}

function initialize(db) {
  mongoose.connect(
    `${db.uri}/${db.name}`,
    {
      useUnifiedTopology: true,
      useNewUrlParser: true,
    }
  )
  .then(res => console.log('Mongo running on port: '+res.connection.port));

  _.each(db.models, (model, key) => models[key] = mongoose.model(`${key}`, new mongoose.Schema(db.models[key])));
  console.log(models);
}

module.exports = {
  initialize,
  getModel,
}