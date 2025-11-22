import { Test, TestingModule } from '@nestjs/testing';
import { CitasService } from './citas.service';
import { PrismaService } from '../../../core/prisma/prisma/prisma.service';
import { Notificador } from '../../notificaciones/notificaciones/envio/notificador';
import { ConsumiblesService } from '../../consumibles/consumibles.service';
import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { EstadoCita } from '@prisma/client';

// ----------------------------------------------------------------------------
// 1. CONFIGURACIÓN DE MOCKS
// ----------------------------------------------------------------------------
const mockPrismaService = {
  servicio: { findUnique: jest.fn() },
  vehiculo: { findFirst: jest.fn(), findUnique: jest.fn() },
  citaMantenimiento: { create: jest.fn(), findUnique: jest.fn(), update: jest.fn() },
  usuario: { findMany: jest.fn(), findUnique: jest.fn() }, // Aquí simulamos la BD de usuarios
  accionUsuario: { create: jest.fn() },
};

const mockNotificador = { enviar: jest.fn() };
const mockConsumiblesService = { consumirEnMantenimiento: jest.fn() };

describe('CitasService', () => {
  let service: CitasService;
  let prisma: typeof mockPrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CitasService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: Notificador, useValue: mockNotificador },
        { provide: ConsumiblesService, useValue: mockConsumiblesService },
      ],
    }).compile();

    service = module.get<CitasService>(CitasService);
    prisma = module.get(PrismaService);
    jest.clearAllMocks();
  });

  it('debe estar definido', () => {
    expect(service).toBeDefined();
  });

  // ========================================================================
  // CASO A: CREAR CITA
  // ========================================================================
  describe('crear', () => {
    
    it('debe lanzar BadRequestException si la fecha es pasada', async () => {
      // PRUEBA 1: Cambia esta fecha.
      const fechaInput = '2025-11-27'; 

      const dtoInv: any = { programadaPara: fechaInput, servicioId: 1 };
      
      await expect(service.crear(dtoInv, 1)).rejects.toThrow(/fecha/i);
    });

    it('debe crear una cita correctamente cuando los datos son válidos', async () => {
      // Preparación de Fecha Futura
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 5); 
      const ymd = futureDate.toISOString().split('T')[0]; // Formato YYYY-MM-DD

      // PRUEBA 2: Modifica los datos de entrada
      const dto = {
        servicioId: 1,
        programadaPara: ymd, 
        placaPreliminar: 'XYZ-123',
        marcaPreliminar: 'Toyota',
        modeloPreliminar: 'Corolla',
      };
      const clienteId = 10;

      // MOCKS (Simulando respuesta de BD) --
      prisma.servicio.findUnique.mockResolvedValue({ id: 1, nombre: 'Cambio de Aceite', activo: true });
      prisma.usuario.findMany.mockResolvedValue([{ id: 99, rol: 'ADMIN' }]);
      
      // Simulamos que Prisma devuelve el objeto creado
      prisma.citaMantenimiento.create.mockResolvedValue({
        id: 500,
        ...dto,
        programadaPara: new Date(ymd),
        estado: EstadoCita.SOLICITADA,
        clienteId,
        servicioId: 1,
        vehiculoId: null
      });

      // Ejecución
      const result = await service.crear(dto, clienteId);

      expect(result.id).toBe(500);
      
      // Verificamos que se haya llamado a la BD con los datos correctos
      expect(prisma.citaMantenimiento.create).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({
            placaPreliminar: 'XYZ-123', 
            estado: 'SOLICITADA'
        })
      }));
      expect(mockNotificador.enviar).toHaveBeenCalledTimes(2);
    });
  });

  // ========================================================================
  // CASO B: ASIGNAR MECÁNICO
  // ========================================================================
  describe('asignarMecanico', () => {
    
    const mockUsuariosDB = (tallerAdmin: number, tallerMecanico: number) => {
        prisma.usuario.findUnique.mockImplementation((args) => {
            if (args.where.id === 1) return Promise.resolve({ id: 1, rol: 'ADMIN', tallerId: tallerAdmin, nombreCompleto: 'Admin Boss' });
            if (args.where.id === 2) return Promise.resolve({ id: 2, rol: 'MECANICO', tallerId: tallerMecanico, nombreCompleto: 'Mecánico Joe' });
            return Promise.resolve(null);
        });
    };

    it('debe lanzar ForbiddenException si el mecánico es de OTRO taller', async () => {
       // PRUEBA 3: Escenario de ERROR.
       mockUsuariosDB(2, 1); 

       prisma.citaMantenimiento.findUnique.mockResolvedValue({ id: 100, estado: 'SOLICITADA' });

       // Ejecutamos: Cita 100, Asignar Mecanico 2, Solicitado por Admin 1
       await expect(service.asignarMecanico(100, 2, 1)).rejects.toThrow(ForbiddenException);
    });

    it('debe asignar mecánico correctamente si son del MISMO taller', async () => {
       // PRUEBA EN VIVO 4: Escenario de ÉXITO.
       mockUsuariosDB(1, 1);

       // Mock Cita existente
       prisma.citaMantenimiento.findUnique.mockResolvedValue({ 
           id: 100, 
           estado: 'SOLICITADA', 
           servicio: { nombre: 'Mantenimiento General' } 
       });
       
       // Mock Respuesta del Update en BD
       prisma.citaMantenimiento.update.mockResolvedValue({ 
           id: 100, 
           mecanicoId: 2, 
           estado: 'EN_PROGRESO', 
           programadaPara: new Date(),
           clienteId: 5,
           vehiculoId: 20
       });

       const result = await service.asignarMecanico(100, 2, 1);

       expect(result.estado).toBe('EN_PROGRESO');

       expect(prisma.accionUsuario.create).toHaveBeenCalledWith(expect.objectContaining({
           data: expect.objectContaining({ 
               tipo: 'ASIGNAR_MECANICO',
               mecanicoId: 2
           })
       }));
    });
  });
});