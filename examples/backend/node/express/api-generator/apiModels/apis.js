// REFERENCE FILE
const mongoModels = require('../database/mongodb/models');
const linkHasher = require('./link-hasher');
const moment = require('moment');
const operation = () => {
    return {name: 'xyz'};
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
