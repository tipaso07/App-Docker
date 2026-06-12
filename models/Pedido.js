const mongoose = require('mongoose');

const PedidoSchema = new mongoose.Schema({
    // Datos principales del Pedido
    clienteId: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', required: true },
    metodoPago: { type: String, required: true }, // Ej: 'Yape', 'Plin', 'Tarjeta'
    estado: { type: String, default: 'Pendiente' }, // Pendiente, En Camino, Entregado, Cancelado
    fecha: { type: Date, default: Date.now },

    // LA BOLETA (Estructura embebida con los productos comprados)
    boleta: {
        numeroBoleta: { type: String, required: true, unique: true }, // Ej: B001-000045
        rucTienda: { type: String, default: '20123456789' }, // RUC ficticio estilo Coolbox
        productos: [
            {
                productoId: { type: String, required: true },
                nombre: { type: String, required: true },
                precioUnitario: { type: Number, required: true },
                cantidad: { type: Number, required: true },
                subtotal: { type: Number, required: true } // precioUnitario * cantidad
            }
        ],
        montoGrabado: { type: Number, required: true }, // Total sin IGV
        igv: { type: Number, required: true },          // El 18% del total
        montoTotal: { type: Number, required: true }    // Lo que paga el cliente al final
    },

    repartidorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Usuario', default: null, index: true },
    direccionEntrega: { type: String, required: true }
});

PedidoSchema.index({ clienteId: 1 });
PedidoSchema.index({ estado: 1 });

module.exports = mongoose.model('Pedido', PedidoSchema);