"use strict";

const Users = {
  id: String,
  name: String,
  roleDeptIds: {
    roleDeptId:String,
    deptRole:String
  },
  rewards: String,
  address: String,
  gender: String,
  email:String,
  companyId:String
};


let UserAuthData = {
  id: String,
  password: String,
  role: String,
  groupId:String
};

module.exports = {
    UserAuthData,
    Users
}
