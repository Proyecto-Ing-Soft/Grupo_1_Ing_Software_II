import { createContext, useState, useEffect } from 'react';

export const UserContext = createContext();

export function UserProvider({ children }) {
  const [usuario, setUsuario] = useState(null);

  useEffect(() => {
    const usuarioGuardado = localStorage.getItem('usuario');
    if (usuarioGuardado) setUsuario(JSON.parse(usuarioGuardado));
  }, []);

  const login = (usuarioData) => {
    setUsuario(usuarioData);
    localStorage.setItem('usuario', JSON.stringify(usuarioData));
  };

  const logout = () => {
    setUsuario(null);
    localStorage.removeItem('usuario');
  };

  return (
    <UserContext.Provider value={{ usuario, login, logout }}>
      {children}
    </UserContext.Provider>
  );
}
