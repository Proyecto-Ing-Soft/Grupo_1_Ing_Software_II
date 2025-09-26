import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UsuarioModule } from './usuario/usuario.module';
import { PrismaModule } from './prisma/prisma.module';
import { VehiculoModule } from './vehiculos/vehiculo.module';
import { NotificacionesModule } from './notificiaciones/notificaciones.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,      // SRP: acceso a BD
    UsuarioModule,     // SRP: lógica de usuario
    AuthModule,         // SRP: autenticación
    VehiculoModule,
    NotificacionesModule
  ]
})
export class AppModule {}
