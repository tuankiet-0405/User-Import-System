var express = require("express");
var router = express.Router();
let { uploadImage, uploadExcel } = require('../utils/uploadHandler')
let exceljs = require('exceljs')
let path = require('path')
let fs = require('fs')
let mongoose = require('mongoose');
let productModel = require('../schemas/products')
let inventoryModel = require('../schemas/inventories')
let categoryModel = require('../schemas/categories')
let slugify = require('slugify')

router.post('/an_image', uploadImage.single('file')
    , function (req, res, next) {
        if (!req.file) {
            res.send({
                message: "file khong duoc rong"
            })
        } else {
            res.send({
                filename: req.file.filename,
                path: req.file.path,
                size: req.file.size
            })
        }
    })
router.get('/:filename', function (req, res, next) {
    let filename = path.join(__dirname, '../uploads', req.params.filename)
    res.sendFile(filename)
})

router.post('/multiple_images', uploadImage.array('files', 5)
    , function (req, res, next) {
        if (!req.files) {
            res.send({
                message: "file khong duoc rong"
            })
        } else {
            // res.send({
            //     filename: req.file.filename,
            //     path: req.file.path,
            //     size: req.file.size
            // })

            res.send(req.files.map(f => {
                return {
                    filename: f.filename,
                    path: f.path,
                    size: f.size
                }
            }))
        }
    })

router.post('/excel', uploadExcel.single('file')
    , async function (req, res, next) {
        if (!req.file) {
            res.send({
                message: "file khong duoc rong"
            })
        } else {
            //wookbook->worksheet->row/column->cell
            let workBook = new exceljs.Workbook()
            let filePath = path.join(__dirname, '../uploads', req.file.filename)
            await workBook.xlsx.readFile(filePath)
            let worksheet = workBook.worksheets[0];
            let result = [];

            let categoryMap = new Map();
            let categories = await categoryModel.find({
            })
            for (const category of categories) {
                categoryMap.set(category.name, category._id)
            }

            let products = await productModel.find({})
            let getTitle = products.map(
                p => p.title
            )
            let getSku = products.map(
                p => p.sku
            )

            for (let index = 2; index <= worksheet.rowCount; index++) {
                let errorsRow = [];
                const element = worksheet.getRow(index);
                let sku = element.getCell(1).value;
                let title = element.getCell(2).value;
                let category = element.getCell(3).value;
                let price = Number.parseInt(element.getCell(4).value);
                let stock = Number.parseInt(element.getCell(5).value);

                if (price < 0 || isNaN(price)) {
                    errorsRow.push("price khong duoc nho hon 0 va la so")
                }
                if (stock < 0 || isNaN(stock)) {
                    errorsRow.push("stock khong duoc nho hon 0 va la so")
                }
                if (!categoryMap.has(category)) {
                    errorsRow.push("category khong hop le")
                }
                if (getSku.includes(sku)) {
                    errorsRow.push("sku da ton tai")
                }
                if (getTitle.includes(title)) {
                    errorsRow.push("title da ton tai")
                }

                if (errorsRow.length > 0) {
                    result.push({
                        success: false,
                        data: errorsRow
                    })
                    continue;
                }
                let session = await mongoose.startSession()
                session.startTransaction()
                try {
                    let newProducts = new productModel({
                        sku: sku,
                        title: title,
                        slug: slugify(title, {
                            replacement: '-',
                            lower: false,
                            remove: undefined,
                        }),
                        description: title,
                        category: categoryMap.get(category),
                        price: price
                    })
                    await newProducts.save({ session })
                    let newInventory = new inventoryModel({
                        product: newProducts._id,
                        stock: stock
                    })
                    await newInventory.save({ session });
                    await newInventory.populate('product')
                    await session.commitTransaction();
                    await session.endSession()
                    getTitle.push(title);
                    getSku.push(sku)
                    result.push({
                        success: true,
                        data: newInventory
                    })
                } catch (error) {
                    await session.abortTransaction();
                    await session.endSession()
                    result.push({
                        success: false,
                        data: error.message
                    })
                }
            }
            fs.unlinkSync(filePath)
            result = result.map((r, index) => {
                if (r.success) {
                    return {
                        [index + 1]: r.data
                    }
                } else {
                    return {
                        [index + 1]: r.data.join(',')
                    }
                }
            })
            res.send(result)
        }

    })

// Import Users from Excel
router.post('/import-users', uploadExcel.single('file'), async (req, res) => {
    if (!req.file) {
        return res.status(400).send({ message: "File không được để trống" });
    }

    try {
        let workBook = new exceljs.Workbook();
        let filePath = path.join(__dirname, '../uploads', req.file.filename);
        await workBook.xlsx.readFile(filePath);
        let worksheet = workBook.worksheets[0];
        let result = [];

        // Get USER role ID (default role for users)
        let roleModel = require('../schemas/roles');
        let userRole = await roleModel.findOne({ name: 'USER', isDeleted: false });
        
        if (!userRole) {
            fs.unlinkSync(filePath);
            return res.status(400).send({ 
                message: "Role USER không tìm thấy trong database. Vui lòng tạo role USER trước." 
            });
        }

        let defaultRoleId = userRole._id;

        for (let index = 2; index <= worksheet.rowCount; index++) {
            let errorsRow = [];
            const element = worksheet.getRow(index);
            let username = element.getCell(1).value;
            let email = element.getCell(2).value;

            // Validation
            if (!username || username.toString().trim() === '') {
                errorsRow.push("Username không được để trống");
            }
            if (!email || !email.toString().includes('@')) {
                errorsRow.push("Email không hợp lệ");
            }

            if (errorsRow.length > 0) {
                result.push({
                    success: false,
                    row: index,
                    data: errorsRow
                });
                continue;
            }

            try {
                // Generate random 16-character password
                const randomPassword = generateRandomPassword(16);
                
                let newUser = await userController.CreateAnUser(
                    username.toString().trim(),
                    randomPassword,
                    email.toString().toLowerCase().trim(),
                    defaultRoleId
                );

                // Send email with password
                let { sendMail } = require('../utils/mailHandler');
                await sendMail(
                    email.toString().toLowerCase().trim(),
                    `Tài khoản của bạn đã được tạo.<br>Username: ${username}<br>Password: ${randomPassword}`,
                    'Thông tin tài khoản e-commerce'
                );

                result.push({
                    success: true,
                    row: index,
                    data: {
                        _id: newUser._id,
                        username: newUser.username,
                        email: newUser.email,
                        password: randomPassword,
                        message: "Tài khoản đã được tạo và email đã được gửi"
                    }
                });
            } catch (error) {
                result.push({
                    success: false,
                    row: index,
                    data: error.message
                });
            }
        }

        fs.unlinkSync(filePath);
        res.send({
            total: result.length,
            results: result
        });
    } catch (error) {
        res.status(400).send({ message: error.message });
    }
});

// Generate random password function
function generateRandomPassword(length) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < length; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
}

// Helper: Generate sample Excel file for import users
router.get('/generate-sample-users-excel', (req, res) => {
    try {
        const workBook = new exceljs.Workbook();
        const worksheet = workBook.addWorksheet('Users');

        // Add headers
        worksheet.addRow(['username', 'email']);

        // Add sample data
        worksheet.addRow(['nguyen_tuan', 'nguyen.tuan@example.com']);
        worksheet.addRow(['tran_hung', 'hung.tran@example.com']);
        worksheet.addRow(['pham_linh', 'linh.pham@example.com']);
        worksheet.addRow(['le_minh', 'minh.le@example.com']);

        // Format header row
        const headerRow = worksheet.getRow(1);
        headerRow.font = { bold: true };
        headerRow.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFD3D3D3' }
        };

        // Adjust column widths
        worksheet.columns = [
            { header: 'username', key: 'username', width: 20 },
            { header: 'email', key: 'email', width: 30 }
        ];

        // Send file
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=users-sample.xlsx');
        return workBook.xlsx.write(res).then(() => {
            res.end();
        });
    } catch (error) {
        res.status(400).send({ message: error.message });
    }
});

module.exports = router;