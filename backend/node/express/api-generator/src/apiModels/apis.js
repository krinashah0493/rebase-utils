const mongoModels = require('../database/mongodb/models');

const operation = () => {
    return {name: 'xyz'};
}

const operationTwo = (data) => {
    console.log('here',data);
    const result = data[0];
    return data;
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
            name: 'tackll',
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
    apis
}
