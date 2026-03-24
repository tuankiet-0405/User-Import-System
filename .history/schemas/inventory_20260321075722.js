const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'product',
      required: [true, 'Product ID is required'],
      unique: true
    },
    stock: {
      type: Number,
      default: 0,
      min: [0, 'Stock cannot be negative']
    },
    reserved: {
      type: Number,
      default: 0,
      min: [0, 'Reserved cannot be negative']
    },
    soldCount: {
      type: Number,
      default: 0,
      min: [0, 'Sold count cannot be negative']
    },
    isDeleted: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('inventory', inventorySchema);
