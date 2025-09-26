// estilos/vehiculoStyles.tsx
import styled, { css } from "styled-components";
import { theme } from './authStyles';

export const VehiculoContainer = styled.div`
  max-width: 520px;
  margin: 0 auto;
  padding: 2rem;
  background: linear-gradient(135deg, ${theme.background} 0%, #2d2d2d 100%);
  min-height: 100vh;
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
`;

export const VehiculoHeading = styled.h2`
  text-align: center;
  color: ${theme.on};
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 2rem;
  background: linear-gradient(135deg, ${theme.primary} 0%, ${theme.primaryDark} 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

export const VehiculoForm = styled.form`
  background: ${theme.surface};
  padding: 2.5rem;
  border-radius: 20px;
  border: ${theme.border};
  box-shadow: ${theme.shadow};
`;

export const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

export const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  color: ${theme.on};
  font-weight: 600;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

export const Input = styled.input`
  width: 100%;
  padding: 1rem 1.2rem;
  border: 2px solid #404040;
  border-radius: 12px;
  font-size: 1rem;
  background: #2a2a2a;
  color: ${theme.on};
  transition: all 0.3s ease;
  box-sizing: border-box;
  font-family: inherit;

  &::placeholder {
    color: #888;
    font-style: italic;
  }

  &:focus {
    outline: none;
    border-color: ${theme.primary};
    background: #1f1f1f;
    box-shadow: 0 0 0 4px rgba(211, 47, 47, 0.1);
    transform: translateY(-2px);
  }

  &:hover {
    border-color: #555;
  }
`;

export const SubmitButton = styled.button<{ $loading?: boolean }>`
  width: 100%;
  padding: 1.2rem;
  background: linear-gradient(135deg, ${theme.primary} 0%, ${theme.primaryDark} 100%);
  color: ${theme.on};
  border: none;
  border-radius: 12px;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-top: 1rem;
  font-family: inherit;
  position: relative;
  overflow: hidden;

  &:hover:not(:disabled) {
    transform: translateY(-3px);
    box-shadow: 0 10px 25px rgba(211, 47, 47, 0.3);
    background: linear-gradient(135deg, #c62828 0%, #8e0000 100%);
  }

  &:disabled {
    background: #555;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
    opacity: 0.6;
  }

  ${({ $loading }) => $loading && css`
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
      animation: loading 1.5s infinite;
    }
  `}

  @keyframes loading {
    0% { left: -100%; }
    100% { left: 100%; }
  }
`;

export const ErrorMessage = styled.p`
  background: rgba(207, 102, 121, 0.1);
  color: ${theme.error};
  padding: 1rem 1.2rem;
  border-radius: 8px;
  margin-top: 1rem;
  border-left: 4px solid ${theme.error};
  font-weight: 500;
  animation: slideIn 0.3s ease;
`;

export const SuccessMessage = styled.p`
  background: rgba(76, 175, 80, 0.1);
  color: ${theme.success};
  padding: 1rem 1.2rem;
  border-radius: 8px;
  margin-top: 1rem;
  border-left: 4px solid ${theme.success};
  font-weight: 500;
  animation: slideIn 0.3s ease;
`;

// Media queries responsive
export const MediaQueries = css`
  @media (max-width: 768px) {
    ${VehiculoContainer} {
      padding: 1rem;
      margin: 0;
    }
    
    ${VehiculoForm} {
      padding: 1.5rem;
      border-radius: 15px;
    }
    
    ${VehiculoHeading} {
      font-size: 2rem;
    }
    
    ${Input} {
      padding: 0.8rem 1rem;
    }
    
    ${SubmitButton} {
      padding: 1rem;
    }
  }
`;

// Componente global que incluye las media queries
export const GlobalVehiculoStyles = css`
  ${VehiculoContainer} {
    ${MediaQueries}
  }
`;