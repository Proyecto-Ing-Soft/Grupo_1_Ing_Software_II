// paginas/RegistrarVehiculoPagina.tsx
import React, { useState } from 'react';
import { useAuth } from '../app/proveedorestado/AuthContext';
import { apiVehiculos } from '../servicios/apiVehiculos';
import { esquemaVehiculo, FormVehiculo } from '../validaciones/vehiculoEsquemas';
import {
  VehiculoContainer,
  VehiculoHeading,
  VehiculoForm,
  FormGroup,
  Label,
  Input,
  SubmitButton,
  ErrorMessage,
  SuccessMessage
} from '../estilos/registroVehiculo';

export default function RegistrarVehiculoPagina() {
  const { usuario } = useAuth();
  const [form, setForm] = useState<FormVehiculo>({
    placa: '',
    marca: '',
    modelo: '',
    anio: '2024' as unknown as number,
    color: '',
    vin: '',
  } as any);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setOk(null);

    const ver = esquemaVehiculo.safeParse(form);
    if (!ver.success) {
      setError(ver.error.issues[0]?.message ?? 'Datos inválidos');
      return;
    }

    if (!usuario?.token) {
      setError('No autenticado');
      return;
    }

    setCargando(true);
    try {
      const dto = ver.data;
      const res = await apiVehiculos.crear(
        {
          placa: dto.placa,
          marca: dto.marca,
          modelo: dto.modelo,
          anio: dto.anio as unknown as number,
          color: dto.color,
          vin: dto.vin || undefined,
        },
        usuario.token
      );
      setOk(`Vehículo ${res.placa} creado correctamente`);
      setForm({ placa: '', marca: '', modelo: '', anio: '' as any, color: '', vin: '' } as any);
    } catch (err: any) {
      setError(err?.message ?? 'No se pudo registrar el vehículo');
    } finally {
      setCargando(false);
    }
  };

  return (
    <VehiculoContainer>
      <VehiculoHeading>Registrar vehículo</VehiculoHeading>
      <VehiculoForm onSubmit={enviar}>
        <FormGroup>
          <Label>Placa</Label>
          <Input 
            name="placa" 
            value={form.placa} 
            onChange={onChange} 
            placeholder="ABC-123" 
          />
        </FormGroup>

        <FormGroup>
          <Label>Marca</Label>
          <Input 
            name="marca" 
            value={form.marca} 
            onChange={onChange} 
            placeholder="Toyota" 
          />
        </FormGroup>

        <FormGroup>
          <Label>Modelo</Label>
          <Input 
            name="modelo" 
            value={form.modelo} 
            onChange={onChange} 
            placeholder="Corolla" 
          />
        </FormGroup>

        <FormGroup>
          <Label>Año</Label>
          <Input 
            name="anio" 
            value={String(form.anio ?? '')} 
            onChange={onChange} 
            placeholder="2022" 
          />
        </FormGroup>

        <FormGroup>
          <Label>Color</Label>
          <Input 
            name="color" 
            value={form.color} 
            onChange={onChange} 
            placeholder="Rojo" 
          />
        </FormGroup>

        <FormGroup>
          <Label>VIN (opcional)</Label>
          <Input 
            name="vin" 
            value={form.vin ?? ''} 
            onChange={onChange} 
            placeholder="1HGCM82633A..." 
          />
        </FormGroup>

        <SubmitButton type="submit" $loading={cargando} disabled={cargando}>
          {cargando ? 'Guardando...' : 'Registrar'}
        </SubmitButton>

        {error && <ErrorMessage>{error}</ErrorMessage>}
        {ok && <SuccessMessage>{ok}</SuccessMessage>}
      </VehiculoForm>

      {/* Comentarios de principios se mantienen */}
    </VehiculoContainer>
  );
}