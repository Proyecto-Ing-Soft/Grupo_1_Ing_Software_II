import React from "react";

const items = [
  { t:"Roles y permisos avanzados", tag:"Sprint 2" },
  { t:"Alertas de inventario", tag:"Sprint 2" },
  { t:"Unidades de empresa / flotas", tag:"Sprint 2" },
  { t:"Programación preventiva a escala", tag:"Sprint 3" },
  { t:"Reportes técnicos exportables", tag:"Sprint 3" },
  { t:"Recomendaciones inteligentes (llantas/aceite)", tag:"Sprint 3" },
  { t:"Registro en campo (tablet)", tag:"Sprint 3" },
];

export default function ProximamentePills(){
  return (
    <section className="container" aria-label="Próximamente" style={{padding:"12px 0 24px"}}>
      <h3 style={{fontSize:"clamp(20px,3vw,28px)", marginBottom:10}}>Próximamente</h3>
      <div className="pills">
        {items.map((it, i)=>(
          <span key={i} className="pill-next">{it.t} <span className="tag">{it.tag}</span></span>
        ))}
      </div>
    </section>
  );
}
