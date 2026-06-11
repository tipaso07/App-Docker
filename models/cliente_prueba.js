const { io } = require("socket.io-client");

// Nos conectamos al servidor de la Capa 2 (Node en Docker)
const socket = io("http://localhost:3000");

socket.on("connect", () => {
    console.log("📱 ¡Cliente simulado conectado al servidor por Sockets! ID:", socket.id);

    // SIMULAMOS EL CARRITO CON TU PRODUCTO REAL DE LOTE
    const carritoSimulado = {
        clienteId: "65f1a2b3c4d5e6f7a8b9c0d1", // ID de prueba para el usuario
        metodoPago: "Yape",
        direccionEntrega: "Av. Prolongación Primavera 2390, Surco",
        productosCarrito: [
            {
                id: "6a28fc6ed920f3bd5f95c90f", // <-- TU ID REAL DE MONGO
                nombre: "Audífonos Bluetooth Sony Pocket - Blanco Ártico",
                precio: 333.41,
                cantidad: 1
            }
        ]
    };

    console.log("🛒 Enviando carrito de compras en tiempo real...");
    // Disparamos la transacción hacia el servidor
    socket.emit("procesar_compra", carritoSimulado);
});

// Escuchamos cuando el servidor procesa todo y emite la boleta oficial
socket.on("alerta_nuevo_pedido", (pedidoGuardado) => {
    console.log("\n📢 ¡ALERTA RECIBIDA EN TIEMPO REAL FROM DOCKER!");
    console.log("=================================================");
    console.log("📄 Número de Boleta :", pedidoGuardado.boleta.numeroBoleta);
    console.log("🛍️ Producto Comprado:", pedidoGuardado.boleta.productos[0].nombre);
    console.log("💵 Subtotal Base    : S/.", pedidoGuardado.boleta.montoGrabado);
    console.log("📈 IGV Calculado (18%): S/.", pedidoGuardado.boleta.igv);
    console.log("💰 TOTAL NETO PAGADO : S/.", pedidoGuardado.boleta.montoTotal);
    console.log("=================================================");
    console.log("📦 Estado del envío :", pedidoGuardado.estado);

    // Cerramos la conexión limpiamente
    socket.disconnect();
});

// Por si algo sale mal en el servidor
socket.on("error_compra", (err) => {
    console.error("❌ Error devuelto por el servidor:", err.mensaje);
    socket.disconnect();
}); 