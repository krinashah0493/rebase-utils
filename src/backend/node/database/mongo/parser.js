const _ =require("underscore")

const parser = (data, type) => {
  const backEndCollection = [];
  console.log(data);
  if (type === "BackEnd") {
    data.forEach((collection) => {
      let obj = {};
      _.each(collection, (value, key) => {
        if(key !== 'collection_name'){
          obj[key] = value.backEnd;
        }else if(key === 'collection_name'){
          obj.collection_name = value;
        }
      });
      backEndCollection.push(obj);
    });
    // console.log(backEndCollection);
    return backEndCollection;
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
