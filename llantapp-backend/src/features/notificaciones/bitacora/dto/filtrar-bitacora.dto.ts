import { IsDateString, IsIn, IsOptional, IsString } from 'class-validator';

export class FiltrarBitacoraDto {
  @IsOptional() @IsIn(['pendiente', 'enviado', 'error'])
  estado?: 'pendiente' | 'enviado' | 'error';

  @IsOptional() @IsIn(['email', 'sms', 'push'])
  canal?: 'email' | 'sms' | 'push';

  @IsOptional() @IsDateString()
  desde?: string;

  @IsOptional() @IsDateString()
  hasta?: string;

  @IsOptional() @IsString()
  destinatario?: string;
}
