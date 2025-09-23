import styled, { css } from "styled-components";
import { Link as RouterLink } from 'react-router-dom';

export const theme = {
  primary: "#d32f2f",
  primaryDark: "#9a0007",
  background: "#121212",
  surface: "#1e1e1e",
  on: "#ffffff",
  muted: "#aaaaaa",
  error: "#cf6679",
  success: "#4caf50",
  radius: "12px",
  shadow: "0 10px 30px rgba(0,0,0,.35)",
  border: "1px solid #1a1a1a",
};

export const Page = styled.main`
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 16px;
  background: linear-gradient(135deg, ${theme.background} 0%, #1a1a1a 100%);
  color: ${theme.on};
  font-family: 'Roboto', system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial, sans-serif;
`;

export const Split = styled.section`
  width: 100%;
  max-width: 980px;
  min-height: 560px;
  background: ${theme.surface};
  border-radius: ${theme.radius};
  box-shadow: ${theme.shadow};
  border: ${theme.border};
  display: grid;
  grid-template-columns: 1fr 1fr;
  overflow: hidden;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

export const Left = styled.div`
  background: #181a1c;
  padding: 40px 36px;
  display: flex;
  flex-direction: column;
`;

export const Right = styled.aside<{ $bg?: string }>`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 24px;

  /* Si hay imagen, úsala; si no, degradado rojo */
  ${({ $bg }) =>
    $bg
      ? css`
          background: url(${$bg}) center/cover no-repeat;
          &::after {
            /* overlay para legibilidad del texto */
            content: "";
            position: absolute; inset: 0;
            background: linear-gradient(135deg, rgba(211,47,47,.85), rgba(154,0,7,.85));
          }
        `
      : css`
          background: linear-gradient(135deg, ${theme.primary} 0%, ${theme.primaryDark} 100%);
        `}

  @media (max-width: 900px) {
    display: none;
  }
`;

/* Contenido encima del overlay */
export const RightInner = styled.div`
  position: relative; z-index: 1;
  color: white;
  text-align: left;
  max-width: 440px;
`;

export const Brand = styled.h2`
  font-size: 22px;
  font-weight: 700;
  margin: 0 0 12px 0;
`;

export const Heading = styled.h1`
  font-size: 28px;
  line-height: 1.2;
  margin: 8px 0 8px 0;
`;

export const Sub = styled.p`
  color: ${theme.muted};
  margin-bottom: 24px;
`;

export const Form = styled.form`
  margin-top: 8px;
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

export const FormGroup = styled.div`
  display: grid;
  gap: 8px;
`;

export const Label = styled.label`
  font-weight: 600;
  font-size: 14px;
`;

type InputWrapProps = {
  $withIcon?: boolean;
  $error?: boolean;
};

export const InputWrap = styled.div.withConfig({
  // evita que las props transitorias lleguen al DOM
  shouldForwardProp: (prop) => prop !== '$withIcon' && prop !== '$error',
})<InputWrapProps>`
  position: relative;
  display: flex;
  align-items: center;

  ${({ $withIcon }) =>
    $withIcon &&
    css`
      input {
        padding-left: 40px; /* empuja el texto cuando hay icono */
      }
    `}

  ${({ $error }) =>
    $error &&
    css`
      input {
        border-color: #cf6679;
      }
    `}
`;

export const IconBox = styled.span`
  position: absolute; left: 12px;
  color: #8d8d8d; font-size: 14px;
  display: inline-flex; align-items: center; justify-content: center;
`;

export const Input = styled.input`
  width: 100%;
  padding: 12px 14px 12px 40px;
  border-radius: 10px;
  border: 1px solid #303136;
  background: #212225;
  color: ${theme.on};
  outline: none;
  transition: border-color .2s ease, box-shadow .2s ease;
  font-size: 14px;

  ::placeholder { color: #8d8d8d; }

  &:focus {
    border-color: ${theme.primary};
    box-shadow: 0 0 0 2px rgba(211, 47, 47, .15);
  }
`;

export const Button = styled.button<{ $fullWidth?: boolean }>`
  border: none; border-radius: 10px;
  background: ${theme.primary}; color: ${theme.on};
  padding: 12px 16px; font-weight: 700; font-size: 15px;
  cursor: pointer; transition: filter .15s ease, transform .05s ease;
  ${({ $fullWidth }) => $fullWidth && css`width: 100%;`}
  &:hover { filter: brightness(.95); }
  &:active { transform: translateY(1px); }
  &:disabled { opacity: .6; cursor: not-allowed; }
`;

export const HelperText = styled.p`
  margin-top: 18px; font-size: 14px; color: ${theme.muted};
  a { color: #ff6b6b; font-weight: 600; text-decoration: none; }
  a:hover { text-decoration: underline; }
`;

export const ErrorMessage = styled.p`
  color: ${theme.error}; font-size: 13px; margin-top: 4px;
`;
export const SuccessMessage = styled.p`
  color: ${theme.success}; font-size: 13px; margin-top: 4px;
`;

export const Link = styled.a`
  color: #d24b4b; text-decoration: none; font-size: 14px;
  &:hover { text-decoration: underline; }
  &.muted { color: ${theme.muted}; }
`;

/* Logo contenedor (puede ir en el panel derecho o encima del form) */
export const LogoWrap = styled.div`
  display: inline-flex; align-items: center; gap: 10px;
  img { display: block; max-height: 36px; }
  span { font-weight: 800; font-size: 20px; }
`;

export const TextLink = styled(RouterLink)`
  color: #d24b4b;
  text-decoration: none;
  font-weight: 600;
  &:hover { text-decoration: underline; }
`;

/* Compat con tus imports anteriores si los usabas así */
export const AuthContainer = Page;
export const Card = Left;
export const Title = Heading;
