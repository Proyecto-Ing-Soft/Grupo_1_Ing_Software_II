import React from 'react';
import { UserProvider } from './context/UserContext';
import { CarritoProvider } from './context/CarritoContexto';
import Rutas from "./rutas/Rutas";
import  "./estilos/index.css";


function App() {
  return (

      <UserProvider>
        <CarritoProvider>
          <Rutas />
        </CarritoProvider>
      </UserProvider>

  );
}

export default App;
