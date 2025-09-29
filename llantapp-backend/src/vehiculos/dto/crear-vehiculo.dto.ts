export class CrearVehiculoDto {
  placa!: string;
  marca!: string;
  modelo!: string;
  anio!: number; 
  color!: string;  
  vin?: string;
  empresaId?: number | null;
}
