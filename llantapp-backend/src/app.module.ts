import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

// Núcleo compartido
import { PrismaModule } from './core/prisma/prisma.module';

// Módulos de dominio (features)
import { AuthModule } from './features/autenticacion/auth.module';
import { UsuarioModule } from './features/usuarios/usuario.module';
import { VehiculosModule } from './features/vehiculos/vehiculo.module';
import { NotificacionesModule } from './features/notificaciones/notificaciones.module';
import { CitasModule } from './features/citas/citas.module';
import { HistorialModule } from './features/historial/historial.module';
import { CalificacionesModule } from './features/calificaciones/calificaciones.module';
import { CatalogoServiciosModule } from './features/catalogo-servicios/catalogo-servicios.module';
import { MailerModule } from './core/mailer/mailer.module';
import { SolicitudesModule } from './features/solicitudes/solicitudes.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    // Núcleo (acceso a BD, configuración)
    PrismaModule,

    // Features del dominio
    UsuarioModule,           // Gestión de usuarios
    AuthModule,              // Autenticación
    VehiculosModule,         // Gestión de vehículos
    NotificacionesModule,    // Notificaciones
    CitasModule,             // Gestión de citas
    HistorialModule,         // Historial asociado a citas y servicios
    CalificacionesModule,    // Calificaciones del servicio
    CatalogoServiciosModule, // Catálogo de servicios
    MailerModule,            // Envío de correos
    SolicitudesModule,       // Solicitudes de configuración de talleres
  ],
})
export class AppModule {}
