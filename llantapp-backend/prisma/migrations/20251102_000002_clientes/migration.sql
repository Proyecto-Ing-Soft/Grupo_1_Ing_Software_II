set search_path to app, public;

create table if not exists usuario_cliente (
  usuario_cliente_id bigint generated always as identity primary key,
  nombre_completo     text   not null,
  email               text   not null unique,
  telefono            text,
  password_hash       text   not null,
  fecha_creacion      timestamptz not null default now(),
  ultimo_login        timestamptz
);
