import { BadRequestException, Injectable, Inject } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CrearVehiculoDto } from './dto/crear-vehiculo.dto';
import { IValidadorVehiculo } from './validacion/ivalidador-vehiculo';
import { VEHICULO_VALIDADORES } from './validacion/tokens';


/**
 * crear(dto, creadorId)
 * Patrón/Principios:
 * - SRP: Orquesta validaciones y persistencia del "alta" de vehículo.
 * - DIP: Depende de IValidadorVehiculo[] (no conoce implementaciones).
 * - OCP: Nuevos validadores = extender providers en el módulo, sin tocar aquí.
 * - DRY: Reglas compartidas viven en validadores (no se repiten ifs).
 *
 * Secuencia (CU-00):
 * Controller -> Service -> [loop validadores.validar(dto)] -> Prisma.create() -> return 201
 * Alternos: si hay errores, lanza BadRequest con lista de mensajes.
 */

@Injectable()
export class VehiculosService {
  constructor(
    private prisma: PrismaService,
    @Inject(VEHICULO_VALIDADORES) private readonly validadores: IValidadorVehiculo[],
  ) {}

  listarDelPropietario(usuarioId: number) {
    return this.prisma.vehiculo.findMany({
      where: { propietarioUsuarioId: usuarioId },
      select: { id: true, placa: true, marca: true, modelo: true },
      orderBy: { id: 'desc' },
    });
  }

  async crear(dto: CrearVehiculoDto, creadorId: number) {
    // 1) Ejecutar validadores (SRP del servicio: orquestación de reglas)
    const errores: string[] = [];
    for (const v of this.validadores) {
      const msg = await v.validar(dto);
      if (msg) errores.push(...(Array.isArray(msg) ? msg : [msg]));
    }
    if (errores.length) throw new BadRequestException(errores.join(' | '));

    // 2) Tomar datos del PROPIETARIO elegido
    const propietario = await this.prisma.usuario.findUnique({
      where: { id: dto.propietarioUsuarioId },
      select: { id: true, empresaId: true },
    });

    // (por robustez; el validador ya lo garantizó)
    if (!propietario) throw new BadRequestException('Propietario no existe');

    // 3) Persistir con propietario elegido + auditoría del creador
    return this.prisma.vehiculo.create({
      data: {
        placa: dto.placa.trim().toUpperCase(),
        marca: dto.marca.trim(),
        modelo: dto.modelo.trim(),
        anio: dto.anio,
        color: dto.color.trim(),
        vin: dto.vin?.trim() || null,

        propietarioUsuarioId: propietario.id,
        creadoPorId: creadorId,
        empresaId: propietario.empresaId ?? null,
      },
      select: { id: true, placa: true, marca: true, modelo: true },
    });
  }
}
