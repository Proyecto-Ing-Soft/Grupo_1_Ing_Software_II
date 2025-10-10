import { BadRequestException, Injectable, Inject, ForbiddenException, NotFoundException } from '@nestjs/common';
import { Rol } from '../../../common/enums/rol.enum';
import { PrismaService } from '../../../core/prisma/prisma/prisma.service';
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
    // 1) Validaciones
    const errores: string[] = [];
    for (const v of this.validadores) {
      const msg = await v.validar(dto);
      if (msg) errores.push(...(Array.isArray(msg) ? msg : [msg]));
    }
    if (errores.length) throw new BadRequestException(errores.join(' | '));

    // 2) Propietario
    const propietario = await this.prisma.usuario.findUnique({
      where: { id: dto.propietarioUsuarioId },
      select: { id: true, empresaId: true },
    });
    if (!propietario) throw new BadRequestException('Propietario no existe');

    // 3) Crear y ENGANCHAR citas preliminares en una transacción
    const placa = dto.placa.trim().toUpperCase();

    const vehiculo = await this.prisma.$transaction(async (tx) => {
      // 3.1 crear vehículo canónico
      const nuevo = await tx.vehiculo.create({
        data: {
          placa,
          marca: dto.marca.trim(),
          modelo: dto.modelo.trim(),
          anio: dto.anio,
          color: dto.color.trim(),
          vin: dto.vin?.trim() || null,

          propietarioUsuarioId: propietario.id,
          creadoPorId: creadorId,
          empresaId: propietario.empresaId ?? null,
        },
        select: {
          id: true, placa: true, marca: true, modelo: true, anio: true, color: true, vin: true,
        },
      });

      // 3.2 ENGANCHAR y SOBREESCRIBIR snapshot preliminar de citas sin vehiculoId
      await tx.citaMantenimiento.updateMany({
        where: {
          vehiculoId: null,
          placaPreliminar: nuevo.placa,
          clienteId: propietario.id,          // seguridad: evita enganchar citas de otro usuario con la misma placa
        },
        data: {
          vehiculoId: nuevo.id,
          // sobrescribe el snapshot con la fuente canónica del vehículo
          marcaPreliminar: nuevo.marca,
          modeloPreliminar: nuevo.modelo,
          anioPreliminar: nuevo.anio,
          colorPreliminar: nuevo.color,
          vinPreliminar: nuevo.vin,
        },
      });

      return nuevo;
    });

    return { id: vehiculo.id, placa: vehiculo.placa, marca: vehiculo.marca, modelo: vehiculo.modelo };
  }

  async obtenerHistorial(vehiculoId: number, usuario: { sub: number; rol: Rol }) {
    // 1. Vehículo y permisos
    const vehiculo = await this.prisma.vehiculo.findUnique({
      where: { id: vehiculoId },
      select: { id: true, placa: true, marca: true, modelo: true, propietarioUsuarioId: true },
    });
    if (!vehiculo) throw new NotFoundException('Vehículo no encontrado');

    const esPropietario = vehiculo.propietarioUsuarioId === usuario.sub;
    const esPersonalTaller = usuario.rol === Rol.ADMIN || usuario.rol === Rol.MECANICO;
    if (!esPropietario && !esPersonalTaller) {
      throw new ForbiddenException('No tienes permiso para ver este historial.');
    }

    // 2. Historial: TERMINADA
    const trabajosRealizados = await this.prisma.citaMantenimiento.findMany({
      where: {
        OR: [
          { vehiculoId: vehiculoId, estado: 'TERMINADA' },
          { AND: [{ vehiculoId: null }, { placaPreliminar: vehiculo.placa }, { estado: 'TERMINADA' }] }, // fallback por placa
        ],
      },
      orderBy: { fechaMantenimiento: 'desc' },
      select: {
        id: true,
        tipo: true,
        fechaMantenimiento: true,
        trabajosRealizados: true,
        mecanico: { select: { nombreCompleto: true } },
      },
    });

    // 3. Próximos: SOLICITADA | EN_PROGRESO
    const proximosServicios = await this.prisma.citaMantenimiento.findMany({
      where: {
        OR: [
          { vehiculoId: vehiculoId, estado: { in: ['SOLICITADA', 'EN_PROGRESO'] } },
          { AND: [{ vehiculoId: null }, { placaPreliminar: vehiculo.placa }, { estado: { in: ['SOLICITADA', 'EN_PROGRESO'] } }] },
        ],
      },
      orderBy: { programadaPara: 'asc' },
      select: {
        id: true,
        tipo: true,
        estado: true,
        programadaPara: true,
        comentario: true,
        mecanico: { select: { nombreCompleto: true } },
      },
    });

    return {
      vehiculo: { id: vehiculo.id, placa: vehiculo.placa, marca: vehiculo.marca, modelo: vehiculo.modelo },
      trabajosRealizados,
      proximosServicios,
    };
  }
}
