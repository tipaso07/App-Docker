const express = require('express');
const Pedido = require('../models/Pedido');
const Producto = require('../models/Producto');
const { verificarToken, verificarAdmin } = require('../middleware/auth');

const router = express.Router();

router.post('/', verificarToken, async (req, res) => {
  try {
    const { productosCarrito, metodoPago, direccionEntrega } = req.body;
    const clienteId = req.usuario.id;

    let totalGeneral = 0;
    const productosProcesados = [];

    for (const item of productosCarrito) {
      const producto = await Producto.findById(item.id);
      if (!producto) {
        return res.status(404).json({ error: `Producto ${item.id} no encontrado` });
      }
      if (producto.stock < item.cantidad) {
        return res.status(400).json({ error: `Stock insuficiente para ${producto.nombre}` });
      }
      const subtotal = producto.precio * item.cantidad;
      totalGeneral += subtotal;
      productosProcesados.push({
        productoId: item.id,
        nombre: producto.nombre,
        precioUnitario: producto.precio,
        cantidad: item.cantidad,
        subtotal
      });
      producto.stock -= item.cantidad;
      await producto.save();
    }

    const igv = Number((totalGeneral * 0.18).toFixed(2));
    const montoTotal = Number((totalGeneral + igv).toFixed(2));
    const numeroBoleta = `B001-${Math.floor(100000 + Math.random() * 900000)}`;

    const nuevoPedido = new Pedido({
      clienteId,
      metodoPago,
      direccionEntrega,
      estado: 'Pendiente',
      boleta: {
        numeroBoleta,
        productos: productosProcesados,
        montoGrabado: Number(totalGeneral.toFixed(2)),
        igv,
        montoTotal
      }
    });

    const pedidoGuardado = await nuevoPedido.save();
    res.status(201).json(pedidoGuardado);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/', verificarToken, async (req, res) => {
  try {
    let pedidos;
    if (req.usuario.rol === 'Admin') {
      pedidos = await Pedido.find().populate('clienteId', 'nombre email').sort({ fecha: -1 });
    } else {
      pedidos = await Pedido.find({ clienteId: req.usuario.id }).sort({ fecha: -1 });
    }
    res.json(pedidos);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id/estado', verificarToken, verificarAdmin, async (req, res) => {
  try {
    const { estado } = req.body;
    const pedido = await Pedido.findByIdAndUpdate(req.params.id, { estado }, { new: true });
    if (!pedido) return res.status(404).json({ error: 'Pedido no encontrado' });
    res.json(pedido);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
