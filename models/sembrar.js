const mongoose = require('mongoose');
const Producto = require('./Producto');

const MONGO_URI = 'mongodb://localhost:27017/mongodb-datos';

// === DICCIONARIO DE DATOS REALES PARA COMBINACIÓN ===
const marcas = ["Sony", "Apple", "Logitech", "Samsung", "Xiaomi", "JBL", "Asus", "Lenovo", "Philips", "Kingston"];
const colores = ["Negro Mate", "Blanco Ártico", "Gris Espacial", "Azul Marino", "Rojo Urbano", "Verde Militar"];
const atributos = ["Pro", "Ultra", "Lite", "Gamer Edition", "Wireless XL", "Plus", "Max", "Pocket", "Smart"];

const categoriasBase = [
    {
        nombre: "Audio y Audífonos",
        productos: ["Audífonos Bluetooth", "Parlante Waterproof", "Audífonos Over-Ear", "Barra de Sonido", "Auriculares In-Ear"],
        detalles: "Con cancelación de ruido activa y sonido envolvente de alta definición."
    },
    {
        nombre: "Cargadores y Cables",
        productos: ["Cargador de Pared Carga Rápida", "Cable USB-C Reforzado", "Batería Portátil Powerbank", "Cargador Inalámbrico Magnético", "Hub Multipuerto USB-C"],
        detalles: "Certificación de seguridad contra sobrecargas y compatibilidad universal."
    },
    {
        nombre: "Accesorios PC y Gaming",
        productos: ["Mouse Óptico Ergonómico", "Teclado Mecánico RGB", "Cooler de Alta Eficiencia", "Mouse Pad Antideslizante", "Cámara Web Full HD"],
        detalles: "Optimizado para alta durabilidad, ideal para largas jornadas de estudio o gaming."
    },
    {
        nombre: "Smartphones y Smartwatches",
        productos: ["Smartwatch Deportivo", "Reloj Inteligente Urbano", "Soporte Magnético Premium", "Estabilizador Gimbal", "Anillo de Luz LED Profesional"],
        detalles: "Con conectividad instantánea y diseño de vanguardia."
    }
];

async function sembrarDatosRealistas() {
    try {
        await mongoose.connect(MONGO_URI);
        console.log('🔌 Conectado a MongoDB en Docker...');

        const lista600Productos = [];
        const nombresUsados = new Set(); // Para asegurar que NINGUN nombre se repita
        const TOTAL_OBJETIVO = 600;

        console.log('⏳ Generando 600 productos únicos y realistas...');

        while (lista600Productos.length < TOTAL_OBJETIVO) {
            // 1. Elegir una categoría aleatoria
            const cat = categoriasBase[Math.floor(Math.random() * categoriasBase.length)];

            // 2. Elegir un producto base de esa categoría
            const prodBase = cat.productos[Math.floor(Math.random() * cat.productos.length)];

            // 3. Combinar con Marca, Atributo y Color aleatorios
            const marca = marcas[Math.floor(Math.random() * marcas.length)];
            const atributo = atributos[Math.floor(Math.random() * atributos.length)];
            const color = colores[Math.floor(Math.random() * colores.length)];

            // Ejemplo de resultado: "Audífonos Bluetooth Sony Pro - Negro Mate"
            const nombreCompleto = `${prodBase} ${marca} ${atributo} - ${color}`;

            // Si por casualidad matemática la combinación ya existe, la saltamos para que no haya repetidos
            if (nombresUsados.has(nombreCompleto)) {
                continue;
            }
            nombresUsados.add(nombreCompleto);

            // 4. Generar métricas de negocio reales
            const precio = parseFloat((Math.random() * (350 - 19) + 19).toFixed(2)); // Precios de S/.19.00 a S/.350.00
            const stock = Math.floor(Math.random() * (150 - 10) + 10); // Stock de 10 a 150 unidades
            const valoracion = parseFloat((Math.random() * (5.0 - 3.8) + 3.8).toFixed(1)); // De 3.8 a 5.0 estrellas

            lista600Productos.push({
                nombre: nombreCompleto,
                precio: precio,
                stock: stock,
                categoria: cat.nombre,
                valoracion: valoracion,
                descripcion: `${nombreCompleto}. ${cat.detalles} Garantía oficial de 12 meses.`
            });
        }

        // 5. Inyección limpia en Docker
        console.log('🧹 Limpiando base de datos...');
        await Producto.deleteMany({});

        console.log('🚀 Insertando registros en el contenedor...');
        await Producto.insertMany(lista600Productos);

        console.log('✅ ¡GOLAZO HISTÓRICO! Tu MongoDB de Docker ahora tiene 600 productos 100% realistas y diferentes.');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error:', error);
        process.exit(1);
    }
}

sembrarDatosRealistas();