const inventoryModel = require('../schemas/inventory');
const productModel = require('../schemas/products');

module.exports = {
  // Create inventory for a product
  CreateInventory: async function (productId) {
    try {
      const newInventory = new inventoryModel({
        product: productId,
        stock: 0,
        reserved: 0,
        soldCount: 0
      });
      await newInventory.save();
      return newInventory;
    } catch (error) {
      throw new Error(`Error creating inventory: ${error.message}`);
    }
  },

  // Get all inventories
  GetAllInventories: async function () {
    try {
      const inventories = await inventoryModel
        .find({ isDeleted: false })
        .populate({
          path: 'product',
          select: 'title price description'
        });
      return inventories;
    } catch (error) {
      throw new Error(`Error getting inventories: ${error.message}`);
    }
  },

  // Get inventory by ID with product details
  GetInventoryById: async function (id) {
    try {
      const inventory = await inventoryModel
        .findOne({ _id: id, isDeleted: false })
        .populate({
          path: 'product',
          select: 'title price description images'
        });
      return inventory;
    } catch (error) {
      throw new Error(`Error getting inventory: ${error.message}`);
    }
  },

  // Add stock
  AddStock: async function (productId, quantity) {
    try {
      if (quantity < 0) {
        throw new Error('Quantity must be positive');
      }

      const inventory = await inventoryModel.findOne({
        product: productId,
        isDeleted: false
      });

      if (!inventory) {
        throw new Error('Inventory not found');
      }

      inventory.stock += quantity;
      await inventory.save();
      return inventory;
    } catch (error) {
      throw new Error(`Error adding stock: ${error.message}`);
    }
  },

  // Remove stock
  RemoveStock: async function (productId, quantity) {
    try {
      if (quantity < 0) {
        throw new Error('Quantity must be positive');
      }

      const inventory = await inventoryModel.findOne({
        product: productId,
        isDeleted: false
      });

      if (!inventory) {
        throw new Error('Inventory not found');
      }

      if (inventory.stock < quantity) {
        throw new Error(`Insufficient stock. Available: ${inventory.stock}`);
      }

      inventory.stock -= quantity;
      await inventory.save();
      return inventory;
    } catch (error) {
      throw new Error(`Error removing stock: ${error.message}`);
    }
  },

  // Reservation: decrease stock and increase reserved
  Reservation: async function (productId, quantity) {
    try {
      if (quantity < 0) {
        throw new Error('Quantity must be positive');
      }

      const inventory = await inventoryModel.findOne({
        product: productId,
        isDeleted: false
      });

      if (!inventory) {
        throw new Error('Inventory not found');
      }

      if (inventory.stock < quantity) {
        throw new Error(`Insufficient stock for reservation. Available: ${inventory.stock}`);
      }

      inventory.stock -= quantity;
      inventory.reserved += quantity;
      await inventory.save();
      return inventory;
    } catch (error) {
      throw new Error(`Error making reservation: ${error.message}`);
    }
  },

  // Sold: decrease reserved and increase soldCount
  Sold: async function (productId, quantity) {
    try {
      if (quantity < 0) {
        throw new Error('Quantity must be positive');
      }

      const inventory = await inventoryModel.findOne({
        product: productId,
        isDeleted: false
      });

      if (!inventory) {
        throw new Error('Inventory not found');
      }

      if (inventory.reserved < quantity) {
        throw new Error(`Insufficient reserved quantity. Reserved: ${inventory.reserved}`);
      }

      inventory.reserved -= quantity;
      inventory.soldCount += quantity;
      await inventory.save();
      return inventory;
    } catch (error) {
      throw new Error(`Error marking as sold: ${error.message}`);
    }
  }
};
