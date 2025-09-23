import React, { useState } from 'react';
import { esquemaRegistro } from '../validaciones/usuarioSchemas';
import { apiAuth } from '../servicios/apiAuth';
import {
  Page, Split, Left, Right, RightInner,
  LogoWrap, Brand, Heading, Sub,
  Form, FormGroup, Label, InputWrap, IconBox, Input,
  Button, HelperText, ErrorMessage, SuccessMessage, TextLink
} from '../estilos/authStyles';

import logo from '../imagenes/logo.jpg';
import fondo from '../imagenes/taller.jpeg';

export default function RegistroPagina() {
  const [form, setForm] = useState({ nombreCompleto: '', correo: '', clave: '' });
  const [fieldErr, setFieldErr] = useState<Record<string,string>>({});
  const [formErr, setFormErr] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    if (fieldErr[e.target.name]) {
      const copy = { ...fieldErr }; delete copy[e.target.name]; setFieldErr(copy);
    }
  };

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault();
    setOk(false); setFormErr(null); setFieldErr({});
    const p = esquemaRegistro.safeParse(form);
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
      await apiAuth.registrar(form);
      setOk(true);
    } catch (err: unknown) {
      setFormErr(err instanceof Error ? err.message : 'No se pudo registrar');
    }
  };

  return (
    <Page>
      <Split>
        <Left>
          <LogoWrap>
            <img src={logo} alt="Llantapp" />
            <span>Llantapp</span>
          </LogoWrap>

          <Brand style={{ marginTop: 16 }}>Crear cuenta</Brand>
          <Sub>Regístrate para empezar a gestionar tus vehículos y servicios.</Sub>

          <Form onSubmit={enviar}>
            <FormGroup>
              <Label>Nombre completo</Label>
              <InputWrap $error={!!fieldErr['nombreCompleto']}>
                <IconBox className="fa-regular fa-user" aria-hidden="true" />
                <Input
                  name="nombreCompleto"
                  placeholder="Tu nombre"
                  value={form.nombreCompleto}
                  onChange={onChange}
                  autoComplete="name"
                />
              </InputWrap>
              {fieldErr['nombreCompleto'] && <ErrorMessage>{fieldErr['nombreCompleto']}</ErrorMessage>}
            </FormGroup>

            <FormGroup>
              <Label>Correo</Label>
              <InputWrap $error={!!fieldErr['correo']}>
                <IconBox className="fa-regular fa-envelope" aria-hidden="true" />
                <Input
                  name="correo"
                  type="email"
                  placeholder="tucorreo@dominio.com"
                  value={form.correo}
                  onChange={onChange}
                  autoComplete="email"
                />
              </InputWrap>
              {fieldErr['correo'] && <ErrorMessage>{fieldErr['correo']}</ErrorMessage>}
            </FormGroup>

            <FormGroup>
              <Label>Contraseña</Label>
              <InputWrap $error={!!fieldErr['clave']}>
                <IconBox className="fa-solid fa-lock" aria-hidden="true" />
                <Input
                  name="clave"
                  type="password"
                  placeholder="••••••••"
                  value={form.clave}
                  onChange={onChange}
                  autoComplete="new-password"
                />
              </InputWrap>
              {fieldErr['clave'] && <ErrorMessage>{fieldErr['clave']}</ErrorMessage>}
            </FormGroup>

            <Button type="submit" $fullWidth>Registrarme</Button>
            {formErr && <ErrorMessage style={{ marginTop: 8 }}>{formErr}</ErrorMessage>}
            {ok && <SuccessMessage style={{ marginTop: 8 }}>Registro exitoso. Ahora puedes iniciar sesión.</SuccessMessage>}
          </Form>

          <HelperText>
            ¿Ya tienes cuenta? <TextLink to="/login">Inicia sesión aquí</TextLink>
          </HelperText>
        </Left>

        <Right $bg={fondo}>
          <RightInner>
            <Heading style={{ color: 'white', marginBottom: 18 }}>
              Crea tu cuenta en minutos
            </Heading>
            <div style={{
              display:'inline-flex', alignItems:'center', gap:10,
              background:'rgba(0,0,0,.18)', borderRadius: 999, padding: '10px 14px', fontWeight: 600
            }}>
              <span className="fa-solid fa-user-shield" aria-hidden="true" />
              <span>Perfiles por rol y trazabilidad</span>
            </div>
          </RightInner>
        </Right>
      </Split>
    </Page>
  );
}
