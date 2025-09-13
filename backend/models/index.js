import { sequelize } from '../config/database.js';
import { DataTypes } from 'sequelize';

export const PAIS = sequelize.define('PAIS', {
  id_pais: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nombre_pais: { type: DataTypes.STRING(100), unique: true }
}, { freezeTableName: true, timestamps: false });

export const REGION = sequelize.define('REGION', {
  id_region: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nombre_region: { type: DataTypes.STRING(100), unique: true }
}, { freezeTableName: true, timestamps: false });

export const TIPO_CLUB = sequelize.define('TIPO_CLUB', {
  id_tipo_club: { type: DataTypes.INTEGER, primaryKey: true },
  tipo_club: { type: DataTypes.STRING(30), unique: true }
}, { freezeTableName: true, timestamps: false });

export const EQUIPO = sequelize.define('EQUIPO', {
  id_equipo: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nombre_equipo: { type: DataTypes.STRING(100), unique: true },
  id_pais: DataTypes.INTEGER,
  id_tipo_club: DataTypes.INTEGER
}, { freezeTableName: true, timestamps: false });

EQUIPO.belongsTo(PAIS, { foreignKey: 'id_pais' });
PAIS.hasMany(EQUIPO, { foreignKey: 'id_pais' });
EQUIPO.belongsTo(TIPO_CLUB, { foreignKey: 'id_tipo_club' });
TIPO_CLUB.hasMany(EQUIPO, { foreignKey: 'id_tipo_club' });

export const TEMPORADA = sequelize.define('TEMPORADA', {
  id_temporada: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  descripcion_temporada: { type: DataTypes.STRING(20), unique: true },
  año_inicio: DataTypes.INTEGER,
  año_fin: DataTypes.INTEGER
}, { freezeTableName: true, timestamps: false });

export const CATEGORIA = sequelize.define('CATEGORIA', {
  id_categoria: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nombre_categoria: { type: DataTypes.STRING(30), unique: true },
  imagen_url: DataTypes.STRING(1000)
}, { freezeTableName: true, timestamps: false });

export const MARCA = sequelize.define('MARCA', {
  id_marca: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nombre_marca: { type: DataTypes.STRING(100), unique: true }
}, { freezeTableName: true, timestamps: false });

export const GENERO = sequelize.define('GENERO', {
  id_genero: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  descripcion_genero: { type: DataTypes.STRING(20), unique: true }
}, { freezeTableName: true, timestamps: false });

export const TALLA = sequelize.define('TALLA', {
  id_talla: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  descripcion_talla: { type: DataTypes.STRING(5), unique: true }
}, { freezeTableName: true, timestamps: false });

export const TIPO_CAMISETA = sequelize.define('TIPO_CAMISETA', {
  id_tipo_camiseta: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  descripcion_tipo: { type: DataTypes.STRING(30), unique: true }
}, { freezeTableName: true, timestamps: false });

export const CAMISETA = sequelize.define('CAMISETA', {
  id_camiseta: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  id_equipo: DataTypes.INTEGER,
  id_temporada: DataTypes.INTEGER,
  id_categoria: DataTypes.INTEGER,
  id_marca: DataTypes.INTEGER,
  id_tipo_camiseta: DataTypes.INTEGER,
  descripcion_camiseta: DataTypes.STRING(200),
  imagen_url: DataTypes.STRING(1000)
}, { freezeTableName: true, timestamps: false });

CAMISETA.belongsTo(EQUIPO, { foreignKey: 'id_equipo' });
CAMISETA.belongsTo(TEMPORADA, { foreignKey: 'id_temporada' });
CAMISETA.belongsTo(CATEGORIA, { foreignKey: 'id_categoria' });
CAMISETA.belongsTo(MARCA, { foreignKey: 'id_marca' });
CAMISETA.belongsTo(TIPO_CAMISETA, { foreignKey: 'id_tipo_camiseta' });
TEMPORADA.hasMany(CAMISETA, { foreignKey: 'id_temporada' });
CATEGORIA.hasMany(CAMISETA, { foreignKey: 'id_categoria' });
MARCA.hasMany(CAMISETA, { foreignKey: 'id_marca' });
TIPO_CAMISETA.hasMany(CAMISETA, { foreignKey: 'id_tipo_camiseta' });

export const PRODUCTO = sequelize.define('PRODUCTO', {
  id_producto: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  id_camiseta: DataTypes.INTEGER,
  id_genero: DataTypes.INTEGER,
  id_talla: DataTypes.INTEGER,
  precio: DataTypes.DECIMAL(10,2),
  stock: DataTypes.INTEGER,
  sku: { type: DataTypes.STRING(200), unique: true },
  activo: { type: DataTypes.BOOLEAN, defaultValue: true }
}, { freezeTableName: true, timestamps: false });

PRODUCTO.belongsTo(CAMISETA, { foreignKey: 'id_camiseta' });
PRODUCTO.belongsTo(GENERO, { foreignKey: 'id_genero' });
PRODUCTO.belongsTo(TALLA, { foreignKey: 'id_talla' });
CAMISETA.hasMany(PRODUCTO, { foreignKey: 'id_camiseta' });
GENERO.hasMany(PRODUCTO, { foreignKey: 'id_genero' });
TALLA.hasMany(PRODUCTO, { foreignKey: 'id_talla' });

export const EQUIPO_REGION = sequelize.define('EQUIPO_REGION', {
  id_equipo: { type: DataTypes.INTEGER, primaryKey: true },
  id_region: { type: DataTypes.INTEGER, primaryKey: true }
}, { freezeTableName: true, timestamps: false });

EQUIPO.belongsToMany(REGION, { through: EQUIPO_REGION, foreignKey: 'id_equipo' });
REGION.belongsToMany(EQUIPO, { through: EQUIPO_REGION, foreignKey: 'id_region' });

export const ROL = sequelize.define('ROL', {
  id_rol: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nombre_rol: { type: DataTypes.STRING(20), unique: true }
}, { freezeTableName: true, timestamps: false });

export const USUARIO = sequelize.define('USUARIO', {
  id_usuario: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nombre: DataTypes.STRING(50),
  apellido: DataTypes.STRING(50),
  correo: { type: DataTypes.STRING(100), unique: true },
  password: DataTypes.STRING(200),
  activo: { type: DataTypes.BOOLEAN, defaultValue: true },
  id_rol: DataTypes.INTEGER,
  fecha_registro: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, { freezeTableName: true, timestamps: false });

USUARIO.belongsTo(ROL, { foreignKey: 'id_rol' });
ROL.hasMany(USUARIO, { foreignKey: 'id_rol' });

export const DIRECCION = sequelize.define('DIRECCION', {
  id_direccion: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  id_usuario: DataTypes.INTEGER,
  direccion: DataTypes.STRING(200),
  ciudad: DataTypes.STRING(100),
  region: DataTypes.STRING(100),
  codigo_postal: DataTypes.STRING(20),
  pais: DataTypes.STRING(100),
  telefono: DataTypes.STRING(20)
}, { freezeTableName: true, timestamps: false });

DIRECCION.belongsTo(USUARIO, { foreignKey: 'id_usuario' });
USUARIO.hasMany(DIRECCION, { foreignKey: 'id_usuario' });

export const CARRITO = sequelize.define('CARRITO', {
  id_carrito: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  id_usuario: DataTypes.INTEGER
}, { freezeTableName: true, timestamps: false });

CARRITO.belongsTo(USUARIO, { foreignKey: 'id_usuario' });
USUARIO.hasOne(CARRITO, { foreignKey: 'id_usuario' });

export const CARRITO_ITEM = sequelize.define('CARRITO_ITEM', {
  id_carrito: { type: DataTypes.INTEGER, primaryKey: true },
  id_producto: { type: DataTypes.INTEGER, primaryKey: true },
  guardado: { type: DataTypes.BOOLEAN, primaryKey: true, defaultValue: false },
  cantidad: DataTypes.INTEGER
}, { freezeTableName: true, timestamps: false });

CARRITO_ITEM.belongsTo(CARRITO, { foreignKey: 'id_carrito' });
CARRITO_ITEM.belongsTo(PRODUCTO, { foreignKey: 'id_producto' });
CARRITO.hasMany(CARRITO_ITEM, { foreignKey: 'id_carrito' });
PRODUCTO.hasMany(CARRITO_ITEM, { foreignKey: 'id_producto' });

export const METODO_PAGO = sequelize.define('METODO_PAGO', {
  id_metodo_pago: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nombre_metodo: { type: DataTypes.STRING(30), unique: true }
}, { freezeTableName: true, timestamps: false });

export const METODO_ENVIO = sequelize.define('METODO_ENVIO', {
  id_metodo_envio: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nombre_envio: { type: DataTypes.STRING(50), unique: true },
  costo: DataTypes.DECIMAL(10,2),
  descripcion: DataTypes.STRING(200)
}, { freezeTableName: true, timestamps: false });

export const ESTADO_ORDEN = sequelize.define('ESTADO_ORDEN', {
  id_estado_orden: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nombre_estado: { type: DataTypes.STRING(30), unique: true }
}, { freezeTableName: true, timestamps: false });

export const ORDEN = sequelize.define('ORDEN', {
  id_orden: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  id_usuario: DataTypes.INTEGER,
  id_direccion: DataTypes.INTEGER,
  id_metodo_pago: DataTypes.INTEGER,
  id_metodo_envio: DataTypes.INTEGER,
  id_estado_orden: DataTypes.INTEGER,
  total: DataTypes.DECIMAL(10,2),
  fecha: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, { freezeTableName: true, timestamps: false });

ORDEN.belongsTo(USUARIO, { foreignKey: 'id_usuario' });
ORDEN.belongsTo(DIRECCION, { foreignKey: 'id_direccion' });
ORDEN.belongsTo(METODO_PAGO, { foreignKey: 'id_metodo_pago' });
ORDEN.belongsTo(METODO_ENVIO, { foreignKey: 'id_metodo_envio' });
ORDEN.belongsTo(ESTADO_ORDEN, { foreignKey: 'id_estado_orden' });
USUARIO.hasMany(ORDEN, { foreignKey: 'id_usuario' });
DIRECCION.hasMany(ORDEN, { foreignKey: 'id_direccion' });
METODO_PAGO.hasMany(ORDEN, { foreignKey: 'id_metodo_pago' });
METODO_ENVIO.hasMany(ORDEN, { foreignKey: 'id_metodo_envio' });
ESTADO_ORDEN.hasMany(ORDEN, { foreignKey: 'id_estado_orden' });

export const DETALLE_ORDEN = sequelize.define('DETALLE_ORDEN', {
  id_detalle: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  id_orden: DataTypes.INTEGER,
  id_producto: DataTypes.INTEGER,
  cantidad: DataTypes.INTEGER,
  precio_unitario: DataTypes.DECIMAL(10,2),
  subtotal: DataTypes.DECIMAL(10,2)
}, { freezeTableName: true, timestamps: false });

DETALLE_ORDEN.belongsTo(ORDEN, { foreignKey: 'id_orden' });
DETALLE_ORDEN.belongsTo(PRODUCTO, { foreignKey: 'id_producto' });
ORDEN.hasMany(DETALLE_ORDEN, { foreignKey: 'id_orden' });
PRODUCTO.hasMany(DETALLE_ORDEN, { foreignKey: 'id_producto' });

export const SERIE = sequelize.define('SERIE', {
  id_serie: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nombre_serie: { type: DataTypes.STRING(100), unique: true },
  descripcion: DataTypes.STRING(200),
  imagen_url: DataTypes.STRING(1000)
}, { freezeTableName: true, timestamps: false });

export const SERIE_PRODUCTO = sequelize.define('SERIE_PRODUCTO', {
  id_serie: { type: DataTypes.INTEGER, primaryKey: true },
  id_producto: { type: DataTypes.INTEGER, primaryKey: true }
}, { freezeTableName: true, timestamps: false });

SERIE.belongsToMany(PRODUCTO, { through: SERIE_PRODUCTO, foreignKey: 'id_serie' });
PRODUCTO.belongsToMany(SERIE, { through: SERIE_PRODUCTO, foreignKey: 'id_producto' });

export const LOG_ACTIVIDAD = sequelize.define('LOG_ACTIVIDAD', {
  id_log: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  id_usuario: DataTypes.INTEGER,
  tipo_actividad: DataTypes.STRING(100),
  descripcion: DataTypes.STRING(200),
  fecha: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, { freezeTableName: true, timestamps: false });

LOG_ACTIVIDAD.belongsTo(USUARIO, { foreignKey: 'id_usuario' });
USUARIO.hasMany(LOG_ACTIVIDAD, { foreignKey: 'id_usuario' });
