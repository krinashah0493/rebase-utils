'use strict';

const express = require('express');
const app = express();
const { apis, createPaymentObject, createUserObject, isStorePresent, encodeId } = require('./apiModels/apis');
const { routeMapper } = require('../../../../../src/backend/node/express/api-generator');
const linkHasher = require('./apiModels/link-hasher');
const jsonData = require('./apiModels/api.json');
const mongoModels = require('./database/mongodb/models');

// for parsing application/json
app.use(express.json()); 

// for parsing application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true })); 

// for parsing multipart/form-data


// app.use(upload.fields(mediaFields)); 
linkHasher.initEncoderSchema();

routeMapper(jsonData, app, {
    mongoModels,
    createPaymentObject,
    createUserObject,
    isStorePresent,
    encodeId
});

app.listen(2660, () => console.log('Listening to port 2660'));
