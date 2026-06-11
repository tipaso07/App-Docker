# 1. Imagen base oficial de Node v18
FROM node:18

# 2. Creamos la carpeta del proyecto dentro del contenedor virtual
RUN mkdir -p /usr/src/app

# 3. Definimos esa carpeta como el directorio de trabajo principal
WORKDIR /usr/src/app

# 4. Copiamos los archivos de configuración para instalar las librerías
COPY package*.json ./

# 5. Instalamos las dependencias de tu e-commerce adentro del contenedor
RUN npm install

# 6. Copiamos todo tu código (index.js, carpeta models, etc.) al contenedor
COPY . .

# 7. Exponemos el puerto 3000 de desarrollo
EXPOSE 3000

# 8. Comando para dar play al servidor
CMD ["node", "index.js"]