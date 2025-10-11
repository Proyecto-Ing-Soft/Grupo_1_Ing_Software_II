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

// <-- NUEVO: catálogo de servicios
import { CatalogoServiciosModule } from './features/catalogo-servicios/catalogo-servicios/catalogo-servicios.module';

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
    CitasModule,             // Citas de mantenimiento
    HistorialModule,         // Historial de mantenimientos
    CalificacionesModule,    // Calificaciones

    // NUEVO
    CatalogoServiciosModule, // Catálogo + habilitación de mecánicos (US-06)
  ],
})
export class AppModule {}
