import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import '../estilos/CamisetaCard.css';

export default function CamisetaCard({ id, club, precio, img, esGrupo = false }) {
  const navigate = useNavigate();
  const [imgError, setImgError] = useState(false);

  const handleImageError = () => {
    setImgError(true);
  };

  const handleClick = () => {
    // Siempre navegar al detalle del producto
    navigate(`/detalle/${id}`);
  };
  
  const precioFormateado = precio ? parseFloat(precio).toFixed(2) : '0.00';

  return (
    <div className="camiseta-card" onClick={handleClick}>
      {imgError ? (
        <div className="camiseta-img-placeholder">
          <span>Imagen no disponible</span>
        </div>
      ) : (
        <img 
          src={img} 
          alt={club} 
          className="camiseta-img" 
          onError={handleImageError}
          loading="lazy"
        />
      )}
      <h4 className="camiseta-club">{club}</h4>
      <p className="camiseta-precio">S/ {precioFormateado}</p>
    </div>
  );
}


