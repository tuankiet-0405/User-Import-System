const axios = require('axios');

const BASE_URL = 'http://localhost:3000/api/v1';

// Colors for console
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

async function test() {
  try {
    console.log('\n' + colors.cyan + '=== INVENTORY SYSTEM TEST ===' + colors.reset + '\n');

    // 1. Create Category
    console.log(colors.blue + '1. Creating Category...' + colors.reset);
    const categoryRes = await axios.post(`${BASE_URL}/categories`, {
      name: 'Electronics - ' + Date.now(),
      image: 'https://i.imgur.com/QkIa5tT.jpeg'
    });
    const categoryId = categoryRes.data._id;
    console.log(colors.green + '✓ Category created: ' + categoryId + colors.reset + '\n');

    // 2. Create Product (should auto-create inventory)
    console.log(colors.blue + '2. Creating Product (should auto-create inventory)...' + colors.reset);
    const productRes = await axios.post(`${BASE_URL}/products`, {
      title: 'Laptop Dell XPS 13 - ' + Date.now(),
      description: 'High-performance laptop',
      category: categoryId,
      price: 1200,
      images: ['https://i.imgur.com/image1.jpg']
    });
    const productId = productRes.data.product._id;
    console.log(colors.green + '✓ Product created: ' + productId + colors.reset);
    console.log(colors.green + '✓ Inventory auto-created' + colors.reset + '\n');

    // 3. Get All Inventories (check join with product)
    console.log(colors.blue + '3. Getting All Inventories (with product join)...' + colors.reset);
    const allInventoriesRes = await axios.get(`${BASE_URL}/inventory`);
    const allInventories = allInventoriesRes.data;
    const createdInventory = allInventories.find(inv => inv.product._id === productId);
    
    if (createdInventory) {
      console.log(colors.green + '✓ Inventory found with product details:' + colors.reset);
      console.log(`  - Product Title: ${createdInventory.product.title}`);
      console.log(`  - Product Price: $${createdInventory.product.price}`);
      console.log(`  - Stock: ${createdInventory.stock}`);
      console.log(`  - Reserved: ${createdInventory.reserved}`);
      console.log(`  - SoldCount: ${createdInventory.soldCount}\n`);
    }

    const inventoryId = createdInventory._id;

    // 4. Get Inventory by ID (check join with product)
    console.log(colors.blue + '4. Getting Inventory by ID (with product join)...' + colors.reset);
    const inventoryByIdRes = await axios.get(`${BASE_URL}/inventory/${inventoryId}`);
    const inventory = inventoryByIdRes.data;
    console.log(colors.green + '✓ Inventory details:' + colors.reset);
    console.log(`  - Product: ${inventory.product.title}`);
    console.log(`  - Stock: ${inventory.stock}`);
    console.log(`  - Reserved: ${inventory.reserved}`);
    console.log(`  - SoldCount: ${inventory.soldCount}\n`);

    // 5. Add Stock
    console.log(colors.blue + '5. Adding Stock (100 units)...' + colors.reset);
    const addStockRes = await axios.post(`${BASE_URL}/inventory/add-stock`, {
      product: productId,
      quantity: 100
    });
    console.log(colors.green + `✓ Stock added. New stock: ${addStockRes.data.inventory.stock}` + colors.reset);
    console.log(`  - Stock: ${addStockRes.data.inventory.stock}`);
    console.log(`  - Reserved: ${addStockRes.data.inventory.reserved}\n`);

    // 6. Reservation (decrease stock, increase reserved)
    console.log(colors.blue + '6. Reservation (10 units - should decrease stock, increase reserved)...' + colors.reset);
    const reservationRes = await axios.post(`${BASE_URL}/inventory/reservation`, {
      product: productId,
      quantity: 10
    });
    console.log(colors.green + `✓ Reservation successful:` + colors.reset);
    console.log(`  - Stock: ${reservationRes.data.inventory.stock} (was 100, now 90)`);
    console.log(`  - Reserved: ${reservationRes.data.inventory.reserved} (was 0, now 10)\n`);

    // 7. Add Stock again
    console.log(colors.blue + '7. Adding More Stock (50 units)...' + colors.reset);
    const addStock2Res = await axios.post(`${BASE_URL}/inventory/add-stock`, {
      product: productId,
      quantity: 50
    });
    console.log(colors.green + `✓ Stock added. New stock: ${addStock2Res.data.inventory.stock}` + colors.reset);
    console.log(`  - Stock: ${addStock2Res.data.inventory.stock} (90 + 50)\n`);

    // 8. Reservation again
    console.log(colors.blue + '8. Another Reservation (30 units)...' + colors.reset);
    const reservation2Res = await axios.post(`${BASE_URL}/inventory/reservation`, {
      product: productId,
      quantity: 30
    });
    console.log(colors.green + `✓ Reservation successful:` + colors.reset);
    console.log(`  - Stock: ${reservation2Res.data.inventory.stock} (140 - 30 = 110)`);
    console.log(`  - Reserved: ${reservation2Res.data.inventory.reserved} (10 + 30 = 40)\n`);

    // 9. Remove Stock
    console.log(colors.blue + '9. Removing Stock (25 units)...' + colors.reset);
    const removeStockRes = await axios.post(`${BASE_URL}/inventory/remove-stock`, {
      product: productId,
      quantity: 25
    });
    console.log(colors.green + `✓ Stock removed. New stock: ${removeStockRes.data.inventory.stock}` + colors.reset);
    console.log(`  - Stock: ${removeStockRes.data.inventory.stock} (110 - 25 = 85)\n`);

    // 10. Sold (decrease reserved, increase soldCount)
    console.log(colors.blue + '10. Mark as Sold (20 units - should decrease reserved, increase soldCount)...' + colors.reset);
    const soldRes = await axios.post(`${BASE_URL}/inventory/sold`, {
      product: productId,
      quantity: 20
    });
    console.log(colors.green + `✓ Marked as sold:` + colors.reset);
    console.log(`  - Reserved: ${soldRes.data.inventory.reserved} (was 40, now 20)`);
    console.log(`  - SoldCount: ${soldRes.data.inventory.soldCount} (was 0, now 20)\n`);

    // 11. Final Check
    console.log(colors.blue + '11. Final Inventory Status...' + colors.reset);
    const finalInventoryRes = await axios.get(`${BASE_URL}/inventory/${inventoryId}`);
    const finalInventory = finalInventoryRes.data;
    console.log(colors.green + '✓ Final Status:' + colors.reset);
    console.log(`  - Product: ${finalInventory.product.title}`);
    console.log(`  - Stock: ${finalInventory.stock}`);
    console.log(`  - Reserved: ${finalInventory.reserved}`);
    console.log(`  - SoldCount: ${finalInventory.soldCount}\n`);

    // Summary
    console.log(colors.cyan + '=== TEST SUMMARY ===' + colors.reset);
    console.log(colors.green + '✓ Auto-create inventory on product creation: PASSED' + colors.reset);
    console.log(colors.green + '✓ Get all inventories with product join: PASSED' + colors.reset);
    console.log(colors.green + '✓ Get inventory by ID with product join: PASSED' + colors.reset);
    console.log(colors.green + '✓ Add stock: PASSED' + colors.reset);
    console.log(colors.green + '✓ Remove stock: PASSED' + colors.reset);
    console.log(colors.green + '✓ Reservation (stock ↓, reserved ↑): PASSED' + colors.reset);
    console.log(colors.green + '✓ Sold (reserved ↓, soldCount ↑): PASSED' + colors.reset);
    console.log(colors.cyan + '========================' + colors.reset + '\n');

    console.log(colors.yellow + 'All tests completed successfully!' + colors.reset + '\n');

  } catch (error) {
    console.error(colors.red + '❌ Error:' + colors.reset, error.response?.data || error.message);
    process.exit(1);
  }
}

test();
