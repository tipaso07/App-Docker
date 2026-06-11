const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const mongoose = require('mongoose');
const Pedido = require('./models/Pedido');
const Usuario = require('./models/Usuario');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: "*" } // Permite conexiones desde cualquier frontend (Capa 3)
});

// MIDDLEWARE
app.use(express.json());

// 🔌 CONEXIÓN A LA CAPA 1 (MongoDB en Docker)
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/mongodb-datos';

mongoose.connect(MONGO_URI)
    .then(() => console.log('🔌 Capa 2 conectada con éxito a la Capa 1 (MongoDB en Docker)'))
    .catch(err => console.error('❌ Error al conectar a MongoDB:', err));

// RUTA REST DE PRUEBA
app.get('/api/prueba', (req, res) => {
    res.json({ mensaje: "Hola desde la Capa 2 de Aplicación" });
});

// 📡 UNIFICACIÓN DE CONFIGURACIÓN DE SOCKETS (Un solo bloque connection)
io.on('connection', (socket) => {
    console.log('👤 Usuario conectado al sistema Express/Socket:', socket.id);

    // EVENTO 1: Mensajería básica (opcional)
    socket.on('enviar_mensaje', (datos) => {
        console.log('📩 Datos recibidos del cliente:', datos);
        io.emit('recibir_mensaje', datos);
    });

    // EVENTO 2: ESCUCHAR CUANDO SE REALIZA UNA COMPRA
    socket.on('procesar_compra', async (datosEntrada) => {
        try {
            const { clienteId, productosCarrito, metodoPago, direccionEntrega } = datosEntrada;
            console.log(`🛒 Procesando carrito para el cliente: ${clienteId}`);

            // 1. CALCULAR MONTOS SOBRE EL TOTAL GENERAL
            let totalGeneral = 0;
            const productosProcesados = productosCarrito.map(item => {
                const subtotal = item.precio * item.cantidad;
                totalGeneral += subtotal;
                return {
                    productoId: item.id,
                    nombre: item.nombre,
                    precioUnitario: item.precio,
                    cantidad: item.cantidad,
                    subtotal: subtotal
                };
            });

            // Matemáticas estándar de boleta peruana (IGV 18%)
            const igv = Number((totalGeneral * 0.18).toFixed(2));
            const montoGrabado = Number((totalGeneral).toFixed(2)); // Monto base de los productos
            const montoTotal = Number((montoGrabado + igv).toFixed(2)); // Lo que paga el cliente final

            // Generar un número de boleta aleatorio único
            const numeroBoleta = `B001-${Math.floor(100000 + Math.random() * 900000)}`;

            // 2. CREAR EL OBJETO DEL PEDIDO CON LA BOLETA INTEGRADA
            const nuevoPedido = new Pedido({
                clienteId: new mongoose.Types.ObjectId(clienteId),
                metodoPago,
                direccionEntrega,
                boleta: {
                    numeroBoleta,
                    productos: productosProcesados,
                    montoGrabado,
                    igv,
                    montoTotal
                }
            });

            // 3. GUARDAR EN LA CAPA 1 (MongoDB en Docker)
            const pedidoGuardado = await nuevoPedido.save();

            // 4. ACTUALIZAR EL HISTORIAL DEL CLIENTE (Si existe el ID en la colección de usuarios)
            try {
                await Usuario.findByIdAndUpdate(clienteId, {
                    $push: { historialCompras: pedidoGuardado._id }
                });
                console.log(`👤 Historial del cliente ${clienteId} actualizado.`);
            } catch (errUser) {
                console.log("⚠️ Nota: No se actualizó historial de usuario (ID de prueba o esquema ausente), pero la boleta se creó con éxito.");
            }

            console.log(`✅ Boleta ${numeroBoleta} generada con éxito en Docker por S/. ${montoTotal}`);

            // 5. EMITIR EVENTO EN TIEMPO REAL A TODOS LOS CONECTADOS
            io.emit('alerta_nuevo_pedido', pedidoGuardado);

        } catch (error) {
            console.error('❌ Error crítico en la transacción:', error);
            socket.emit('error_compra', { mensaje: 'No se pudo procesar la boleta.' });
        }
    });

    socket.on('disconnect', () => {
        console.log('🛑 Cliente desconectado:', socket.id);
    });
});

// ENCENDER EL SERVIDOR
const PORT = 3000;
server.listen(PORT, () => {
    console.log(`🚀 Servidor de la Capa 2 corriendo en http://localhost:${PORT}`);
});