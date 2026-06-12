const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Usuario = require('./models/Usuario');
const Producto = require('./models/Producto');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/mongodb-datos';

const drySizes = [
  { suffix: '250g', mult: 0.25 },
  { suffix: '500g', mult: 0.5 },
  { suffix: '1kg', mult: 1 },
  { suffix: '2kg', mult: 2 },
  { suffix: '5kg', mult: 5 },
];

const liquidSizes = [
  { suffix: '100ml', mult: 0.2 },
  { suffix: '250ml', mult: 0.5 },
  { suffix: '500ml', mult: 1 },
  { suffix: '1L', mult: 2 },
  { suffix: '2L', mult: 4 },
];

const personalSizes = [
  { suffix: '30ml', mult: 0.3 },
  { suffix: '60ml', mult: 0.6 },
  { suffix: '120ml', mult: 1.2 },
  { suffix: '250ml', mult: 2.5 },
  { suffix: '500ml', mult: 5 },
];

const personalSolidSizes = [
  { suffix: '30g', mult: 0.3 },
  { suffix: '60g', mult: 0.6 },
  { suffix: '120g', mult: 1.2 },
  { suffix: '250g', mult: 2.5 },
  { suffix: '500g', mult: 5 },
];

const productBases = [
  // GRANOS Y CEREALES
  { name: 'Arroz Integral', price: 4.5, desc: 'Arroz integral bolsa', cat: 'Alimentos', sizes: drySizes },
  { name: 'Arroz Blanco', price: 4.0, desc: 'Arroz blanco extra premium', cat: 'Alimentos', sizes: drySizes },
  { name: 'Lenteja', price: 5.0, desc: 'Lenteja seleccionada', cat: 'Alimentos', sizes: drySizes },
  { name: 'Garbanzo', price: 6.5, desc: 'Garbanzo nacional', cat: 'Alimentos', sizes: drySizes },
  { name: 'Frijol Canario', price: 5.5, desc: 'Frijol canario peruano', cat: 'Alimentos', sizes: drySizes },
  { name: 'Frijol Negro', price: 5.8, desc: 'Frijol negro importado', cat: 'Alimentos', sizes: drySizes },
  { name: 'Maíz Morado', price: 6.0, desc: 'Maíz morado peruano', cat: 'Alimentos', sizes: drySizes },
  { name: 'Quinua Real', price: 12.0, desc: 'Quinua real del altiplano', cat: 'Alimentos', sizes: drySizes },
  { name: 'Kiwicha', price: 11.0, desc: 'Kiwicha orgánica', cat: 'Alimentos', sizes: drySizes },
  { name: 'Avena', price: 3.5, desc: 'Avena en hojuelas', cat: 'Alimentos', sizes: drySizes },
  { name: 'Cebada', price: 3.0, desc: 'Cebada perlada', cat: 'Alimentos', sizes: drySizes },
  { name: 'Trigo', price: 3.2, desc: 'Trigo entero', cat: 'Alimentos', sizes: drySizes },
  { name: 'Maíz Cancha', price: 4.0, desc: 'Maíz cancha para tostar', cat: 'Alimentos', sizes: drySizes },
  { name: 'Pallares', price: 7.0, desc: 'Pallares regionales', cat: 'Alimentos', sizes: drySizes },

  // LÁCTEOS
  { name: 'Leche Fresca', price: 5.5, desc: 'Leche fresca pasteurizada', cat: 'Alimentos', sizes: liquidSizes },
  { name: 'Leche Evaporada', price: 3.8, desc: 'Leche evaporada ideal para cocinar', cat: 'Alimentos', sizes: liquidSizes },
  { name: 'Leche Deslactosada', price: 6.0, desc: 'Leche deslactosada', cat: 'Alimentos', sizes: liquidSizes },
  { name: 'Yogurt Natural', price: 4.5, desc: 'Yogurt natural batido', cat: 'Alimentos', sizes: liquidSizes },
  { name: 'Yogurt de Fresa', price: 4.8, desc: 'Yogurt batido sabor fresa', cat: 'Alimentos', sizes: liquidSizes },
  { name: 'Yogurt de Vainilla', price: 4.8, desc: 'Yogurt batido sabor vainilla', cat: 'Alimentos', sizes: liquidSizes },
  { name: 'Yogurt Griego', price: 7.0, desc: 'Yogurt estilo griego', cat: 'Alimentos', sizes: liquidSizes },
  { name: 'Queso Fresco', price: 8.0, desc: 'Queso fresco artesanal', cat: 'Alimentos', sizes: personalSolidSizes },
  { name: 'Queso Dambo', price: 12.0, desc: 'Queso dambo madurado', cat: 'Alimentos', sizes: personalSolidSizes },
  { name: 'Queso Parmesano', price: 18.0, desc: 'Queso parmesano rallado', cat: 'Alimentos', sizes: personalSolidSizes },
  { name: 'Mantequilla', price: 6.0, desc: 'Mantequilla de vaca', cat: 'Alimentos', sizes: personalSolidSizes },
  { name: 'Crema de Leche', price: 7.5, desc: 'Crema de leche fresca', cat: 'Alimentos', sizes: liquidSizes },

  // BEBIDAS
  { name: 'Café Molido', price: 8.0, desc: 'Café molido 100% peruano', cat: 'Alimentos', sizes: drySizes },
  { name: 'Café Instantáneo', price: 10.0, desc: 'Café instantáneo liofilizado', cat: 'Alimentos', sizes: personalSolidSizes },
  { name: 'Café Descafeinado', price: 9.5, desc: 'Café molido descafeinado', cat: 'Alimentos', sizes: drySizes },
  { name: 'Té Negro', price: 4.0, desc: 'Té negro en hebras', cat: 'Alimentos', sizes: personalSolidSizes },
  { name: 'Té Verde', price: 5.0, desc: 'Té verde natural', cat: 'Alimentos', sizes: personalSolidSizes },
  { name: 'Té de Hierbas', price: 4.5, desc: 'Té de hierbas digestivo', cat: 'Alimentos', sizes: personalSolidSizes },
  { name: 'Té de Manzanilla', price: 4.0, desc: 'Té de manzanilla', cat: 'Alimentos', sizes: personalSolidSizes },
  { name: 'Agua Mineral', price: 2.0, desc: 'Agua mineral natural', cat: 'Alimentos', sizes: liquidSizes },
  { name: 'Agua con Gas', price: 2.5, desc: 'Agua mineral con gas', cat: 'Alimentos', sizes: liquidSizes },
  { name: 'Chicha Morada', price: 4.0, desc: 'Chicha morada tradicional', cat: 'Alimentos', sizes: liquidSizes },

  // ENLATADOS Y CONSERVAS
  { name: 'Atún en Agua', price: 5.0, desc: 'Atún en agua enlatado', cat: 'Alimentos', sizes: [{ suffix: '80g', mult: 1 }, { suffix: '160g', mult: 2 }, { suffix: '340g', mult: 4 }] },
  { name: 'Atún en Aceite', price: 5.5, desc: 'Atún en aceite vegetal', cat: 'Alimentos', sizes: [{ suffix: '80g', mult: 1 }, { suffix: '160g', mult: 2 }, { suffix: '340g', mult: 4 }] },
  { name: 'Sardinas', price: 4.0, desc: 'Sardinas en salsa de tomate', cat: 'Alimentos', sizes: [{ suffix: '120g', mult: 1 }, { suffix: '240g', mult: 2 }, { suffix: '400g', mult: 3.5 }] },
  { name: 'Choclo Entero', price: 4.5, desc: 'Choclo dulce enlatado', cat: 'Alimentos', sizes: [{ suffix: '150g', mult: 1 }, { suffix: '300g', mult: 2 }, { suffix: '450g', mult: 3 }] },
  { name: 'Arvejas', price: 4.0, desc: 'Arvejas enteras enlatadas', cat: 'Alimentos', sizes: [{ suffix: '150g', mult: 1 }, { suffix: '300g', mult: 2 }, { suffix: '450g', mult: 3 }] },
  { name: 'Tomate Pelado', price: 5.0, desc: 'Tomate pelado entero', cat: 'Alimentos', sizes: [{ suffix: '200g', mult: 1 }, { suffix: '400g', mult: 2 }, { suffix: '800g', mult: 4 }] },
  { name: 'Duraznos en Almíbar', price: 6.0, desc: 'Duraznos en almíbar liviano', cat: 'Alimentos', sizes: [{ suffix: '200g', mult: 1 }, { suffix: '400g', mult: 2 }, { suffix: '800g', mult: 4 }] },
  { name: 'Piña en Almíbar', price: 5.5, desc: 'Rodajas de piña en almíbar', cat: 'Alimentos', sizes: [{ suffix: '200g', mult: 1 }, { suffix: '400g', mult: 2 }, { suffix: '800g', mult: 4 }] },
  { name: 'Cóctel de Frutas', price: 6.5, desc: 'Cóctel de frutas variadas', cat: 'Alimentos', sizes: [{ suffix: '200g', mult: 1 }, { suffix: '400g', mult: 2 }, { suffix: '800g', mult: 4 }] },
  { name: 'Leche Condensada', price: 4.5, desc: 'Leche condensada dulce', cat: 'Alimentos', sizes: [{ suffix: '200g', mult: 1 }, { suffix: '400g', mult: 2 }] },

  // CONDIMENTOS Y ESPECIAS
  { name: 'Sal Marina', price: 1.5, desc: 'Sal marina fina', cat: 'Alimentos', sizes: drySizes },
  { name: 'Sal Rosada', price: 4.0, desc: 'Sal rosada del Himalaya', cat: 'Alimentos', sizes: drySizes },
  { name: 'Azúcar Blanca', price: 4.0, desc: 'Azúcar refinada blanca', cat: 'Alimentos', sizes: drySizes },
  { name: 'Azúcar Rubia', price: 3.5, desc: 'Azúcar rubia sin refinar', cat: 'Alimentos', sizes: drySizes },
  { name: 'Stevia', price: 6.0, desc: 'Edulcorante natural stevia', cat: 'Alimentos', sizes: personalSolidSizes },
  { name: 'Comino Molido', price: 3.0, desc: 'Comino molido natural', cat: 'Alimentos', sizes: personalSolidSizes },
  { name: 'Orégano', price: 2.5, desc: 'Orégano seco entero', cat: 'Alimentos', sizes: personalSolidSizes },
  { name: 'Pimienta Negra', price: 4.0, desc: 'Pimienta negra molida', cat: 'Alimentos', sizes: personalSolidSizes },
  { name: 'Pimienta Entera', price: 5.0, desc: 'Pimienta negra en grano', cat: 'Alimentos', sizes: personalSolidSizes },
  { name: 'Ají Molido', price: 3.0, desc: 'Ají molido picante', cat: 'Alimentos', sizes: personalSolidSizes },
  { name: 'Cúrcuma', price: 4.5, desc: 'Cúrcuma molida natural', cat: 'Alimentos', sizes: personalSolidSizes },
  { name: 'Laurel', price: 2.0, desc: 'Hojas de laurel secas', cat: 'Alimentos', sizes: personalSolidSizes },
  { name: 'Canela Entera', price: 5.0, desc: 'Canela en rama', cat: 'Alimentos', sizes: personalSolidSizes },
  { name: 'Canela Molida', price: 4.0, desc: 'Canela molida', cat: 'Alimentos', sizes: personalSolidSizes },
  { name: 'Clavo de Olor', price: 6.0, desc: 'Clavo de olor entero', cat: 'Alimentos', sizes: personalSolidSizes },
  { name: 'Anís', price: 3.5, desc: 'Semillas de anís', cat: 'Alimentos', sizes: personalSolidSizes },
  { name: 'Ají Panca Molido', price: 4.0, desc: 'Ají panca molido, insumo criollo', cat: 'Alimentos', sizes: personalSolidSizes },
  { name: 'Ají Amarillo Molido', price: 4.5, desc: 'Ají amarillo molido, cremoso', cat: 'Alimentos', sizes: personalSolidSizes },

  // PASTAS Y HARINAS
  { name: 'Fideos Tallarín', price: 3.2, desc: 'Fideos tallarín de trigo', cat: 'Alimentos', sizes: drySizes },
  { name: 'Fideos Spaghetti', price: 3.5, desc: 'Fideos spaghetti', cat: 'Alimentos', sizes: drySizes },
  { name: 'Fideos Codito', price: 3.0, desc: 'Fideos codito para sopa', cat: 'Alimentos', sizes: drySizes },
  { name: 'Fideos Canelón', price: 4.5, desc: 'Fideos canelón para horno', cat: 'Alimentos', sizes: drySizes },
  { name: 'Fideos Conchita', price: 3.2, desc: 'Fideos conchita para sopa', cat: 'Alimentos', sizes: drySizes },
  { name: 'Fideos Letra', price: 3.0, desc: 'Fideos forma de letra para niños', cat: 'Alimentos', sizes: drySizes },
  { name: 'Fideos Lasaña', price: 5.0, desc: 'Láminas de lasaña de trigo', cat: 'Alimentos', sizes: drySizes },
  { name: 'Harina de Trigo', price: 3.0, desc: 'Harina de trigo todo uso', cat: 'Alimentos', sizes: drySizes },
  { name: 'Harina de Maíz', price: 3.5, desc: 'Harina de maíz precocida', cat: 'Alimentos', sizes: drySizes },
  { name: 'Harina de Arroz', price: 4.5, desc: 'Harina de arroz sin gluten', cat: 'Alimentos', sizes: drySizes },
  { name: 'Levadura Seca', price: 2.5, desc: 'Levadura seca instantánea', cat: 'Alimentos', sizes: personalSolidSizes },
  { name: 'Pan Rayado', price: 3.0, desc: 'Pan rallado fino', cat: 'Alimentos', sizes: drySizes },

  // ACEITES Y VINAGRES
  { name: 'Aceite Vegetal', price: 8.9, desc: 'Aceite vegetal multiusos', cat: 'Alimentos', sizes: liquidSizes },
  { name: 'Aceite de Oliva', price: 18.0, desc: 'Aceite de oliva extra virgen', cat: 'Alimentos', sizes: liquidSizes },
  { name: 'Aceite de Coco', price: 12.0, desc: 'Aceite de coco virgen', cat: 'Alimentos', sizes: liquidSizes },
  { name: 'Aceite de Canola', price: 7.5, desc: 'Aceite de canola bajo en grasa', cat: 'Alimentos', sizes: liquidSizes },
  { name: 'Aceite de Sésamo', price: 15.0, desc: 'Aceite de sésamo', cat: 'Alimentos', sizes: liquidSizes },
  { name: 'Aceite de Girasol', price: 8.0, desc: 'Aceite de girasol', cat: 'Alimentos', sizes: liquidSizes },
  { name: 'Vinagre de Vino', price: 4.0, desc: 'Vinagre de vino tinto', cat: 'Alimentos', sizes: liquidSizes },
  { name: 'Vinagre de Manzana', price: 5.0, desc: 'Vinagre de manzana orgánico', cat: 'Alimentos', sizes: liquidSizes },
  { name: 'Vinagre Balsámico', price: 10.0, desc: 'Vinagre balsámico de Módena', cat: 'Alimentos', sizes: liquidSizes },
  { name: 'Vinagre Blanco', price: 3.0, desc: 'Vinagre blanco destilado', cat: 'Alimentos', sizes: liquidSizes },

  // SALSAS Y ADEREZOS
  { name: 'Mayonesa', price: 5.0, desc: 'Mayonesa clásica', cat: 'Alimentos', sizes: liquidSizes },
  { name: 'Ketchup', price: 4.5, desc: 'Salsa de tomate ketchup', cat: 'Alimentos', sizes: liquidSizes },
  { name: 'Mostaza', price: 4.0, desc: 'Mostaza amarilla', cat: 'Alimentos', sizes: liquidSizes },
  { name: 'Salsa de Soja', price: 6.0, desc: 'Salsa de soja clásica', cat: 'Alimentos', sizes: liquidSizes },
  { name: 'Salsa Inglesa', price: 5.5, desc: 'Salsa inglesa Worcestershire', cat: 'Alimentos', sizes: liquidSizes },
  { name: 'Salsa de Ají', price: 4.0, desc: 'Salsa de ají picante', cat: 'Alimentos', sizes: liquidSizes },
  { name: 'Salsa Carbonara', price: 7.0, desc: 'Salsa carbonara para pastas', cat: 'Alimentos', sizes: liquidSizes },
  { name: 'Salsa Bolognesa', price: 6.5, desc: 'Salsa bolognesa para pastas', cat: 'Alimentos', sizes: liquidSizes },

  // SNACKS Y DULCES
  { name: 'Galletas de Vainilla', price: 3.0, desc: 'Galletas rellenas de vainilla', cat: 'Alimentos', sizes: drySizes },
  { name: 'Galletas de Chocolate', price: 3.5, desc: 'Galletas rellenas de chocolate', cat: 'Alimentos', sizes: drySizes },
  { name: 'Galletas Integrales', price: 4.0, desc: 'Galletas integrales con miel', cat: 'Alimentos', sizes: drySizes },
  { name: 'Galletas de Avena', price: 3.8, desc: 'Galletas de avena y pasas', cat: 'Alimentos', sizes: drySizes },
  { name: 'Caramelos Duros', price: 2.5, desc: 'Caramelos duros surtidos', cat: 'Alimentos', sizes: drySizes },
  { name: 'Caramelos Suaves', price: 3.0, desc: 'Caramelos blandos surtidos', cat: 'Alimentos', sizes: drySizes },
  { name: 'Chocolate con Leche', price: 6.0, desc: 'Chocolate con leche en tableta', cat: 'Alimentos', sizes: personalSolidSizes },
  { name: 'Chocolate Amargo', price: 7.0, desc: 'Chocolate amargo 70% cacao', cat: 'Alimentos', sizes: personalSolidSizes },
  { name: 'Chocolate Blanco', price: 6.5, desc: 'Chocolate blanco cremoso', cat: 'Alimentos', sizes: personalSolidSizes },
  { name: 'Mermelada de Fresa', price: 6.0, desc: 'Mermelada de fresa casera', cat: 'Alimentos', sizes: personalSolidSizes },
  { name: 'Mermelada de Durazno', price: 6.0, desc: 'Mermelada de durazno', cat: 'Alimentos', sizes: personalSolidSizes },
  { name: 'Manjar Blanco', price: 5.5, desc: 'Manjar blanco tradicional', cat: 'Alimentos', sizes: personalSolidSizes },
  { name: 'Miel de Abeja', price: 12.0, desc: 'Miel de abeja pura', cat: 'Alimentos', sizes: personalSolidSizes },

  // CUIDADO DENTAL
  { name: 'Crema Dental', price: 5.0, desc: 'Crema dental con flúor', cat: 'Cuidado Personal', sizes: personalSizes },
  { name: 'Crema Dental Blanqueadora', price: 7.0, desc: 'Crema dental blanqueadora', cat: 'Cuidado Personal', sizes: personalSizes },
  { name: 'Crema Dental Sensible', price: 7.5, desc: 'Crema dental para dientes sensibles', cat: 'Cuidado Personal', sizes: personalSizes },
  { name: 'Enjuague Bucal', price: 6.0, desc: 'Enjuague bucal antibacterial', cat: 'Cuidado Personal', sizes: personalSizes },
  { name: 'Enjuague Bucal Menta', price: 6.5, desc: 'Enjuague bucal sabor menta', cat: 'Cuidado Personal', sizes: personalSizes },
  { name: 'Hilo Dental', price: 3.0, desc: 'Hilo dental encerado', cat: 'Cuidado Personal', sizes: [{ suffix: '25m', mult: 1 }, { suffix: '50m', mult: 2 }] },

  // CUIDADO CAPILAR
  { name: 'Shampoo', price: 12.0, desc: 'Shampoo para todo tipo de cabello', cat: 'Cuidado Personal', sizes: personalSizes },
  { name: 'Shampoo Anticaspa', price: 14.0, desc: 'Shampoo anticaspa', cat: 'Cuidado Personal', sizes: personalSizes },
  { name: 'Shampoo Cabello Seco', price: 13.0, desc: 'Shampoo para cabello seco', cat: 'Cuidado Personal', sizes: personalSizes },
  { name: 'Acondicionador', price: 12.0, desc: 'Acondicionador suave', cat: 'Cuidado Personal', sizes: personalSizes },
  { name: 'Acondicionador Reparador', price: 14.0, desc: 'Acondicionador reparador de puntas', cat: 'Cuidado Personal', sizes: personalSizes },
  { name: 'Crema para Peinar', price: 10.0, desc: 'Crema para peinar', cat: 'Cuidado Personal', sizes: personalSizes },
  { name: 'Gel para Cabello', price: 8.0, desc: 'Gel fijador para cabello', cat: 'Cuidado Personal', sizes: personalSizes },
  { name: 'Aceite Capilar', price: 9.0, desc: 'Aceite capilar nutritivo', cat: 'Cuidado Personal', sizes: personalSizes },

  // JABONES
  { name: 'Jabón Líquido', price: 6.5, desc: 'Jabón líquido antibacterial', cat: 'Cuidado Personal', sizes: personalSizes },
  { name: 'Jabón Líquico Avena', price: 7.5, desc: 'Jabón líquido con avena', cat: 'Cuidado Personal', sizes: personalSizes },
  { name: 'Jabón en Barra', price: 3.0, desc: 'Jabón en barra humectante', cat: 'Cuidado Personal', sizes: personalSolidSizes },
  { name: 'Jabón Antibacterial', price: 4.0, desc: 'Jabón antibacterial en barra', cat: 'Cuidado Personal', sizes: personalSolidSizes },
  { name: 'Jabón de Glicerina', price: 4.5, desc: 'Jabón de glicerina natural', cat: 'Cuidado Personal', sizes: personalSolidSizes },
  { name: 'Jabón Exfoliante', price: 5.5, desc: 'Jabón exfoliante corporal', cat: 'Cuidado Personal', sizes: personalSolidSizes },
  { name: 'Jabón Líquido Facial', price: 8.0, desc: 'Jabón líquido facial suave', cat: 'Cuidado Personal', sizes: personalSizes },

  // CUIDADO DE LA PIEL
  { name: 'Crema Hidratante', price: 15.0, desc: 'Crema hidratante facial', cat: 'Cuidado Personal', sizes: personalSizes },
  { name: 'Crema Corporal', price: 12.0, desc: 'Crema corporal humectante', cat: 'Cuidado Personal', sizes: personalSizes },
  { name: 'Crema de Noche', price: 18.0, desc: 'Crema reparadora de noche', cat: 'Cuidado Personal', sizes: personalSizes },
  { name: 'Loción Corporal', price: 10.0, desc: 'Loción corporal refrescante', cat: 'Cuidado Personal', sizes: personalSizes },
  { name: 'Protector Solar SPF50', price: 25.0, desc: 'Protector solar SPF50 resistente al agua', cat: 'Cuidado Personal', sizes: personalSizes },
  { name: 'Protector Solar SPF30', price: 20.0, desc: 'Protector solar SPF30 para uso diario', cat: 'Cuidado Personal', sizes: personalSizes },
  { name: 'Bloqueador Solar Facial', price: 22.0, desc: 'Bloqueador solar facial SPF70', cat: 'Cuidado Personal', sizes: personalSizes },
  { name: 'Talco Corporal', price: 6.0, desc: 'Talco corporal perfumado', cat: 'Cuidado Personal', sizes: personalSolidSizes },
  { name: 'Talco Refrescante', price: 7.0, desc: 'Talco refrescante para pies', cat: 'Cuidado Personal', sizes: personalSolidSizes },

  // DESODORANTES
  { name: 'Desodorante Roll-on', price: 8.0, desc: 'Desodorante antitranspirante roll-on', cat: 'Cuidado Personal', sizes: personalSizes },
  { name: 'Desodorante Spray', price: 10.0, desc: 'Desodorante en spray', cat: 'Cuidado Personal', sizes: personalSizes },
  { name: 'Desodorante en Barra', price: 9.0, desc: 'Desodorante en barra antitranspirante', cat: 'Cuidado Personal', sizes: personalSolidSizes },
  { name: 'Desodorante Crema', price: 11.0, desc: 'Desodorante en crema', cat: 'Cuidado Personal', sizes: personalSizes },
  { name: 'Desodorante Natural', price: 12.0, desc: 'Desodorante sin aluminio', cat: 'Cuidado Personal', sizes: personalSolidSizes },

  // ACCESORIOS E HIGIENE
  { name: 'Toalla de Manos', price: 8.0, desc: 'Toalla de manos de algodón', cat: 'Cuidado Personal', sizes: [{ suffix: '30x30cm', mult: 1 }, { suffix: '40x40cm', mult: 1.5 }, { suffix: '50x50cm', mult: 2 }] },
  { name: 'Toalla de Baño', price: 20.0, desc: 'Toalla de baño de algodón', cat: 'Cuidado Personal', sizes: [{ suffix: '60x120cm', mult: 1 }, { suffix: '70x140cm', mult: 1.5 }, { suffix: '80x150cm', mult: 2 }] },
  { name: 'Pañuelos Desechables', price: 3.5, desc: 'Pañuelos desechables suaves', cat: 'Cuidado Personal', sizes: drySizes },
  { name: 'Toallas Húmedas', price: 5.0, desc: 'Toallas húmedas antibacteriales', cat: 'Cuidado Personal', sizes: drySizes },
  { name: 'Cepillo de Dientes', price: 4.0, desc: 'Cepillo de dientes cerdas suaves', cat: 'Cuidado Personal', sizes: [{ suffix: '1und', mult: 1 }, { suffix: '2und', mult: 1.8 }, { suffix: '4und', mult: 3.2 }] },
  { name: 'Peine', price: 5.0, desc: 'Peine de plástico resistente', cat: 'Cuidado Personal', sizes: [{ suffix: '1und', mult: 1 }, { suffix: '2und', mult: 1.8 }] },
];

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

  const productos = [];
  for (const base of productBases) {
    for (const size of base.sizes) {
      const precio = Math.round(base.price * size.mult * 100) / 100;
      const descripcion = `${base.desc} - ${size.suffix}`;
      const nombre = `${base.name} ${size.suffix}`;
      const stock = Math.floor(Math.random() * 200) + 20;
      productos.push({
        nombre,
        precio,
        stock,
        categoria: base.cat,
        valoracion: Math.round((Math.random() * 1.5 + 3.5) * 10) / 10,
        descripcion,
      });
    }
  }

  await Producto.insertMany(productos);
  console.log(`${productos.length} productos creados correctamente`);
  console.log('Base de datos sembrada correctamente');
  await mongoose.disconnect();
}

sembrar().catch(err => { console.error(err); process.exit(1); });
