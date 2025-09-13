import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import banner1 from '../assets/imagenes/banner1.jpg';
import banner2 from '../assets/imagenes/banner2.jpg';
import banner3 from '../assets/imagenes/banner3.jpg';
import banner4 from '../assets/imagenes/banner4.jpg';
import '../estilos/BannerCarousel.css';

const banners = [banner1, banner2, banner3, banner4];

const variants = {
  enter: (direction) => ({
    x: direction > 0 ? 2000 : -2000,
    opacity: 1
  }),
  center: {
    x: 0,
    opacity: 1,
    transition: { duration: 1, ease: "easeInOut" }
  },
  exit: (direction) => ({
    x: direction < 0 ? 2000 : -2000,
    opacity: 1,
    transition: { duration: 1, ease: "easeInOut" }
  }),
};


export default function BannerCarousel() {
  const [actual, setActual] = useState(0);
  const [direction, setDirection] = useState(0);
  const timeoutRef = useRef(null);

  useEffect(() => {
    timeoutRef.current = setTimeout(() => {
      setDirection(1);
      setActual((prev) => (prev + 1) % banners.length);
    }, 4000);
    return () => clearTimeout(timeoutRef.current);
  }, [actual]);

  const irA = (idx) => {
    setDirection(idx > actual ? 1 : -1);
    setActual(idx);
    clearTimeout(timeoutRef.current);
  };

  const anterior = () => irA((actual - 1 + banners.length) % banners.length);
  const siguiente = () => irA((actual + 1) % banners.length);

  return (
    <div className="banner-carousel" style={{ overflow: 'hidden', position: 'relative' }}>
      <button className="banner-arrow left" onClick={anterior} aria-label="Anterior banner">
        <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
          <circle cx="18" cy="18" r="18" fill="rgba(0,0,0,0.15)" />
          <path d="M21 12L15 18L21 24" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>
      <motion.div
        className="banners-row"
        style={{
          display: 'flex',
          width: `${banners.length * 100}%`,
          height: '100%',
        }}
        animate={{ x: `-${actual * 100}%` }}
        transition={{ duration: 0.7, ease: "easeInOut" }}
      >
        {banners.map((banner, idx) => (
          <div
            key={idx}
            className="banner-img-wrapper"
            style={{
              minWidth: "100%",
              height: "330px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center"
            }}
          >
            <img
              src={banner}
              alt={`Banner ${idx + 1}`}
              className="banner-img"
              draggable={false}
              style={{ width: "100%", height: "330px", objectFit: "cover", borderRadius: "28px" }}
            />
          </div>
        ))}
      </motion.div>
      <button className="banner-arrow right" onClick={siguiente} aria-label="Siguiente banner">
        <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
          <circle cx="18" cy="18" r="18" fill="rgba(0,0,0,0.15)" />
          <path d="M15 12L21 18L15 24" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>
      <div className="banner-dots">
        {banners.map((_, idx) => (
          <motion.span
            key={idx}
            className={idx === actual ? 'dot active' : 'dot'}
            onClick={() => irA(idx)}
            layout
            whileHover={{ scale: 1.25 }}
            animate={idx === actual ? { scale: 1.5 } : { scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 17 }}
          />
        ))}
      </div>
    </div>
  );

}
