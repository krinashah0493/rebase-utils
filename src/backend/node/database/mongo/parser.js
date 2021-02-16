const _ =require("underscore")

const parser = (data, type) => {
  const backEndCollection = {};
  if (type === "BackEnd") {
    data.forEach((collection) => {
      for (let [key, value] of Object.entries(collection)) {
        if (value.backEnd) {
          backEndCollection[key] = value.backEnd;
        } else if (!value.backEnd) {
          backEndCollection[key] = value;
        } else {
          return false;
        }
      }
    });
    return [backEndCollection];
  } else if (type === "FrontEnd") {
    let frontEndData=[]
    let NewFrontEndCollection = [];
    let index = 0
    for(let i=0;i<data.length;i++){
      if(i>index){
        let frontEndCollection={}
        const collectionName=data[i-1].collection_name
        frontEndCollection[collectionName]=NewFrontEndCollection
        frontEndData.push(frontEndCollection)
        NewFrontEndCollection=[]
        index+=1
      }
      Object.keys(data[i]).forEach(element=>{
        console.log(_.size(data[i]))
        if(data[i][element].frontEnd){
          if(data[i][element].frontEnd){
            NewFrontEndCollection.push(data[i][element].frontEnd)
          }
        }
      })
    }    
    return frontEndData;
  }
};

module.exports = parser;
