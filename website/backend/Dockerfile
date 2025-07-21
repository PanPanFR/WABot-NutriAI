# Gunakan base image Node.js
FROM node:18-slim

# Set direktori kerja di dalam container
WORKDIR /usr/src/app

# Salin package.json dan package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Salin sisa kode aplikasi
COPY . .

# Jalankan aplikasi saat container dimulai
CMD [ "node", "server.js" ]