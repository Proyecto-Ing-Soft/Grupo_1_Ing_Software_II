import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

// Núcleo compartido
import { PrismaModule } from './core/prisma/prisma/prisma.module';

// Módulos de dominio (features)
import { AuthModule } from './features/autenticacion/autenticacion/auth.module';
import { UsuarioModule } from './features/usuarios/usuario/usuario.module';
import { VehiculosModule } from './features/vehiculos/vehiculos/vehiculo.module';
import { NotificacionesModule } from './features/notificaciones/notificaciones/notificaciones.module';
import { CitasModule } from './features/mantenimientos/citas/citas.module';
import { HistorialModule } from './features/historial/historial/historial.module';
import { CalificacionesModule } from './features/calificaciones/calificaciones/calificaciones.module';

import { CatalogoServiciosModule } from './features/catalogo-servicios/catalogo-servicios/catalogo-servicios.module';
import { MailerModule } from './core/mailer/mailer.module';
import { SolicitudesModule } from './features/solicitudes/solicitudes/solicitudes.module';

// SPRINT 2
import { IntervencionesExternasModule } from './features/intervenciones-externas/intervenciones-externas.module';
import { ConsumiblesModule } from './features/consumibles/consumibles.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),

    // Núcleo (acceso a BD, configuración)
    PrismaModule,

    // Features del dominio
    UsuarioModule,           // Lógica de usuario
    AuthModule,              // Autenticación
    VehiculosModule,         // Gestión de vehículos
    NotificacionesModule,    // Envío y lectura de notificaciones
    CitasModule,            // Citas de mantenimiento
    HistorialModule,        // Historial de mantenimientos
    CalificacionesModule,    // Calificaciones
    IntervencionesExternasModule, // Intervenciones externas sprint 2
    ConsumiblesModule, // SPRINT 2 DE CONSUMIBLES

    CatalogoServiciosModule, // Catálogo + habilitación de mecánicos (US-06)
    MailerModule,         // Envío de correos
    SolicitudesModule,    // Gestión de solicitudes de configuración de LlantApp
  ],
})
export class AppModule {}
