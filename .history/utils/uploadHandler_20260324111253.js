let multer = require("multer");
let path = require('path')

//ghi vao dau? - ghi ten la gi->storage
let storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
        //name + ext
        console.log(file);
        let ext = path.extname(file.originalname);//wtdd.png->.png
        let fileName = Date.now() + '-' + Math.round(Math.random() * 1000_000_000) + ext;
        console.log(fileName);
        cb(null, fileName)
    }
})
let filterImage = function (req, file, cb) {
    if (file.mimetype.startsWith('image')) {
        cb(null, true)
    } else {
        cb(new Error("dinh dang file khong dung "))
    }
}
let filterExcel = function (req, file, cb) {
    // Check both MIME type and file extension
    const mimeValid = file.mimetype.includes('spreadsheetml') || file.mimetype.includes('excel');
    const ext = path.extname(file.originalname).toLowerCase();
    const extValid = ext === '.xlsx' || ext === '.xls';
    
    if (mimeValid || extValid) {
        cb(null, true)
    } else {
        cb(new Error("Định dạng file không đúng. Vui lòng upload file .xlsx hoặc .xls"))
    }
}
module.exports = {
    uploadImage: multer({
        storage: storage,
        limits: 5 * 1025 * 1025,
        fileFilter: filterImage
    }),
    uploadExcel: multer({
        storage: storage,
        limits: 5 * 1025 * 1025,
        fileFilter: filterExcel
    })
}
