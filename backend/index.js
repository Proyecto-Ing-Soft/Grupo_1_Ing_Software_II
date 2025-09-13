  import express from "express";
  import cors from "cors";
  import { sequelize } from "./config/database.js";
  import authRoutes from "./routes/authRoutes.js";
  import usuarioRoutes from "./routes/usuarioRoutes.js";
  import carritoRoutes from "./routes/carritoRoutes.js";
  import guardadoRoutes from "./routes/guardadoRoutes.js";
  import ordenRoutes from "./routes/ordenRoutes.js";
  import categoriaRoutes from "./routes/categoriaRoutes.js";
  import productoRoutes from "./routes/productoRoutes.js";
  import dashboardRoutes from "./routes/dashboardRoutes.js";
  import usuarioAdminRoutes from "./routes/usuarioAdminRoutes.js";
  import ordenAdminRoutes from "./routes/ordenAdminRoutes.js";
  import serieRoutes from "./routes/serieRoutes.js";
  import parametrosRoutes from "./routes/parametrosRoutes.js";

  const app = express();
  app.use(cors());
  app.use(express.json());

  app.use("/api/auth", authRoutes);
  app.use("/api/usuario", usuarioRoutes);
  app.use("/api/carrito", carritoRoutes);
  app.use("/api/guardado", guardadoRoutes);
  app.use("/api/orden", ordenRoutes);
  app.use("/api/categoria", categoriaRoutes);
  app.use("/api/producto", productoRoutes);
  app.use("/api/dashboard", dashboardRoutes);
  app.use("/api/usuario-admin", usuarioAdminRoutes);
  app.use("/api/orden-admin", ordenAdminRoutes);
  app.use("/api/serie", serieRoutes);
  app.use("/api/parametros", parametrosRoutes);

  try {
    await sequelize.authenticate();
    console.log("Conexión establecida con la base de datos.");

    await sequelize.sync();
    app.listen(3000, () => {
      console.log("Servidor corriendo en http://localhost:3000");

    });

  } catch (error) {
    console.error("Error al conectar con la base de datos:", error);
  }


  