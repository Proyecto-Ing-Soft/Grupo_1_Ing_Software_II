// src/estilos/notificacionStyles.ts
import styled, { css } from "styled-components";
import { theme } from "./authStyles";

export const NotificacionContainer = styled.div`
  padding: 2rem;
  max-width: 1000px;
  margin: 0 auto;
  background: ${theme.background};
  min-height: 100vh;
  color: ${theme.on};
`;

export const NotificacionHeader = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #303136;
`;

export const NotificacionTitle = styled.h1`
  font-size: 2.25rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  color: ${theme.on};
  background: linear-gradient(135deg, ${theme.primary} 0%, ${theme.primaryDark} 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

export const NotificacionSubtitle = styled.p`
  color: ${theme.muted};
  margin: 0;
  font-size: 1rem;
  font-weight: 400;
`;

export const RefreshButton = styled.button`
  border: 1px solid ${theme.primary};
  background: transparent;
  color: ${theme.primary};
  padding: 0.75rem 1.5rem;
  border-radius: 10px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s ease;
  
  &:hover {
    background: ${theme.primary};
    color: white;
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(211, 47, 47, 0.3);
  }
`;

export const NotificacionGrid = styled.div`
  display: grid;
  gap: 1rem;
`;

export const NotificacionCard = styled.div<{ $prioridad: 'ALTA' | 'MEDIA' | 'BAJA', $estado: 'PENDIENTE' | 'LEIDA' }>`
  background: ${theme.surface};
  border: ${theme.border};
  border-radius: 16px;
  padding: 1.5rem;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;

  ${({ $estado }) => $estado === 'LEIDA' && css`
    opacity: 0.7;
    background: #1a1a1a;
  `}

  ${({ $prioridad }) => 
    $prioridad === 'ALTA' ? css`
      border-left: 4px solid #ef4444;
      box-shadow: 0 4px 20px rgba(239, 68, 68, 0.15);
    ` : $prioridad === 'MEDIA' ? css`
      border-left: 4px solid #f59e0b;
      box-shadow: 0 4px 20px rgba(245, 158, 11, 0.15);
    ` : css`
      border-left: 4px solid #10b981;
      box-shadow: 0 4px 20px rgba(16, 185, 129, 0.15);
    `}

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 30px rgba(0, 0, 0, 0.3);
  }
`;

export const CardHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  margin-bottom: 1rem;
`;

export const PrioridadBadge = styled.span<{ $prioridad: 'ALTA' | 'MEDIA' | 'BAJA' }>`
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;

  ${({ $prioridad }) => 
    $prioridad === 'ALTA' ? css`
      background: #ef4444;
      color: white;
    ` : $prioridad === 'MEDIA' ? css`
      background: #f59e0b;
      color: black;
    ` : css`
      background: #10b981;
      color: white;
    `}
`;

export const EstadoBadge = styled.span<{ $estado: 'PENDIENTE' | 'LEIDA' }>`
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.75rem;
  font-weight: 600;
  
  ${({ $estado }) => $estado === 'PENDIENTE' ? css`
    background: ${theme.primary}20;
    color: ${theme.primary};
    border: 1px solid ${theme.primary}40;
  ` : css`
    background: #374151;
    color: #9ca3af;
    border: 1px solid #4b5563;
  `}
`;

export const CardContent = styled.div`
  margin-bottom: 1.5rem;
`;

export const TipoNotificacion = styled.h3`
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0 0 0.5rem 0;
  color: ${theme.on};
`;

export const MensajeNotificacion = styled.p`
  color: ${theme.muted};
  margin: 0 0 0.75rem 0;
  line-height: 1.5;
  font-size: 0.95rem;
`;

export const MetaInfo = styled.div`
  display: flex;
  gap: 1.5rem;
  font-size: 0.85rem;
  color: ${theme.muted};
`;

export const MetaItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  
  &::before {
    content: "•";
    color: ${theme.primary};
    font-weight: bold;
  }
`;

export const CardFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 1rem;
  border-top: 1px solid #303136;
`;

export const FechaLimite = styled.div.withConfig({
  shouldForwardProp: (prop) => prop !== '$urgente'
})<{ $urgente?: boolean }>`
  font-size: 0.9rem;
  font-weight: 600;
  
  ${({ $urgente }) => $urgente && css`
    color: #ef4444;
    animation: pulse 2s infinite;
  `}

  @keyframes pulse {
    0% { opacity: 1; }
    50% { opacity: 0.7; }
    100% { opacity: 1; }
  }
`;

export const ActionButton = styled.button<{ $estado: 'PENDIENTE' | 'LEIDA' }>`
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 10px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;

  ${({ $estado }) => $estado === 'PENDIENTE' ? css`
    background: ${theme.primary};
    color: white;
    
    &:hover {
      background: ${theme.primaryDark};
      transform: translateY(-2px);
      box-shadow: 0 5px 15px rgba(211, 47, 47, 0.3);
    }
  ` : css`
    background: transparent;
    color: ${theme.muted};
    border: 1px solid #374151;
    cursor: default;
  `}
`;

export const EmptyState = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  color: ${theme.muted};
  
  &::before {
    content: "📋";
    font-size: 3rem;
    display: block;
    margin-bottom: 1rem;
    opacity: 0.5;
  }
`;

export const LoadingState = styled.div`
  text-align: center;
  padding: 3rem;
  color: ${theme.muted};
  
  &::after {
    content: "⏳";
    animation: spin 1s linear infinite;
    font-size: 2rem;
    display: block;
    margin-top: 1rem;
  }

  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

export const ErrorMessage = styled.p`
  color: ${theme.error};
  background: rgba(207, 102, 121, 0.1);
  padding: 1rem 1.5rem;
  border-radius: 10px;
  border-left: 4px solid ${theme.error};
  margin-bottom: 1rem;
  font-weight: 500;
`;