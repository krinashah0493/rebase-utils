const mongoModels = require('../database/mongodb/models');
const linkHasher = require('./link-hasher');
const moment = require('moment');
const operation = () => {
    return {name: 'xyz'};
}

const operationTwo = (data) => {
    console.log('here',data);
    const result = data[0];
    return data;
}

const isStorePresent = (result) => {
    if(result.storesResult.length > 0){
        return true;
    }else{
        return false;
    }
};

const encodeId = (result) => {
    let encodedId = linkHasher.encodeDynamicHash(result.mongoId);
    return {id : encodedId};
}

const createUserObject = (result) => {
    let header = result.data[0].header;
    return {
        id: result.mobile,
        patname: header.patname,
        pataddress: header.pataddress,
        cust_state_code: header.cust_state_code,
        cust_state_name: header.cust_state_name,
    };
}

const createPaymentObject = (result) => {
    return {
        id: result.encodedId.id,
        transactionId: result.id,
        paymentMode: 'Offline'
    };
}
/*
data: req, custom
modify existing data before or after execution
inbuilt functions
use previous data or any specific data
*/
const invoicesOperations = [
    { id: 0, use: 'apiReqBody', add: { id: '', storeId: '' } },
    { id: 1, actions: [
        { operation: 'generateId', modify: 'id' },
        { operation: 'getSubString', modify: 'storeId', indexes: {from: 2, to: 3}, use: 'billNo' },
    ] },
    { id: 2, actions: { operation: 'mongo', values: { type: 'get', modelName: 'shopinfos', query: 'id', use: 'storeId' }, saveAt: 'storesResult' } },
    { id: 3, condition: isStorePresent, message: 'Store does not exist' },//custom function needed
    { id: 4, remove: ['storesResult'] },
    { id: 5, actions: { operation: 'mongo', values: { type: 'upsert', modelName: 'transactions' }, saveAt: 'transactionData' } },
    { id: 6, actions: { operation: 'getMongoObjectIdAsString', use: 'transactionData', saveAt: 'mongoId' } },
    { id: 7, actions: { operation: 'custom', customFunction: encodeId, saveAt: 'encodedId' } },
    { id: 8, actions: { operation: 'mongo', values: { type: 'upsert', modelName: 'transactions', use: 'encodedId', on: 'id' } } },
    { id: 9, remove: ['transactionData', 'mongoId'], actions: [
        { customFunction: createUserObject, saveAt: 'user'},
        { customFunction: createPaymentObject, saveAt: 'payment'}
    ]},
    { id: 10, actions: [
        { operation: 'mongo', values: { type: 'upsert', modelName: 'users', use: 'user' } },
        { operation: 'mongo', values: { type: 'upsert', modelName: 'paymentinfos', use: 'payment' } }
    ]},
    { id: 11, remove: ['payment', 'user', 'encodedId'], value: 'Transaction created' }
];
let stringFunc = async () => {
    console.log(req.body);
    let body = req.body;
    body.id = moment().unix();
    body.storeId = body.billNo.substr(2,3);
    try{
    //   const stores = await dbUtil.getAllByFilter('shopInfoModel', {id: body.storeId});
      const stores = "getStores";
      if(stores.length > 0){
          console.log(stores);
        // let data = await dbUtil.upsertDatabase('transactionModel', body.id, body);
        let data = "updateTransaction";
        // let id = data.upserted[0]._id.toString();
        let id = data.upserted[0]._id.toString();
        let encodedId = linkHasher.encodeDynamicHash(id);
        console.log({data, encodedId});
        // data = await dbUtil.upsertDatabase('transactionModel', body.id, {id: encodedId});
        data = "updateWithEncodedId";
        // Step 2: Save the shop info
        let header = body.data[0].header;
  
        // Step 3: Save the user info
        let user = {
          id: body.mobile,
          patname: header.patname,
          pataddress: header.pataddress,
          cust_state_code: header.cust_state_code,
          cust_state_name: header.cust_state_name,
        };
        // dbUtil.upsertDatabase('userModel', body.mobile, user);
        "updateUser"

        // Step 4: Save the payment information
        let paymentInfo = {
          id: encodedId,
          transactionId: body.id,
          paymentMode: 'Offline'
        };
        // dbUtil.upsertDatabase('paymentModel', paymentInfo.id, paymentInfo);
        "updatePayment"
        let msgTemplate = `Thank u for choosing Wellness Forever! ` +
        `Your bill value is Rs. ${body.totalBill}, ` +
        `Invoice ${'shortLink'} . ` +
        `For any assistance, call 18001024247. TCA.`;
  
        return { success: true, url: 'shortLink.data.link' };
      }else{
        return {success: false, message: 'Store is not added yet.'};
      }
    }catch(err){
      console.log(err);
      return { success: false, message: err };
    }
}

// const test1 = () => new Promise(resolve => setTimeout(() => resolve('test1'), 500));
// const test2 = () => new Promise(resolve => setTimeout(() => resolve('test2'), 400));
// const test3 = () => new Promise(resolve => setTimeout(() => resolve('test3'), 300));

const test1 = () => 'test1';
const test2 = () => 'test2';
const test3 = () => 'test3';

const apis = {
    db: {
        mongo: {
            uri: 'mongodb://localhost:27017',
            name: 'wf_transactionDB',
            models: mongoModels
        }
    },
    endpoints: [
        {
            base: '/livecheck',
            routes: [
                {
                    path: '/',
                    methods: {
                        get: {}
                    }
                }
            ]
        },
        {
            base: '/v1/invoices',
            routes: [
                {
                    path: '/',
                    methods: {
                        post: invoicesOperations
                    }
                }
            ]
        },
        {
            base: '/v1/invoicess',
            routes: [
                {
                    path: '/',
                    methods: {
                        post: {
                            functions: [
                                {
                                    type: 'customWithDB',
                                    func: stringFunc,
                                    params: {req: 'req', moment: moment, linkHasher: linkHasher},
                                    operation: {
                                        getStores: {
                                            type: 'db',
                                            db: 'mongo',
                                            operation: { type: 'get', modelName: 'shopinfos', query: '{id: body.storeId}' }
                                        },
                                        updateTransaction: {
                                            type: 'db',
                                            db: 'mongo',
                                            operation: { type: 'upsert', modelName: 'transactions', data: {id: 'body.id', value: 'body'} }
                                        },
                                        updateWithEncodedId: {
                                            type: 'db',
                                            db: 'mongo',
                                            operation: { type: 'upsert', modelName: 'transactions', data: {id: 'body.id', value: '{id: encodedId}'} }
                                        },
                                        updateUser: {
                                            type: 'db',
                                            db: 'mongo',
                                            operation: { type: 'upsert', modelName: 'users', data: {id: 'body.mobile', value: 'user'} }
                                        },
                                        updatePayment: {
                                            type: 'db',
                                            db: 'mongo',
                                            operation: { type: 'upsert', modelName: 'paymentinfos', data: {id: 'body.id', value: 'paymentInfo'} }
                                        },
                                    }
                                }
                            ]
                        }
                    }
                }
            ]
        },
        {
            base: '/v1/user',
            routes: [
                {
                    path: '/',
                    methods: {
                        get: {
                            functions: [
                                // {
                                //     type: 'db',
                                //     db: 'mongo',
                                //     operation: [
                                //         {type: 'get', modelName: 'Users', query: {id: 131}},
                                //         {type: 'get', modelName: 'Users', query: {id: 132}},
                                //         {type: 'get', modelName: 'Users', query: {id: 133}},
                                //     ]
                                // },
                                {
                                    type: 'custom',
                                    operation: [
                                        test1,
                                        test2,
                                        test3
                                    ]
                                },
                                {
                                    type: 'custom',
                                    operation: operationTwo
                                }
                            ]
                        },
                    }
                }
            ]
        },
        {
            base: '/v1/users',
            routes: [
                {
                    path: '/:id?',
                    methods: {
                        get: {
                            functions: [
                                {
                                    type: 'custom',
                                    function: operation
                                },
                                { 
                                    type: 'db', 
                                    db: 'mongo',
                                    operation: { type: 'get', modelName: 'Users', query: 'params' }
                                }
                            ]
                        },
                        post: {
                            functions: [
                                {
                                    type: 'db',
                                    db: 'mongo',
                                    operation: [
                                        { type: 'upsert', modelName: 'Users', data: {id: 131, name: 'abc'} },
                                        { type: 'upsert', modelName: 'Users', data: {id: 132, name: 'def'} },
                                        { type: 'upsert', modelName: 'Users', data: {id: 133, name: 'ghi'} },
                                    ]
                                },
                                {
                                    type: 'db',
                                    db: 'mongo',
                                    operation: { type: 'upsert', modelName: 'Users', data: 'req' }
                                },
                            ]
                        },
                        delete: {
                            functions: [
                                {
                                    type: 'db',
                                    db: 'mongo',
                                    operation: { type: 'delete', modelName: 'Users', query: 'params'}
                                }
                            ]
                        }
                    },
                }
            ]            
        }
    ]
}

module.exports = {
    apis,
    isStorePresent,
    createPaymentObject,
    createUserObject,
    encodeId,
}
