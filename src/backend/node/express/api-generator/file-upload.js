const multer = require('multer');
const path = require('path');
const fs = require('fs');
const functionUtils = require('./functionStore');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      const path = `./uploads/${file.fieldname}`;
      fs.mkdirSync(path, { recursive: true });
      cb(null, path);
    },
    filename: function (req, file, cb) {
      cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname)); //Appending extension
    }
});

const mediaFields = [
    {name: 'images', maxCount: 2},
    {name: 'videos', maxCount: 2},
    {name: 'others', maxCount: 2}
];

const downloadFile = multer({ 
    storage: storage, 
    limits: { fileSize: 20 * 1024 * 1024 }
}).fields(mediaFields);

module.exports = (reqData, res = {}) => {
    const req = reqData.resultObj;
    return new Promise ((resolve, reject) => downloadFile(req, res, (err) => {
        if (req.fileValidationError) {
            reject({success: false, ...req.fileValidationError});
        }else if (!req.files) {
            reject({success: false, err: 'Please select an image to upload'});
        }
        else if (err instanceof multer.MulterError) {
            reject({success: false, ...err});
        }
        else if (err) {
            reject({success: false, ...err});
        }
        let bs64 = [];
        for(let i = 0; i < req.files.images.length; i++){
            // bs64.push('bs64');
            bs64.push(functionUtils.imgToBase64(req.files.images[i].path));
            functionUtils.removeFile(req.files.images[i].path);
        }
        resolve({body: {...req.body}, images: bs64});
    }));
}
