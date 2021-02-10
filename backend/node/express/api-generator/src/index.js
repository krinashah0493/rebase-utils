'use strict';

const express = require('express');
const app = express();
const { apis, createPaymentObject, createUserObject, isStorePresent, encodeId } = require('./apiModels/apis');
const { routeMapper } = require('./parsers/api');
const linkHasher = require('./apiModels/link-hasher');
const jsonData = require('./apiModels/api.json');
const mongoModels = require('./database/mongodb/models');
app.use(express.json());
linkHasher.initEncoderSchema();
module.exports = { routeMapper };

// routeMapper(jsonData, app, {
//     mongoModels,
//     createPaymentObject,
//     createUserObject,
//     isStorePresent,
//     encodeId
// });

// app.listen(2660, () => console.log('Listening to port 2660'));
