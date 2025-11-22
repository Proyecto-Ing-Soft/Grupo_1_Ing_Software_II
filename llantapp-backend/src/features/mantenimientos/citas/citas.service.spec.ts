import { Test, TestingModule } from '@nestjs/testing';
import { CitasService } from './citas.service';
import { PrismaService } from '../../../core/prisma/prisma/prisma.service';
import { Notificador } from '../../notificaciones/notificaciones/envio/notificador';
import { ConsumiblesService } from '../../consumibles/consumibles.service';
import { BadRequestException, ForbiddenException } from '@nestjs/common';
import { EstadoCita } from '@prisma/client';

// 1. Creamos los Mocks (objetos falsos) con jest.fn()
const mockPrismaService = {
  servicio: {
    findUnique: jest.fn(),
  },
  vehiculo: {
    findFirst: jest.fn(),
    findUnique: jest.fn(),
  },
  citaMantenimiento: {
    create: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
  },
  usuario: {
    findMany: jest.fn(), // para buscar admins
    findUnique: jest.fn(),
  },
  accionUsuario: {
    create: jest.fn(), // para la bitácora
  },
};

const mockNotificador = {
  enviar: jest.fn(),
};

const mockConsumiblesService = {
  consumirEnMantenimiento: jest.fn(),
};

describe('CitasService', () => {
  let service: CitasService;
  let prisma: typeof mockPrismaService;

  beforeEach(async () => {
    // 2. Configuramos el Módulo de Testing (NO el módulo real)
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CitasService,
        // Proveemos los Mocks en lugar de las clases reales
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: Notificador, useValue: mockNotificador },
        { provide: ConsumiblesService, useValue: mockConsumiblesService },
      ],
    }).compile();

    service = module.get<CitasService>(CitasService);
    prisma = module.get(PrismaService);

    // Limpiar los mocks antes de cada test para que no se mezclen llamadas
    jest.clearAllMocks();
  });

  it('debe estar definido', () => {
    expect(service).toBeDefined();
  });

  // ==========================================
  // PRUEBAS PARA: CREAR CITA
  // ==========================================
  describe('crear', () => {
    it('debe lanzar error si la fecha es pasada', async () => {
      const dtoInv: any = { programadaPara: '2020-01-01', servicioId: 1 };
      
      // Esperamos que falle
      await expect(service.crear(dtoInv, 1)).rejects.toThrow(BadRequestException);
    });

    it('debe crear una cita correctamente cuando los datos son válidos', async () => {
      // A. Preparar datos de prueba (Inputs)
      // Usamos una fecha futura segura
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 5);
      const ymd = futureDate.toISOString().split('T')[0]; // YYYY-MM-DD

      const dto = {
        servicioId: 1,
        programadaPara: ymd,
        placaPreliminar: 'ABC-123',
        marcaPreliminar: 'Toyota',
        modeloPreliminar: 'Corolla',
      };
      const clienteId = 10;

      // B. Configurar qué devuelven los Mocks (Outputs simulados)
      
      // 1. Simular que el servicio existe y es activo
      prisma.servicio.findUnique.mockResolvedValue({ id: 1, nombre: 'Cambio de Aceite', activo: true });
      
      // 2. Simular admins para la notificación
      prisma.usuario.findMany.mockResolvedValue([{ id: 99, rol: 'ADMIN' }]);
      
      // 3. Simular la creación de la cita en BD
      prisma.citaMantenimiento.create.mockResolvedValue({
        ...dto
        id: 500,
        programadaPara: new Date(ymd),
        estado: EstadoCita.SOLICITADA,
        clienteId,
        servicioId: 1,
        
      });

      // C. Ejecutar el método real
      const result = await service.crear(dto, clienteId);

      // D. Aserciones (Verificar resultados)
      expect(result).toBeDefined();
      expect(result.id).toBe(500);
      
      // Verificar que se llamó a Prisma con los datos correctos
      expect(prisma.citaMantenimiento.create).toHaveBeenCalledWith(expect.objectContaining({
        data: expect.objectContaining({
            estado: 'SOLICITADA',
            placaPreliminar: 'ABC-123'
        })
      }));

      // Verificar notificaciones
      expect(mockNotificador.enviar).toHaveBeenCalledTimes(2); // 1 admin + 1 cliente
    });
  });

  // ==========================================
  // PRUEBAS PARA: ASIGNAR MECÁNICO
  // ==========================================
  describe('asignarMecanico', () => {
    it('debe lanzar ForbiddenException si quien asigna no es de mi taller', async () => {
       // Mock Admin taller 1
       prisma.usuario.findUnique.mockResolvedValueOnce({ id: 1, rol: 'ADMIN', tallerId: 1 });
       // Mock Cita
       prisma.citaMantenimiento.findUnique.mockResolvedValue({ id: 100, estado: 'SOLICITADA' });
       // Mock Mecanico taller 2 (DIFERENTE)
       prisma.usuario.findUnique.mockResolvedValueOnce({ id: 2, rol: 'MECANICO', tallerId: 2 });

       await expect(service.asignarMecanico(100, 2, 1)).rejects.toThrow(ForbiddenException);
    });

    it('debe asignar mecánico correctamente', async () => {
       // Admin Taller 1
       prisma.usuario.findUnique.mockResolvedValueOnce({ id: 1, rol: 'ADMIN', tallerId: 1, nombreCompleto: 'Admin Boss' });
       // Cita
       prisma.citaMantenimiento.findUnique.mockResolvedValue({ id: 100, estado: 'SOLICITADA', servicio: { nombre: 'Test' } });
       // Mecanico Taller 1
       prisma.usuario.findUnique.mockResolvedValueOnce({ id: 2, rol: 'MECANICO', tallerId: 1, nombreCompleto: 'Mecánico Joe' });
       
       // Update result
       prisma.citaMantenimiento.update.mockResolvedValue({ 
           id: 100, 
           mecanicoId: 2, 
           estado: 'EN_PROGRESO', 
           programadaPara: new Date(),
           clienteId: 5
       });

       const result = await service.asignarMecanico(100, 2, 1);

       expect(result.estado).toBe('EN_PROGRESO');
       expect(prisma.citaMantenimiento.update).toHaveBeenCalled();
       // Verificar que se guardó en bitácora
       expect(prisma.accionUsuario.create).toHaveBeenCalledWith(expect.objectContaining({
           data: expect.objectContaining({ tipo: 'ASIGNAR_MECANICO' })
       }));
    });
  });
});