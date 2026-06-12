const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Usuario = require('./models/Usuario');
const Producto = require('./models/Producto');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/mongodb-datos';

async function sembrar() {
  await mongoose.connect(MONGO_URI);

  const db = mongoose.connection.db;
  const collections = await db.listCollections().toArray();
  for (const col of collections) {
    await db.collection(col.name).drop();
  }

  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash('upc123456789', salt);

  await Usuario.create([
    { nombre: 'Admin Principal', email: 'admin@gmail.com', password: hash, rol: 'Admin' },
    { nombre: 'Cliente Demo', email: 'cliente@gmail.com', password: hash, rol: 'Cliente' },
    { nombre: 'Carlos Pérez', email: 'repartidor1@gmail.com', password: hash, rol: 'Repartidor' },
    { nombre: 'María López', email: 'repartidor2@gmail.com', password: hash, rol: 'Repartidor' },
  ]);

  await Producto.create([
    { nombre: 'Arroz Integral 1kg', precio: 4.50, stock: 100, categoria: 'Alimentos', valoracion: 4.5, descripcion: 'Arroz integral bolsa 1kg' },
    { nombre: 'Fideos Tallarín 500g', precio: 3.20, stock: 80, categoria: 'Alimentos', valoracion: 4.0, descripcion: 'Fideos de trigo' },
    { nombre: 'Aceite Vegetal 1L', precio: 8.90, stock: 60, categoria: 'Alimentos', valoracion: 4.3, descripcion: 'Aceite vegetal' },
    { nombre: 'Leche Evaporada 400g', precio: 3.80, stock: 90, categoria: 'Alimentos', valoracion: 4.1, descripcion: 'Leche evaporada ideal para cocinar' },
    { nombre: 'Azúcar Blanca 1kg', precio: 4.00, stock: 75, categoria: 'Alimentos', valoracion: 4.2, descripcion: 'Azúcar refinada' },
    { nombre: 'Jabón Líquido 250ml', precio: 6.50, stock: 50, categoria: 'Cuidado Personal', valoracion: 4.6, descripcion: 'Jabón líquido antibacterial' },
    { nombre: 'Shampoo 400ml', precio: 12.00, stock: 40, categoria: 'Cuidado Personal', valoracion: 4.4, descripcion: 'Shampoo para todo tipo de cabello' },
    { nombre: 'Crema Dental 90g', precio: 5.00, stock: 70, categoria: 'Cuidado Personal', valoracion: 4.7, descripcion: 'Crema dental blanqueadora' },
    { nombre: 'Desodorante Roll-on 50ml', precio: 8.00, stock: 45, categoria: 'Cuidado Personal', valoracion: 4.3, descripcion: 'Desodorante antitranspirante' },
    { nombre: 'Protector Solar SPF50 120ml', precio: 25.00, stock: 30, categoria: 'Cuidado Personal', valoracion: 4.8, descripcion: 'Protector solar resistente al agua' },
  ]);

  console.log('Base de datos sembrada correctamente');
  await mongoose.disconnect();
}

sembrar().catch(err => { console.error(err); process.exit(1); });
