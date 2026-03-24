#!/usr/bin/env node

/**
 * Test Script for User Import from Excel
 * This script demonstrates the complete user import workflow
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');
const exceljs = require('exceljs');

const BASE_URL = 'http://localhost:3000';

async function createSampleExcelFile() {
    console.log('\n📄 Creating sample Excel file...');
    
    const workBook = new exceljs.Workbook();
    const worksheet = workBook.addWorksheet('Users');

    // Add headers
    worksheet.addRow(['username', 'email']);

    // Add sample data  
    worksheet.addRow(['nguyen_tuan', 'nguyen.tuan@example.com']);
    worksheet.addRow(['tran_hung', 'hung.tran@example.com']);
    worksheet.addRow(['pham_linh', 'linh.pham@example.com']);
    worksheet.addRow(['le_minh', 'minh.le@example.com']);
    worksheet.addRow(['hoang_nam', 'nam.hoang@example.com']);

    const filePath = path.join(__dirname, 'test-users.xlsx');
    await workBook.xlsx.writeFile(filePath);
    console.log(`✅ Sample file created: ${filePath}`);
    return filePath;
}

async function testImportUsers(filePath) {
    console.log('\n📤 Testing user import endpoint...');
    
    try {
        const fileStream = fs.createReadStream(filePath);
        const form = new require('form-data')();
        form.append('file', fileStream);

        const response = await axios.post(
            `${BASE_URL}/api/v1/upload/import-users`,
            form,
            {
                headers: form.getHeaders(),
                timeout: 30000
            }
        );

        console.log('\n✅ Import successful!');
        console.log('\n📊 Results:');
        console.log(JSON.stringify(response.data, null, 2));

        // Count success and failures
        const successCount = response.data.results.filter(r => r.success).length;
        const failureCount = response.data.results.filter(r => !r.success).length;

        console.log(`\n📈 Summary:`);
        console.log(`  - Total processed: ${response.data.total}`);
        console.log(`  - Successful: ${successCount}`);
        console.log(`  - Failed: ${failureCount}`);

        if (failureCount > 0) {
            console.log(`\n⚠️  Failed users:`);
            response.data.results.forEach((result, idx) => {
                if (!result.success) {
                    const key = Object.keys(result)[0];
                    console.log(`  Row ${result.row}: ${result.data}`);
                }
            });
        }

        return true;
    } catch (error) {
        console.error('\n❌ Import failed!');
        console.error('Error:', error.response?.data || error.message);
        return false;
    }
}

async function main() {
    console.log('========================================');
    console.log('  User Import from Excel - Test Script');
    console.log('========================================');
    
    console.log('\n⚙️  Prerequisites:');
    console.log('  1. Server running on http://localhost:3000');
    console.log('  2. MongoDB running');
    console.log('  3. Mailtrap credentials configured');
    console.log('  4. USER role created in database');

    try {
        // Create sample Excel file
        const excelPath = await createSampleExcelFile();

        // Wait a moment for file to be written
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Test import
        const success = await testImportUsers(excelPath);

        if (success) {
            console.log('\n✅ Test completed successfully!');
            console.log('\n📧 Check Mailtrap for sent emails:');
            console.log('   https://mailtrap.io/inbox');
            console.log('\n🗄️  Check MongoDB for new users:');
            console.log('   db.users.find({ role: ObjectId("USER_ROLE_ID") })');
        } else {
            console.log('\n❌ Test failed. Please check:');
            console.log('   - Server is running');
            console.log('   - Mailtrap credentials are configured');
            console.log('   - USER role exists in database');
        }

    } catch (error) {
        console.error('\n❌ Error:', error.message);
        process.exit(1);
    }

    // Cleanup
    const filePath = path.join(__dirname, 'test-users.xlsx');
    if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log('\n🧹 Cleaned up test file');
    }
}

main().catch(console.error);
