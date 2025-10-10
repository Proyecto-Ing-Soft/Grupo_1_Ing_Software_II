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

// Helpers de placa (tolerantes a espacios/guiones)
function normalizarPlaca(placa: string) {
  return placa.trim().toUpperCase().replace(/\s*-\s*/g, '-');
}
function variantesPlaca(placa: string): string[] {
  const p = (placa || '').toUpperCase().trim();
  const sinEsp = p.replace(/\s+/g, '');
  const conEspAntes = p.replace(/\s*-\s*/g, ' -'); // ABC -123
  const conEspDesp = p.replace(/\s*-\s*/g, '- ');  // ABC- 123
  const sinGuion = sinEsp.replace(/-/g, '');       // ABC123
  return Array.from(new Set([p, sinEsp, conEspAntes, conEspDesp, sinGuion]));
}

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

  /**
   * Crear vehículo (uso general en taller) y enganchar citas preliminares
   * por placa + cliente, sobrescribiendo snapshot.
   */
  async crear(dto: CrearVehiculoDto, creadorId: number) {
    // 1) Validaciones
    const errores: string[] = [];
    for (const v of this.validadores) {
      const res = await v.validar(dto);
      if (res) errores.push(...(Array.isArray(res) ? res : [res]));
    }
    if (errores.length) throw new BadRequestException(errores.join(' | '));

    // 2) Propietario
    const propietario = await this.prisma.usuario.findUnique({
      where: { id: dto.propietarioUsuarioId },
      select: { id: true, empresaId: true },
    });
    if (!propietario) throw new BadRequestException('Propietario no existe');

    // 3) Transacción: crear vehículo + updateMany de citas preliminares
    const placaNorm = normalizarPlaca(dto.placa);
    const vehiculo = await this.prisma.$transaction(async (tx) => {
      const nuevo = await tx.vehiculo.create({
        data: {
          placa: placaNorm,
          marca: dto.marca.trim(),
          modelo: dto.modelo.trim(),
          anio: dto.anio,
          color: dto.color.trim(),
          vin: dto.vin?.trim() || null,
          propietarioUsuarioId: propietario.id,
          creadoPorId: creadorId,
          empresaId: propietario.empresaId ?? null,
        },
        select: { id: true, placa: true, marca: true, modelo: true, anio: true, color: true, vin: true },
      });

      // Enganchar citas preliminares del mismo cliente por variantes de placa
      const placas = variantesPlaca(nuevo.placa);
      await tx.citaMantenimiento.updateMany({
        where: {
          vehiculoId: null,
          placaPreliminar: { in: placas },
          clienteId: propietario.id, // seguridad para no enganchar de otros usuarios
        },
        data: {
          vehiculoId: nuevo.id,
          // sobrescribe snapshot con datos canónicos
          placaPreliminar: nuevo.placa,
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

  /**
   * Crear vehículo DESDE una CITA específica (flujo de confirmación del mecánico).
   * - Crea vehículo con propietario = cliente de la cita.
   * - Enlaza la cita (vehiculoId).
   * - Sobrescribe snapshot preliminar con datos del vehículo.
   * - Opcional: pasa estado a EN_PROGRESO y setea mecanicoId.
   */
  async crearYEnlazarCita(
    citaId: number,
    dto: CrearVehiculoDto,
    creador: { id: number; rol: Rol },
  ) {
    if (creador.rol !== Rol.ADMIN && creador.rol !== Rol.MECANICO) {
      throw new ForbiddenException('Solo personal de taller puede registrar vehículos desde una cita');
    }

    const placaNorm = normalizarPlaca(dto.placa);

    return this.prisma.$transaction(async (tx) => {
      // 1) Cita
      const cita = await tx.citaMantenimiento.findUnique({
        where: { id: citaId },
        select: { id: true, clienteId: true, vehiculoId: true, estado: true },
      });
      if (!cita) throw new NotFoundException('Cita no existe');
      if (cita.vehiculoId) throw new BadRequestException('La cita ya está enlazada a un vehículo');

      // 2) Propietario = cliente de la cita
      const propietario = await tx.usuario.findUnique({
        where: { id: cita.clienteId },
        select: { id: true, empresaId: true },
      });
      if (!propietario) throw new BadRequestException('Propietario no existe');

      // 3) Crear vehículo definitivo
      const vehiculo = await tx.vehiculo.create({
        data: {
          placa: placaNorm,
          marca: dto.marca.trim(),
          modelo: dto.modelo.trim(),
          anio: dto.anio,
          color: dto.color.trim(),
          vin: dto.vin?.trim() || null,
          propietarioUsuarioId: propietario.id,
          creadoPorId: creador.id,
          empresaId: propietario.empresaId ?? null,
        },
        select: { id: true, placa: true, marca: true, modelo: true, anio: true, color: true, vin: true },
      });

      // 4) Enlazar la cita y sobrescribir snapshot
      await tx.citaMantenimiento.update({
        where: { id: cita.id },
        data: {
          vehiculoId: vehiculo.id,
          estado: cita.estado === 'SOLICITADA' ? 'EN_PROGRESO' : cita.estado,
          mecanicoId: creador.id,
          placaPreliminar: vehiculo.placa,
          marcaPreliminar: vehiculo.marca,
          modeloPreliminar: vehiculo.modelo,
          anioPreliminar: vehiculo.anio,
          colorPreliminar: vehiculo.color,
          vinPreliminar: vehiculo.vin,
        },
      });

      return vehiculo;
    });
  }

  /**
   * Historial: trabajos TERMINADOS y próximos (SOLICITADA | EN_PROGRESO).
   * Incluye fallback por placa preliminar para cubrir citas antiguas sin vehiculoId.
   */
  async obtenerHistorial(vehiculoId: number, usuario: { sub: number; rol: Rol }) {
    // Vehículo y permisos
    const vehiculo = await this.prisma.vehiculo.findUnique({
      where: { id: vehiculoId },
      select: { id: true, placa: true, marca: true, modelo: true, anio: true, color: true, propietarioUsuarioId: true },
    });
    if (!vehiculo) throw new NotFoundException('Vehículo no encontrado');

    const esPropietario = vehiculo.propietarioUsuarioId === usuario.sub;
    const esTaller = usuario.rol === Rol.ADMIN || usuario.rol === Rol.MECANICO;
    if (!esPropietario && !esTaller) {
      throw new ForbiddenException('No tienes permiso para ver este historial.');
    }

    const placas = variantesPlaca(vehiculo.placa);

    const [trabajosRealizados, proximosServicios] = await Promise.all([
      this.prisma.citaMantenimiento.findMany({
        where: {
          OR: [
            { vehiculoId: vehiculo.id, estado: 'TERMINADA' },
            { vehiculoId: null, placaPreliminar: { in: placas }, estado: 'TERMINADA' },
          ],
        },
        orderBy: [{ fechaMantenimiento: 'desc' }, { programadaPara: 'desc' }, { creadoEn: 'desc' }],
        select: {
          id: true,
          tipo: true,
          fechaMantenimiento: true,
          programadaPara: true,
          trabajosRealizados: true,
          mecanico: { select: { nombreCompleto: true } },
        },
      }),
      this.prisma.citaMantenimiento.findMany({
        where: {
          OR: [
            { vehiculoId: vehiculo.id, estado: { in: ['SOLICITADA', 'EN_PROGRESO'] } },
            { vehiculoId: null, placaPreliminar: { in: placas }, estado: { in: ['SOLICITADA', 'EN_PROGRESO'] } },
          ],
        },
        orderBy: [{ programadaPara: 'asc' }, { creadoEn: 'asc' }],
        select: {
          id: true,
          tipo: true,
          estado: true,
          programadaPara: true,
          comentario: true,
          mecanico: { select: { nombreCompleto: true } },
        },
      }),
    ]);

    return {
      vehiculo: {
        id: vehiculo.id,
        placa: vehiculo.placa,
        marca: vehiculo.marca,
        modelo: vehiculo.modelo,
        anio: vehiculo.anio,
        color: vehiculo.color,
      },
      trabajosRealizados: trabajosRealizados.map((t) => ({
        id: t.id,
        tipo: t.tipo,
        fechaMantenimiento: t.fechaMantenimiento ?? t.programadaPara ?? null,
        trabajosRealizados: t.trabajosRealizados ?? null,
        mecanico: t.mecanico ?? { nombreCompleto: '—' },
      })),
      proximosServicios: proximosServicios.map((s) => ({
        id: s.id,
        tipo: s.tipo,
        estado: s.estado,
        programadaPara: s.programadaPara ?? null,
        comentario: s.comentario ?? '',
        mecanico: s.mecanico ?? null,
      })),
    };
  }

  async enlazarVehiculo(citaId: number, vehiculoId: number, mecanicoId: number) {
  return this.prisma.$transaction(async (tx) => {
    const [cita, vehiculo] = await Promise.all([
      tx.citaMantenimiento.findUnique({ where: { id: citaId } }),
      tx.vehiculo.findUnique({ where: { id: vehiculoId } }),
    ]);
    if (!cita) throw new BadRequestException('Cita no existe');
    if (!vehiculo) throw new BadRequestException('Vehículo no existe');

    return tx.citaMantenimiento.update({
      where: { id: cita.id },
      data: {
        vehiculoId: vehiculo.id,
        estado: cita.estado === 'SOLICITADA' ? 'EN_PROGRESO' : cita.estado,
        mecanicoId,
        placaPreliminar: vehiculo.placa,
        marcaPreliminar: vehiculo.marca,
        modeloPreliminar: vehiculo.modelo,
        anioPreliminar: vehiculo.anio,
        colorPreliminar: vehiculo.color,
        vinPreliminar: vehiculo.vin,
      },
    });
  });
}
}
