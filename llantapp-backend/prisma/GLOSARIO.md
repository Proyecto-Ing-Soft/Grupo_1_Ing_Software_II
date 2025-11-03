Cluster: conjunto de servidores Postgres que trabajan coordinados para que, si uno cae, otro siga atendiendo; solo uno acepta escrituras a la vez.
Instancia: un Postgres corriendo en una máquina o contenedor, con sus binarios y su carpeta de datos.
Shared-nothing vs shared-disk: en Postgres cada instancia usa su propio disco (shared-nothing); en RAC varias comparten el mismo (shared-disk).
Primaria / Secundaria (réplica): la primaria escribe; las secundarias copian sus cambios desde el registro de transacciones.
Failover: cuando la primaria falla, una réplica toma su lugar automáticamente para no cortar el servicio.
Patroni / etcd: Patroni decide quién es primaria y ejecuta el failover; etcd guarda el “quién manda” mediante consenso.
HAProxy / pgpool: expone un único host/puerto y enruta a la primaria para escribir y a réplicas para leer.
PgBouncer: “reciclador” de conexiones para que la app no abrume a Postgres abriendo miles de conexiones.
WAL: bitácora de todo lo que se escribe; sirve para replicación y para recuperar la base en el tiempo.
search_path: lista de esquemas donde Postgres busca las tablas por defecto.
Esquema: “carpeta lógica” dentro de la misma base física; ahí viven tablas, índices y funciones.
RLS: reglas que limitan filas por tenant; no se usa aquí porque cada taller tiene su propio esquema.
Tenant: el “taller” como cliente lógico aislado adentro de la misma base.
Citus: extensión para distribuir tablas entre nodos si un solo servidor ya no alcanza.
Prisma Migrate: la herramienta de Prisma para versionar y aplicar cambios de esquema.
Migración “cero downtime”: técnica para cambiar el esquema sin tumbar la app, coordinando pasos, réplicas y pruebas.
