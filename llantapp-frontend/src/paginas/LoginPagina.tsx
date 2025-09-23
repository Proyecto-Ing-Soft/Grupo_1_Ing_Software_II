import React, { useState } from 'react';
import { esquemaLogin } from '../validaciones/usuarioSchemas';
import { useAuth } from '../app/proveedorestado/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  Page, Split, Left, Right, RightInner,
  LogoWrap, Brand, Heading, Sub,
  Form, FormGroup, Label, InputWrap, IconBox, Input,
  Button, HelperText, ErrorMessage, TextLink
} from '../estilos/authStyles';

import logo from '../imagenes/logo.jpg';
import fondo from '../imagenes/taller.jpeg';

/** ─────────────────────────────────────────────────────────────
 *  Helper local: traduce cualquier error a mensaje para el usuario
 *  Principios: SRP (función única), Ley de Demeter (no dependemos
 *  del shape exacto del backend), KISS.
 *  ──────────────────────────────────────────────────────────── */
function parseJsonish(s: string) {
  try { return JSON.parse(s); } catch { return null; }
}
async function normalizarError(e: unknown): Promise<string> {
  if (e instanceof Response) {
    let data: any = null;
    try { data = await e.clone().json(); } catch {}
    if (e.status === 401) return 'Correo o contraseña incorrectos.';
    if (e.status === 400) return data?.message || 'Datos inválidos.';
    if (e.status >= 500) return 'Servidor no disponible. Intenta más tarde.';
    return data?.message || 'No se pudo iniciar sesión.';
  }
  if (e instanceof Error) {
    const data = parseJsonish(e.message);
    if (data) {
      if (data.statusCode === 401) return 'Correo o contraseña incorrectos.';
      return data.message || 'No se pudo iniciar sesión.';
    }
    return e.message || 'No se pudo iniciar sesión.';
  }
  if (e && typeof e === 'object' && 'message' in (e as any)) {
    const data: any = e as any;
    if (data.statusCode === 401) return 'Correo o contraseña incorrectos.';
    return String(data.message || 'No se pudo iniciar sesión.');
  }
  return 'Ocurrió un error inesperado.';
}

export default function LoginPagina() {
  const [form, setForm] = useState({ correo: '', clave: '' });
  const [fieldErr, setFieldErr] = useState<Record<string,string>>({});
  const [formErr, setFormErr] = useState<string | null>(null);
  const navigate = useNavigate();
  const { iniciar } = useAuth();

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (fieldErr[e.target.name]) {
      const copy = { ...fieldErr }; delete copy[e.target.name]; setFieldErr(copy);
    }
  };

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormErr(null); setFieldErr({});
    const p = esquemaLogin.safeParse(form);
    if (!p.success) {
      const fe: Record<string,string> = {};
      for (const issue of p.error.issues) {
        const k = String(issue.path?.[0] ?? '');
        if (k) fe[k] = issue.message;
      }
      setFieldErr(fe);
      setFormErr(Object.values(fe)[0] ?? 'Datos inválidos');
      return;
    }
    try {
      await iniciar(form.correo, form.clave);
      navigate('/inicio');
    } catch (err) {
      setFormErr(await normalizarError(err));
    }
  };

  return (
    <Page>
      <Split>
        {/* Panel izquierdo: logo + form */}
        <Left>
          <LogoWrap>
            <img src={logo} alt="Llantapp" />
            <span>Llantapp</span>
          </LogoWrap>

          <Brand style={{ marginTop: 16 }}>Bienvenido de nuevo</Brand>
          <Sub>Ingresa tus credenciales para acceder a tu cuenta</Sub>

          <Form onSubmit={enviar}>
            <FormGroup>
              <Label>Correo electrónico</Label>
              <InputWrap $withIcon $error={!!fieldErr['correo']}>
                <IconBox className="fa-regular fa-envelope" aria-hidden="true" />
                <Input
                  name="correo"
                  type="email"
                  placeholder="tu@email.com"
                  value={form.correo}
                  onChange={onChange}
                  autoComplete="username"
                />
              </InputWrap>
              {fieldErr['correo'] && <ErrorMessage>{fieldErr['correo']}</ErrorMessage>}
            </FormGroup>

            <FormGroup>
              <Label>Contraseña</Label>
              <InputWrap $withIcon $error={!!fieldErr['clave']}>
                <IconBox className="fa-solid fa-lock" aria-hidden="true" />
                <Input
                  name="clave"
                  type="password"
                  placeholder="••••••••"
                  value={form.clave}
                  onChange={onChange}
                  autoComplete="current-password"
                />
              </InputWrap>
              {fieldErr['clave'] && <ErrorMessage>{fieldErr['clave']}</ErrorMessage>}
            </FormGroup>

            <Button type="submit" $fullWidth>Iniciar sesión</Button>
            {formErr && <ErrorMessage style={{ marginTop: 8 }}>{formErr}</ErrorMessage>}
          </Form>

          <HelperText>
            ¿No tienes cuenta? <TextLink to="/registro">Regístrate aquí</TextLink>
          </HelperText>
        </Left>

        {/* Panel derecho: imagen de fondo + texto */}
        <Right $bg={fondo}>
          <RightInner>
            <Heading style={{ color: 'white', marginBottom: 18 }}>
              Tu solución integral para neumáticos
            </Heading>
            <div style={{
              display:'inline-flex', alignItems:'center', gap:10,
              background:'rgba(0,0,0,.18)', borderRadius: 999, padding: '10px 14px', fontWeight: 600
            }}>
              <span className="fa-solid fa-truck" aria-hidden="true" />
              <span>Envío gratuito en compras superiores a $100</span>
            </div>
          </RightInner>
        </Right>
      </Split>
    </Page>
  );
}
