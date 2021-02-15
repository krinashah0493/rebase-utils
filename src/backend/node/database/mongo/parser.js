const parser = (data) => {
  const backEndCollection = {};
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
  return backEndCollection;
};

module.exports=parser