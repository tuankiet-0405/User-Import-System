const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventory');

// Get all inventories
router.get('/', async (req, res) => {
  try {
    const inventories = await inventoryController.GetAllInventories();
    res.send(inventories);
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
});

// Get inventory by ID with product details
router.get('/:id', async (req, res) => {
  try {
    const inventory = await inventoryController.GetInventoryById(req.params.id);
    if (!inventory) {
      return res.status(404).send({ message: 'Inventory not found' });
    }
    res.send(inventory);
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
});

// Add stock
router.post('/add-stock', async (req, res) => {
  try {
    const { product, quantity } = req.body;
    
    if (!product || quantity === undefined) {
      return res.status(400).send({ message: 'Product ID and quantity are required' });
    }

    const inventory = await inventoryController.AddStock(product, quantity);
    res.send({
      message: 'Stock added successfully',
      inventory: inventory
    });
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
});

// Remove stock
router.post('/remove-stock', async (req, res) => {
  try {
    const { product, quantity } = req.body;
    
    if (!product || quantity === undefined) {
      return res.status(400).send({ message: 'Product ID and quantity are required' });
    }

    const inventory = await inventoryController.RemoveStock(product, quantity);
    res.send({
      message: 'Stock removed successfully',
      inventory: inventory
    });
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
});

// Reservation: decrease stock and increase reserved
router.post('/reservation', async (req, res) => {
  try {
    const { product, quantity } = req.body;
    
    if (!product || quantity === undefined) {
      return res.status(400).send({ message: 'Product ID and quantity are required' });
    }

    const inventory = await inventoryController.Reservation(product, quantity);
    res.send({
      message: 'Product reserved successfully',
      inventory: inventory
    });
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
});

// Sold: decrease reserved and increase soldCount
router.post('/sold', async (req, res) => {
  try {
    const { product, quantity } = req.body;
    
    if (!product || quantity === undefined) {
      return res.status(400).send({ message: 'Product ID and quantity are required' });
    }

    const inventory = await inventoryController.Sold(product, quantity);
    res.send({
      message: 'Product marked as sold successfully',
      inventory: inventory
    });
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
});

module.exports = router;
