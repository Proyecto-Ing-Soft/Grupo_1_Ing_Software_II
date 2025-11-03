import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsuarioModule } from '../usuarios/usuario.module';
import { RolesGuard } from 'src/common/guards/roles.guard';

@Module({
  imports: [UsuarioModule],
  controllers: [AuthController],
  providers: [AuthService, RolesGuard],
})
export class AuthModule {}