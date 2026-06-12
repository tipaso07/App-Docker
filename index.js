const express = require('express');
const http = require('http');
const path = require('path');
const { Server } = require('socket.io');
const mongoose = require('mongoose');

const authRoutes = require('./routes/auth');
const productoRoutes = require('./routes/productos');
const pedidoRoutes = require('./routes/pedidos');
const usuarioRoutes = require('./routes/usuarios');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: "*" } // Permite conexiones desde cualquier frontend (Capa 3)
});

app.set('io', io);

// MIDDLEWARE
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// 🔌 CONEXIÓN A LA CAPA 1 (MongoDB en Docker)
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/mongodb-datos';

mongoose.connect(MONGO_URI)
    .then(() => console.log('🔌 Capa 2 conectada con éxito a la Capa 1 (MongoDB en Docker)'))
    .catch(err => console.error('❌ Error al conectar a MongoDB:', err));

// RUTAS API
app.use('/api/auth', authRoutes);
app.use('/api/productos', productoRoutes);
app.use('/api/pedidos', pedidoRoutes);
app.use('/api/usuarios', usuarioRoutes);

// RUTA REST DE PRUEBA
app.get('/api/prueba', (req, res) => {
    res.json({ mensaje: "Hola desde la Capa 2 de Aplicación" });
});

// 📡 SOCKET.IO - Solo eventos en tiempo real
io.on('connection', (socket) => {
    console.log('👤 Usuario conectado:', socket.id);
    socket.on('disconnect', () => {
        console.log('🛑 Cliente desconectado:', socket.id);
    });
});

// ENCENDER EL SERVIDOR
const PORT = 3000;
server.listen(PORT, () => {
    console.log(`🚀 Servidor de la Capa 2 corriendo en http://localhost:${PORT}`);
});