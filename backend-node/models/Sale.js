// backend-node/models/Sale.js
const mongoose = require('mongoose');

const productItemSchema = new mongoose.Schema({
    id: { type: String, required: true },
    nombre: { type: String, required: true },
    precio: { type: Number, required: true },
    cantidad: { type: Number, required: true, min: 1 },
}, { _id: false });

const saleSchema = new mongoose.Schema({
    vendedorId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    clienteNombre: { 
        type: String,
        required: true,
        trim: true
    },
    productosSeleccionados: {
        type: [productItemSchema],
        required: true
    },
    total: {
        type: Number,
        required: true,
        min: 0
    },
    fecha: {
        type: Date,
        default: Date.now
    },
}, {
    timestamps: true
});

module.exports = mongoose.model('Sale', saleSchema);