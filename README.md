# 🛞 LlantApp

## 📋 Descripción

**LlantApp** es una aplicación web diseñada para optimizar la gestión integral del mantenimiento vehicular. Centraliza todo el ciclo de mantenimiento: registro de vehículos, programación de citas, seguimiento de servicios y comunicación entre los actores involucrados. El sistema busca digitalizar procesos manuales e informales (registro de vehículos, agendamiento de citas, notificaciones automáticas, registro de evidencias, confirmación de servicios) para reducir reprocesos, aumentar la eficiencia operativa y ofrecer información confiable para el mantenimiento preventivo.

La aplicación admite tres roles principales de usuario: **Cliente**, **Mecánico** y **Administrador**, cada uno con permisos y funciones específicas. El Cliente puede solicitar citas de servicio, consultar el historial de sus vehículos y calificar los servicios recibidos. El Mecánico recibe las citas asignadas, registra el trabajo realizado (incluyendo evidencias fotográficas o textuales) y puede ver las calificaciones que le dejan los clientes. El Administrador gestiona la asignación de citas entre clientes y mecánicos, supervisa las calificaciones otorgadas y mantiene actualizados los catálogos del sistema (usuarios, talleres y tipos de servicio).

## 🚀 Características principales

- **Usuarios y roles**: Autenticación y autorización de clientes, mecánicos y administradores con distintos niveles de acceso.  
- **Gestión de vehículos**: Registro y consulta de información de los vehículos (placa, marca, modelo, etc.).  
- **Citas de mantenimiento**: Creación, asignación y seguimiento de citas de servicio entre clientes y mecánicos.  
- **Notificaciones**: Envío de alertas automáticas al cliente sobre el estado de su cita (solicitada, en proceso, terminada).  
- **Registro de evidencias**: Adjuntar fotos y descripciones del servicio realizado para documentar el mantenimiento.  
- **Calificación del servicio**: El cliente puede valorar el servicio con estrellas y comentarios; el Administrador puede revisar estas calificaciones.

## 🛠️ Instalación y desarrollo local

Sigue estos pasos para levantar **LlantApp** en tu entorno local:

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/Proyecto-Ing-Soft/Grupo_1_Ing_Software_II.git
   cd Grupo_1_Ing_Software_II
   ```

2. **Instalar dependencias (raíz y subproyectos)**
   ```bash
   npm install

   cd llantapp-backend
   npm install

   cd ../llantapp-frontend
   npm install
   ```

3. **Configurar la base de datos PostgreSQL**
   - Crea una base de datos local llamada `llantapp` (por ejemplo, con `createdb llantapp`).  
   - En `llantapp-backend/.env`, crea el archivo de variables de entorno con la siguiente plantilla (reemplaza `1234` por tu contraseña de PostgreSQL local y ajusta host/puerto según corresponda):

   ```env
   # Conexión a PostgreSQL
   DATABASE_URL="postgresql://postgres:1234@localhost:5432/llantapp?schema=public"

   # Configuración de JWT
   JWT_ACCESS_SECRET="llantapp-clave-super-secretaxdd"
   JWT_ACCESS_TTL="15m"
   JWT_REFRESH_SECRET="llantapp-clave-super-secretaxdd2"
   JWT_REFRESH_TTL="7d"

   # Configuración de CORS
   CORS_ORIGINS="http://localhost:5173"

   # Cookies
   COOKIE_SECURE=false   # true en producción con HTTPS

   # === Correo saliente (bot) ===
   MAIL_HOST=smtp.gmail.com
   MAIL_PORT=587
   MAIL_SECURE=false
   MAIL_USER=bot.llantapp@gmail.com
   MAIL_PASS=pzktruliqxupmrvo
   MAIL_FROM=LlantApp Bot <bot.llantapp@gmail.com>
   MAIL_TO=soporte.llantapp@gmail.com
   ```

   Asegúrate de que `DATABASE_URL` apunte a tu servidor PostgreSQL local y que el puerto, el usuario y la contraseña sean correctos.

4. **Aplicar migraciones de base de datos (Prisma)**
   ```bash
   cd ../llantapp-backend
   npx prisma migrate dev --name init
   ```

5. **Ejecutar la aplicación (frontend + backend)**
   Desde la raíz del proyecto:
   ```bash
   npm run dev
   ```
   Luego abre tu navegador en <http://localhost:5173> para ver la aplicación en funcionamiento.

## 👥 Autores

| Nombre                                    | Usuario        | Rol              |
|-------------------------------------------|----------------|------------------|
| Angello Alejandro Cusque Oropeza          | Angellou29     | Development Team |
| Claudia Patricia Sipion Guillén           | Csg1256        | Development Team |
| Erling Caleb Aguilar Alcalde              | Erling2        | Development Team |
| Erick Obradovich Luna                     | ErickOL07      | Development Team |
| Gabriel Ricardo Satornicio Ramirez        | tornoa1        | Development Team |
| Héctor Gianmarco Arrasco Juárez           | Hector2812     | Scrum Master     |
| Manuel Jesús Revilla Robles               | MamelRR        | Product Owner    |
