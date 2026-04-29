# 🐝 b33 HiveTrack — Sistema Web Completo con MySQL

Sistema web profesional para gestión apícola basado en HiveTrack.  
Permite administrar apiarios, colmenas, agricultores, contratos de polinización, movimientos, trazabilidad e indicadores como el **IPE (Índice de Polinización Efectiva)**.
**IMPORTAMTE PARA CELUALR Y WEB :  npm run dev -- --host**
---

# 🚀 1. ¿Qué incluye?

- Login y registro de usuarios
- Autenticación con JWT
- Dashboard profesional con gráficos
- Gestión de apiarios
- Gestión de agricultores
- Gestión de colmenas
- Gestión de contratos de polinización
- Gestión de movimientos
- Resumen en tiempo real
- Exportación a PDF
- Diseño responsive (PC + celular)
- Sincronización de datos entre dispositivos
- Base de datos MySQL

---

# 📊 2. ¿Qué es el IPE?

El **IPE (Índice de Polinización Efectiva)** mide la eficiencia del servicio de polinización.

Se basa en:

- Cantidad de colmenas
- Superficie del cultivo
- Densidad de colmenas
- Cumplimiento del contrato
- Movimientos registrados

👉 Permite evaluar la calidad del trabajo apícola.

---

# 🛠️ 3. INSTALACIÓN COMPLETA

## 🔹 3.1 Instalar Node.js

Descargar:

https://nodejs.org

Instalar:

```txt
Node.js 20 LTS

Verificar:

node -v
npm -v
🔹 3.2 Instalar MySQL

Opciones:

MySQL Workbench
XAMPP
Laragon

Configuración por defecto:

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=admin
DB_NAME=hivetrack
🔹 3.3 Instalar Visual Studio Code

https://code.visualstudio.com

Extensiones recomendadas:

Prettier
ES7 React snippets
Thunder Client

📁 4. ESTRUCTURA
hivetrack/
│
├── backend/
├── frontend/
⚙️ 5. CONFIGURAR BACKEND
cd backend
npm install

Crear archivo .env:

PORT=3000

DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=admin
DB_NAME=hivetrack

JWT_SECRET=hivetrack_secret
🗄️ 6. CREAR BASE DE DATOS
npm run init-db

Esto crea automáticamente:

Base de datos
Todas las tablas
Usuario inicial
👤 USUARIO INICIAL
admin@hivetrack.cl
admin123
▶️ 7. EJECUTAR BACKEND
npm run dev

Abrir:

http://localhost:3000
🌐 8. CONFIGURAR FRONTEND
cd frontend
npm install

Editar:

src/services/api.js
🔹 Para PC:
const API_URL = 'http://localhost:3000/api';
🔹 Para celular:
const API_URL = 'http://TU_IP:3000/api';

Ejemplo:

const API_URL = 'http://192.168.100.91:3000/api';
🔍 Obtener IP
ipconfig

Buscar:

Dirección IPv4
💻 9. EJECUTAR FRONTEND
npm run dev

Abrir:

http://localhost:5173
📱 10. EJECUTAR EN CELULAR
npm run dev -- --host

Abrir en celular:

http://TU_IP:5173
🔧 11. CONFIGURAR CORS

En:

backend/src/server.js
app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://TU_IP:5173'
  ],
  credentials: true
}));

app.listen(port, '0.0.0.0');
🔄 12. FLUJO
Iniciar MySQL
Backend:
cd backend
npm run dev
Frontend:
cd frontend
npm run dev -- --host
Abrir sistema

🔑 13. LOGIN
admin@hivetrack.cl
admin123
📲 14. USAR COMO APP

En Chrome celular:

⋮ → Agregar a pantalla principal
⚠️ 15. ERRORES COMUNES
❌ Failed to fetch
const API_URL = 'http://TU_IP:3000/api';
❌ Error CORS
app.use(cors());
❌ MySQL no conecta
mysql -u root -p
❌ Puerto ocupado
netstat -ano | findstr :3000
🚀 16. COMANDOS RÁPIDOS

Backend:

cd backend
npm install
npm run init-db
npm run dev

Frontend:

cd frontend
npm install
npm run dev -- --host
🎯 17. RESULTADO FINAL

✔ Funciona en PC
✔ Funciona en celular
✔ Datos sincronizados
✔ Dashboard profesional
✔ Sistema completo