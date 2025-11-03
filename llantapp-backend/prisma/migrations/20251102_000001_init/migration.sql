create schema if not exists app;
set search_path to app, public;
create extension if not exists pgcrypto;

create table if not exists taller_estado(
  taller_estado_id bigint generated always as identity primary key,
  codigo text unique not null,
  nombre text not null,
  descripcion text
);

create table if not exists taller(
  taller_id bigint generated always as identity primary key,
  slug text unique not null,
  nombre_comercial text not null,
  esquema text unique not null,
  taller_estado_id bigint not null references taller_estado(taller_estado_id),
  contacto_email text,
  contacto_celular text,
  fecha_creacion timestamptz not null default now(),
  fecha_activacion timestamptz
);

create index if not exists ix_taller_estado on taller(taller_estado_id);

create table if not exists solicitud_taller_estado(
  solicitud_taller_estado_id bigint generated always as identity primary key,
  codigo text unique not null,
  nombre text not null
);

create table if not exists owner(
  owner_id bigint generated always as identity primary key,
  nombre text not null,
  email text unique not null,
  password_hash text not null,
  activo boolean not null default true,
  fecha_creacion timestamptz not null default now()
);

create table if not exists solicitud_taller(
  solicitud_taller_id bigint generated always as identity primary key,
  solicitante_nombre text not null,
  solicitante_email text not null,
  razon_social text not null,
  ruc text not null,
  telefono text,
  direccion text,
  slug_propuesto text not null,
  observaciones text,
  solicitud_taller_estado_id bigint not null references solicitud_taller_estado(solicitud_taller_estado_id),
  fecha_solicitud timestamptz not null default now(),
  fecha_resolucion timestamptz,
  resuelto_por_owner_id bigint references owner(owner_id),
  taller_creado_id bigint references taller(taller_id)
);

create index if not exists ix_solicitud_taller_estado on solicitud_taller(solicitud_taller_estado_id);
create index if not exists ix_solicitud_taller_fecha on solicitud_taller(fecha_solicitud);

create table if not exists rol(
  rol_id bigint generated always as identity primary key,
  codigo text unique not null,
  nombre text not null,
  descripcion text
);

create table if not exists canal_notificacion(
  canal_notificacion_id bigint generated always as identity primary key,
  codigo text unique not null,
  nombre text not null
);

create table if not exists estado_notificacion(
  estado_notificacion_id bigint generated always as identity primary key,
  codigo text unique not null,
  nombre text not null
);

create table if not exists tipo_mensaje(
  tipo_mensaje_id bigint generated always as identity primary key,
  codigo text unique not null,
  nombre text not null
);

create table if not exists plantilla_mensaje(
  plantilla_mensaje_id bigint generated always as identity primary key,
  tipo_mensaje_id bigint not null references tipo_mensaje(tipo_mensaje_id),
  nombre text not null,
  asunto text not null,
  cuerpo_html text not null,
  activo boolean not null default true
);

create table if not exists bitacora_notificacion(
  bitacora_notificacion_id bigint generated always as identity primary key,
  taller_id bigint not null references taller(taller_id),
  canal_notificacion_id bigint not null references canal_notificacion(canal_notificacion_id),
  tipo_mensaje_id bigint not null references tipo_mensaje(tipo_mensaje_id),
  destinatario text not null,
  plantilla_mensaje_id bigint references plantilla_mensaje(plantilla_mensaje_id),
  payload_json jsonb not null,
  estado_notificacion_id bigint not null references estado_notificacion(estado_notificacion_id),
  error_detalle text,
  fecha_intento timestamptz not null default now(),
  fecha_envio timestamptz,
  correlacion_id uuid
);

create index if not exists ix_bitacora_taller_fecha on bitacora_notificacion(taller_id, fecha_intento);
create index if not exists ix_bitacora_estado on bitacora_notificacion(estado_notificacion_id);
create index if not exists ix_bitacora_payload on bitacora_notificacion using gin(payload_json);

create table if not exists marca_vehiculo(
  marca_vehiculo_id bigint generated always as identity primary key,
  nombre text unique not null
);

create table if not exists modelo_vehiculo(
  modelo_vehiculo_id bigint generated always as identity primary key,
  marca_vehiculo_id bigint not null references marca_vehiculo(marca_vehiculo_id),
  nombre text not null,
  unique(marca_vehiculo_id, nombre)
);

create table if not exists tipo_documento_identidad(
  tipo_documento_identidad_id bigint generated always as identity primary key,
  codigo text unique not null,
  nombre text not null
);

create table if not exists unidad_medida(
  unidad_medida_id bigint generated always as identity primary key,
  codigo text unique not null,
  nombre text not null
);

create table if not exists categoria_producto(
  categoria_producto_id bigint generated always as identity primary key,
  nombre text unique not null,
  descripcion text
);

create table if not exists motivo_reasignacion(
  motivo_reasignacion_id bigint generated always as identity primary key,
  nombre text unique not null,
  descripcion text
);

insert into taller_estado(codigo,nombre,descripcion) values
('pendiente','Pendiente',''),
('activo','Activo',''),
('inactivo','Inactivo',''),
('suspendido','Suspendido','')
on conflict do nothing;

insert into solicitud_taller_estado(codigo,nombre) values
('pendiente','Pendiente'),
('aprobado','Aprobado'),
('rechazado','Rechazado')
on conflict do nothing;

insert into rol(codigo,nombre,descripcion) values
('OWNER','Owner',''),
('ADMIN_TALLER','Administrador de taller',''),
('MECANICO','Mecánico',''),
('CLIENTE','Cliente','')
on conflict do nothing;

insert into canal_notificacion(codigo,nombre) values
('email','Email'),
('sms','SMS'),
('push','Push')
on conflict do nothing;

insert into estado_notificacion(codigo,nombre) values
('pendiente','Pendiente'),
('enviado','Enviado'),
('error','Error')
on conflict do nothing;

insert into tipo_mensaje(codigo,nombre) values
('estado_mantenimiento','Estado de mantenimiento'),
('asignacion_mecanico','Asignación de mecánico'),
('promocion','Promoción'),
('bajo_inventario','Bajo inventario'),
('resumen_tecnico','Resumen técnico')
on conflict do nothing;

insert into tipo_documento_identidad(codigo,nombre) values
('DNI','DNI'),
('CE','Carné de extranjería'),
('RUC','RUC')
on conflict do nothing;

insert into unidad_medida(codigo,nombre) values
('UN','Unidad'),
('L','Litro'),
('KG','Kilogramo')
on conflict do nothing;

create or replace function app.crear_esquema_taller(p_slug text, p_nombre text, p_contacto_email text, p_contacto_celular text)
returns void
language plpgsql
as $$
declare
  v_esquema text := format('taller_%s', p_slug);
  v_taller_id bigint;
  v_estado_activo bigint;
begin
  select taller_estado_id into v_estado_activo from app.taller_estado where codigo='activo';
  if v_estado_activo is null then
    raise exception 'no existe estado activo';
  end if;

  execute format('create schema if not exists %I', v_esquema);

  execute format('create table if not exists %I.usuario_estado(
    usuario_estado_id bigint generated always as identity primary key,
    codigo text unique not null,
    nombre text not null
  )', v_esquema);

  execute format('insert into %I.usuario_estado(codigo,nombre) values
    (''activo'',''Activo''),(''inactivo'',''Inactivo''),(''bloqueado'',''Bloqueado'')
    on conflict do nothing', v_esquema);

  execute format('create table if not exists %I.usuario(
    usuario_id bigint generated always as identity primary key,
    nombres text not null,
    apellidos text not null,
    email text not null,
    telefono text,
    tipo_documento_identidad_id bigint references app.tipo_documento_identidad(tipo_documento_identidad_id),
    numero_documento text,
    password_hash text not null,
    usuario_estado_id bigint not null references %I.usuario_estado(usuario_estado_id),
    ultimo_login timestamptz,
    fecha_alta timestamptz not null default now(),
    fecha_baja timestamptz,
    unique(email)
  )', v_esquema, v_esquema);

  execute format('create table if not exists %I.usuario_rol(
    usuario_rol_id bigint generated always as identity primary key,
    usuario_id bigint not null references %I.usuario(usuario_id),
    rol_id bigint not null references app.rol(rol_id),
    unique(usuario_id, rol_id)
  )', v_esquema, v_esquema);

  execute format('create table if not exists %I.direccion(
    direccion_id bigint generated always as identity primary key,
    usuario_id bigint not null references %I.usuario(usuario_id),
    linea1 text not null,
    linea2 text,
    distrito text not null,
    provincia text not null,
    departamento text not null,
    referencia text
  )', v_esquema, v_esquema);

  execute format('create table if not exists %I.vehiculo(
    vehiculo_id bigint generated always as identity primary key,
    propietario_usuario_id bigint not null references %I.usuario(usuario_id),
    creador_usuario_id bigint not null references %I.usuario(usuario_id),
    placa text not null,
    vin text,
    marca_vehiculo_id bigint not null references app.marca_vehiculo(marca_vehiculo_id),
    modelo_vehiculo_id bigint not null references app.modelo_vehiculo(modelo_vehiculo_id),
    anio smallint not null,
    color text,
    alias text,
    fecha_registro timestamptz not null default now(),
    unique(placa)
  )', v_esquema, v_esquema, v_esquema);

  execute format('create table if not exists %I.vehiculo_propietario_hist(
    vehiculo_propietario_hist_id bigint generated always as identity primary key,
    vehiculo_id bigint not null references %I.vehiculo(vehiculo_id),
    propietario_usuario_id bigint not null references %I.usuario(usuario_id),
    fecha_inicio timestamptz not null,
    fecha_fin timestamptz
  )', v_esquema, v_esquema, v_esquema);

  execute format('create table if not exists %I.lectura_odometro(
    lectura_odometro_id bigint generated always as identity primary key,
    vehiculo_id bigint not null references %I.vehiculo(vehiculo_id),
    kilometraje integer not null,
    fecha_lectura timestamptz not null
  )', v_esquema, v_esquema);
  execute format('create index if not exists %I on %I.lectura_odometro(vehiculo_id, fecha_lectura)', 'ix_lectura_odometro', v_esquema);

  execute format('create table if not exists %I.servicio(
    servicio_id bigint generated always as identity primary key,
    codigo text not null,
    nombre text not null,
    descripcion text not null,
    precio_base numeric(12,2) not null,
    duracion_estimada_min integer not null,
    activo boolean not null default true,
    unique(codigo)
  )', v_esquema);

  execute format('create table if not exists %I.servicio_mecanico(
    servicio_mecanico_id bigint generated always as identity primary key,
    servicio_id bigint not null references %I.servicio(servicio_id),
    mecanico_usuario_id bigint not null references %I.usuario(usuario_id),
    unique(servicio_id, mecanico_usuario_id)
  )', v_esquema, v_esquema, v_esquema);

  execute format('create table if not exists %I.solicitud_servicio_estado(
    solicitud_servicio_estado_id bigint generated always as identity primary key,
    codigo text unique not null,
    nombre text not null
  )', v_esquema);
  execute format('insert into %I.solicitud_servicio_estado(codigo,nombre) values
    (''recibida'',''Recibida''),(''en_revision'',''En revisión''),(''rechazada'',''Rechazada''),(''convertida_en_cita'',''Convertida en cita'')
    on conflict do nothing', v_esquema);

  execute format('create table if not exists %I.estado_cita(
    estado_cita_id bigint generated always as identity primary key,
    codigo text unique not null,
    nombre text not null,
    orden smallint not null
  )', v_esquema);
  execute format('insert into %I.estado_cita(codigo,nombre,orden) values
    (''solicitada'',''Solicitada'',1),
    (''asignada'',''Asignada'',2),
    (''en_progreso'',''En progreso'',3),
    (''terminada'',''Terminada'',4),
    (''cancelada'',''Cancelada'',5)
    on conflict do nothing', v_esquema);

  execute format('create table if not exists %I.cita(
    cita_id bigint generated always as identity primary key,
    cliente_usuario_id bigint not null references %I.usuario(usuario_id),
    vehiculo_id bigint not null references %I.vehiculo(vehiculo_id),
    servicio_id bigint not null references %I.servicio(servicio_id),
    fecha_programada timestamptz not null,
    estado_cita_id bigint not null references %I.estado_cita(estado_cita_id),
    prioridad smallint,
    comentarios_cliente text,
    fecha_creacion timestamptz not null default now(),
    ultima_actualizacion timestamptz not null default now()
  )', v_esquema, v_esquema, v_esquema, v_esquema, v_esquema);

  execute format('create index if not exists %I on %I.cita(estado_cita_id, fecha_programada)', 'ix_cita_estado_fecha', v_esquema);

  execute format('create table if not exists %I.cita_historial_estado(
    cita_historial_estado_id bigint generated always as identity primary key,
    cita_id bigint not null references %I.cita(cita_id),
    estado_cita_id bigint not null references %I.estado_cita(estado_cita_id),
    cambiado_por_usuario_id bigint not null references %I.usuario(usuario_id),
    fecha_cambio timestamptz not null default now(),
    observacion text
  )', v_esquema, v_esquema, v_esquema, v_esquema);

  execute format('create index if not exists %I on %I.cita_historial_estado(cita_id, fecha_cambio)', 'ix_cita_hist', v_esquema);

  execute format('create table if not exists %I.asignacion(
    asignacion_id bigint generated always as identity primary key,
    cita_id bigint not null references %I.cita(cita_id),
    mecanico_usuario_id bigint not null references %I.usuario(usuario_id),
    asignado_por_usuario_id bigint not null references %I.usuario(usuario_id),
    fecha_asignacion timestamptz not null default now(),
    activo boolean not null default true
  )', v_esquema, v_esquema, v_esquema, v_esquema);

  execute format('create unique index if not exists %I on %I.asignacion(cita_id, mecanico_usuario_id) where activo', 'ux_asignacion_activa', v_esquema);

  execute format('create table if not exists %I.reasignacion(
    reasignacion_id bigint generated always as identity primary key,
    cita_id bigint not null references %I.cita(cita_id),
    mecanico_anterior_usuario_id bigint not null references %I.usuario(usuario_id),
    mecanico_nuevo_usuario_id bigint not null references %I.usuario(usuario_id),
    motivo_reasignacion_id bigint not null references app.motivo_reasignacion(motivo_reasignacion_id),
    descripcion text,
    realizado_por_usuario_id bigint not null references %I.usuario(usuario_id),
    fecha_reasignacion timestamptz not null default now()
  )', v_esquema, v_esquema, v_esquema, v_esquema);

  execute format('create table if not exists %I.estado_mantenimiento(
    estado_mantenimiento_id bigint generated always as identity primary key,
    codigo text unique not null,
    nombre text not null
  )', v_esquema);
  execute format('insert into %I.estado_mantenimiento(codigo,nombre) values
    (''abierto'',''Abierto''),(''en_progreso'',''En progreso''),(''cerrado'',''Cerrado'')
    on conflict do nothing', v_esquema);

  execute format('create table if not exists %I.mantenimiento(
    mantenimiento_id bigint generated always as identity primary key,
    cita_id bigint not null unique references %I.cita(cita_id),
    mecanico_principal_usuario_id bigint not null references %I.usuario(usuario_id),
    estado_mantenimiento_id bigint not null references %I.estado_mantenimiento(estado_mantenimiento_id),
    fecha_inicio timestamptz,
    fecha_fin timestamptz,
    descripcion_trabajos text,
    costo_mano_obra numeric(12,2) not null default 0,
    costo_total numeric(12,2) not null default 0,
    resumen_tecnico_html text
  )', v_esquema, v_esquema, v_esquema, v_esquema);

  execute format('create table if not exists %I.tipo_medio(
    tipo_medio_id bigint generated always as identity primary key,
    codigo text unique not null,
    nombre text not null
  )', v_esquema);
  execute format('insert into %I.tipo_medio(codigo,nombre) values
    (''imagen'',''Imagen''),(''video'',''Video''),(''pdf'',''PDF''),(''otro'',''Otro'')
    on conflict do nothing', v_esquema);

  execute format('create table if not exists %I.evidencia(
    evidencia_id bigint generated always as identity primary key,
    cita_id bigint references %I.cita(cita_id),
    mantenimiento_id bigint references %I.mantenimiento(mantenimiento_id),
    subido_por_usuario_id bigint not null references %I.usuario(usuario_id),
    tipo_medio_id bigint not null references %I.tipo_medio(tipo_medio_id),
    nombre_archivo text not null,
    mime_type text not null,
    tamanio_bytes bigint not null,
    bytes bytea,
    url_externa text,
    fecha_subida timestamptz not null default now(),
    check (cita_id is not null or mantenimiento_id is not null)
  )', v_esquema, v_esquema, v_esquema, v_esquema, v_esquema);

  execute format('create table if not exists %I.calificacion(
    calificacion_id bigint generated always as identity primary key,
    mantenimiento_id bigint not null references %I.mantenimiento(mantenimiento_id),
    cliente_usuario_id bigint not null references %I.usuario(usuario_id),
    puntuacion smallint not null,
    comentario text,
    visible boolean not null default true,
    fecha_creacion timestamptz not null default now(),
    unique(mantenimiento_id, cliente_usuario_id),
    check (puntuacion between 1 and 5)
  )', v_esquema, v_esquema, v_esquema);

  execute format('create table if not exists %I.intervencion_externa(
    intervencion_externa_id bigint generated always as identity primary key,
    vehiculo_id bigint not null references %I.vehiculo(vehiculo_id),
    cliente_usuario_id bigint not null references %I.usuario(usuario_id),
    fecha timestamptz not null,
    descripcion text not null,
    comprobante_url text
  )', v_esquema, v_esquema, v_esquema);

  execute format('create table if not exists %I.consumible(
    consumible_id bigint generated always as identity primary key,
    codigo text not null,
    nombre text not null,
    categoria_producto_id bigint not null references app.categoria_producto(categoria_producto_id),
    unidad_medida_id bigint not null references app.unidad_medida(unidad_medida_id),
    stock_actual numeric(14,3) not null default 0,
    stock_minimo_alerta numeric(14,3) not null default 0,
    costo_unitario numeric(12,2) not null default 0,
    activo boolean not null default true,
    unique(codigo)
  )', v_esquema);

  execute format('create table if not exists %I.tipo_movimiento_inventario(
    tipo_movimiento_inventario_id bigint generated always as identity primary key,
    codigo text unique not null,
    nombre text not null
  )', v_esquema);
  execute format('insert into %I.tipo_movimiento_inventario(codigo,nombre) values
    (''ingreso'',''Ingreso''),(''egreso_consumo'',''Egreso por consumo''),(''ajuste'',''Ajuste'')
    on conflict do nothing', v_esquema);

  execute format('create table if not exists %I.movimiento_inventario(
    movimiento_inventario_id bigint generated always as identity primary key,
    consumible_id bigint not null references %I.consumible(consumible_id),
    tipo_movimiento_inventario_id bigint not null references %I.tipo_movimiento_inventario(tipo_movimiento_inventario_id),
    cantidad numeric(14,3) not null,
    costo_unitario numeric(12,2) not null,
    referencia text,
    mantenimiento_id bigint references %I.mantenimiento(mantenimiento_id),
    realizado_por_usuario_id bigint not null references %I.usuario(usuario_id),
    fecha_movimiento timestamptz not null default now()
  )', v_esquema, v_esquema, v_esquema, v_esquema, v_esquema);

  execute format('create index if not exists %I on %I.movimiento_inventario(consumible_id, fecha_movimiento)', 'ix_mov_inv', v_esquema);

  execute format('create or replace function %I.f_mov_inv_ajusta_stock() returns trigger language plpgsql as $b$
  begin
    if new.tipo_movimiento_inventario_id = (select tipo_movimiento_inventario_id from %I.tipo_movimiento_inventario where codigo=''ingreso'') then
      update %I.consumible set stock_actual = stock_actual + new.cantidad where consumible_id = new.consumible_id;
    elsif new.tipo_movimiento_inventario_id = (select tipo_movimiento_inventario_id from %I.tipo_movimiento_inventario where codigo=''egreso_consumo'') then
      update %I.consumible set stock_actual = stock_actual - new.cantidad where consumible_id = new.consumible_id;
    end if;
    return new;
  end
  $b$;', v_esquema, v_esquema, v_esquema, v_esquema, v_esquema);

  execute format('drop trigger if exists trg_mov_inv_stock on %I.movimiento_inventario', v_esquema);
  execute format('create trigger trg_mov_inv_stock after insert on %I.movimiento_inventario for each row execute function %I.f_mov_inv_ajusta_stock()', v_esquema, v_esquema);

  execute format('create table if not exists %I.uso_consumible(
    uso_consumible_id bigint generated always as identity primary key,
    mantenimiento_id bigint not null references %I.mantenimiento(mantenimiento_id),
    consumible_id bigint not null references %I.consumible(consumible_id),
    cantidad numeric(14,3) not null,
    costo_unitario numeric(12,2) not null,
    unique(mantenimiento_id, consumible_id)
  )', v_esquema, v_esquema, v_esquema);

  execute format('create table if not exists %I.promocion(
    promocion_id bigint generated always as identity primary key,
    titulo text not null,
    descripcion text not null,
    fecha_inicio timestamptz not null,
    fecha_fin timestamptz not null,
    activo boolean not null default true,
    segmento_json jsonb not null,
    creado_por_usuario_id bigint not null references %I.usuario(usuario_id),
    fecha_creacion timestamptz not null default now()
  )', v_esquema, v_esquema);

  execute format('create index if not exists %I on %I.promocion using gin(segmento_json)', 'ix_prom_segmento', v_esquema);

  execute format('create table if not exists %I.notificacion_local(
    notificacion_local_id bigint generated always as identity primary key,
    usuario_destinatario_id bigint not null references %I.usuario(usuario_id),
    tipo_mensaje_id bigint not null references app.tipo_mensaje(tipo_mensaje_id),
    canal_notificacion_id bigint not null references app.canal_notificacion(canal_notificacion_id),
    plantilla_mensaje_id bigint references app.plantilla_mensaje(plantilla_mensaje_id),
    asunto text not null,
    cuerpo_html text not null,
    estado_notificacion_id bigint not null references app.estado_notificacion(estado_notificacion_id),
    correlacion_id uuid,
    fecha_creacion timestamptz not null default now(),
    fecha_envio timestamptz,
    error_detalle text
  )', v_esquema, v_esquema);

  execute format('create index if not exists %I on %I.notificacion_local(usuario_destinatario_id, estado_notificacion_id)', 'ix_notif_local', v_esquema);

  execute format('create table if not exists %I.promocion_destinatario(
    promocion_destinatario_id bigint generated always as identity primary key,
    promocion_id bigint not null references %I.promocion(promocion_id),
    usuario_id bigint not null references %I.usuario(usuario_id),
    estado_notificacion_id bigint not null references app.estado_notificacion(estado_notificacion_id),
    fecha_envio timestamptz,
    fecha_lectura timestamptz,
    bitacora_notificacion_id bigint references app.bitacora_notificacion(bitacora_notificacion_id),
    unique(promocion_id, usuario_id)
  )', v_esquema, v_esquema, v_esquema);

  execute format('create table if not exists %I.regla_mantenimiento(
    regla_mantenimiento_id bigint generated always as identity primary key,
    servicio_id bigint not null references %I.servicio(servicio_id),
    dias_intervalo integer,
    km_intervalo integer
  )', v_esquema, v_esquema);

  insert into app.taller(slug,nombre_comercial,esquema,taller_estado_id,contacto_email,contacto_celular,fecha_activacion)
  values(p_slug, coalesce(p_nombre,p_slug), v_esquema, v_estado_activo, p_contacto_email, p_contacto_celular, now())
  returning taller_id into v_taller_id;
end;
$$;

select app.crear_esquema_taller('demo','Taller Demo',null,null);
