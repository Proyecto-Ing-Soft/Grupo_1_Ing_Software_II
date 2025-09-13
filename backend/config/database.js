import { Sequelize } from "sequelize";

export const sequelize = new Sequelize("postgres", "admincloud", "Grupo-01", {
  host: "postgres-cloudweb.postgres.database.azure.com",
  dialect: "postgres",
  dialectOptions: {
    ssl: {
      require: true,
      rejectUnauthorized: false 
    }
  }
});
