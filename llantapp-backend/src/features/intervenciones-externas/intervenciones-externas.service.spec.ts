import { Test, TestingModule } from '@nestjs/testing';
import { IntervencionesExternasService } from './intervenciones-externas.service';
import { PrismaService } from '../../core/prisma/prisma/prisma.service';
import { BadRequestException, ForbiddenException } from '@nestjs/common';

// ----------------------------------------------------------------------------
// 1. CONFIGURACIÓN DE MOCKS
// ----------------------------------------------------------------------------
const mockPrismaService = {
  vehiculo: {
    findFirst: jest.fn(),
    findUnique: jest.fn(),
  },
  intervencionExterna: {
    create: jest.fn(),
    findMany: jest.fn(),
  },
};

describe('IntervencionesExternasService', () => {
  let service: IntervencionesExternasService;
  let prisma: typeof mockPrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        IntervencionesExternasService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<IntervencionesExternasService>(
      IntervencionesExternasService,
    );
    prisma = module.get(PrismaService);
    jest.clearAllMocks();
  });

  it('debe estar definido', () => {
    expect(service).toBeDefined();
  });

  // ========================================================================
  // CASO ÚNICO: CREAR INTERVENCIÓN EXTERNA
  // ========================================================================
  describe('crear', () => {
    const clienteId = 10;

    it('debe lanzar ForbiddenException si el vehículo no pertenece al cliente', async () => {
      // PRUEBA 1: vehículo inexistente o de otro cliente
      prisma.vehiculo.findFirst.mockResolvedValue(null);

      const dto: any = {
        vehiculoId: 1,
        fecha: '2025-12-01',
        descripcion: 'Cambio de aceite',
      };

      await expect(service.crear(dto, clienteId)).rejects.toThrow(
        ForbiddenException,
      );
      expect(prisma.vehiculo.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: dto.vehiculoId, propietarioUsuarioId: clienteId },
        }),
      );
    });

    it('debe lanzar BadRequestException si la fecha es inválida', async () => {
      // PRUEBA 2: formato de fecha inválido
      prisma.vehiculo.findFirst.mockResolvedValue({
        id: 1,
        placa: 'XYZ-123',
      });

      const dto: any = {
        vehiculoId: 1,
        fecha: 'FECHA-INVALIDA',
        descripcion: 'Cambio de llanta',
      };

      await expect(service.crear(dto, clienteId)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('debe crear la intervención externa correctamente con datos mínimos', async () => {
      // PRUEBA 3: flujo exitoso con campos básicos
      prisma.vehiculo.findFirst.mockResolvedValue({
        id: 5,
        placa: 'ABC-123',
      });

      const dto: any = {
        vehiculoId: 5,
        fecha: '2025-12-01',
        descripcion: '  Alineación y balanceo  ',
      };

      const createdMock = {
        id: 100,
        vehiculoId: 5,
        clienteId,
        fecha: new Date(dto.fecha),
        kilometraje: null,
        descripcion: dto.descripcion.trim(),
        tallerNombre: null,
        costoAproximado: null,
        creadoEn: new Date(),
      };

      prisma.intervencionExterna.create.mockResolvedValue(createdMock);

      const result = await service.crear(dto, clienteId);

      expect(result.id).toBe(100);
      expect(prisma.intervencionExterna.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            vehiculoId: 5,
            clienteId,
            descripcion: 'Alineación y balanceo',
            tallerNombre: null,
          }),
        }),
      );
    });

    it('debe mapear costoAproximado solo cuando es un número', async () => {
      // PRUEBA 4: costoAproximado numérico vs no numérico
      prisma.vehiculo.findFirst.mockResolvedValue({
        id: 7,
        placa: 'LLL-777',
      });

      const dto: any = {
        vehiculoId: 7,
        fecha: '2025-12-10',
        descripcion: 'Cambio de frenos',
        tallerNombre: '  Taller Centro  ',
        costoAproximado: 250.5, // número válido
      };

      prisma.intervencionExterna.create.mockResolvedValue({
        id: 200,
        vehiculoId: 7,
        clienteId,
        fecha: new Date(dto.fecha),
        kilometraje: null,
        descripcion: dto.descripcion,
        tallerNombre: dto.tallerNombre,
        costoAproximado: dto.costoAproximado,
        creadoEn: new Date(),
      });

      await service.crear(dto, clienteId);

      expect(prisma.intervencionExterna.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            costoAproximado: 250.5,
            tallerNombre: 'Taller Centro',
          }),
        }),
      );
    });
  });
});
