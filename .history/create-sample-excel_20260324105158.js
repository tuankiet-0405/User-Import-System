const exceljs = require('exceljs');
const path = require('path');

async function createSampleExcel() {
    const workBook = new exceljs.Workbook();
    const worksheet = workBook.addWorksheet('Users');

    // Add headers
    worksheet.addRow(['username', 'email']);

    // Add sample data
    worksheet.addRow(['nguyen_tuan', 'nguyen.tuan@gmail.com']);
    worksheet.addRow(['tran_hung', 'hung.tran@gmail.com']);
    worksheet.addRow(['pham_linh', 'linh.pham@gmail.com']);
    worksheet.addRow(['le_minh', 'minh.le@gmail.com']);

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

    // Save file
    const filePath = path.join(__dirname, 'users-sample.xlsx');
    await workBook.xlsx.writeFile(filePath);
    console.log(`✅ Sample Excel file created: ${filePath}`);
}

createSampleExcel().catch(err => console.error(err));
