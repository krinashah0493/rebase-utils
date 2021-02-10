// "use strict";

// const Users = {
//   id: String,
//   name: String,
//   roleDeptIds: {
//     roleDeptId:String,
//     deptRole:String
//   },
//   rewards: String,
//   address: String,
//   gender: String,
//   email:String,
//   companyId:String
// };


// let UserAuthData = {
//   id: String,
//   password: String,
//   role: String,
//   groupId:String
// };

// module.exports = {
//     UserAuthData,
//     Users
// }

'use strict';

let users = {
  id: String, // mobile
  patname: String,
  pataddress: String,
  cust_state_code: String,
  cust_state_name: String,
  role: String,
  storeId: String,
  ratings: Number,
  date: Date
};

let UserAuthData = {
  id: String,
  password: String,
  otp: String,
  role: String,
};

let transactions = {
  id: String,
  c2code: String,
  storeId: String,
  billNo: String,
  totalBill: String,
  mobile: String,
  data: [
    {
      header: Map,
      det: { type: [Map] },
    },
  ],
};

let shopinfos = {
  id: String,
  c2code: String,
  firmname: String,
  firmaddress: String,
  ipno: String,
  username: String,
  firmgstno: String,
  firmdlno: String,
  c_phone_1: String,
  c_phone_2: String,
  br_state_code: String,
  br_state_name: String,
  storeAdmins: Array,
  userRatingsAverage: Number,
  isOffline: Boolean
};

let paymentinfos = {
  id: String,
  transactionId: Number,
  paymentMode: String
};

let UserRatings = {
  userId: String,
  storeId: String,
  ratings: Number,
  date: String,
}

let Assets = {
  id: String,
  carousels: Array,
  cards: Array,
  launcherIcon: String
}

module.exports = {
  users,
  transactions,
  paymentinfos,
  shopinfos,
  UserAuthData,
  UserRatings,
  Assets
};