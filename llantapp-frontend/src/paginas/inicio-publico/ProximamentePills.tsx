import React from "react";

const items = [
  { t:"Roles y permisos avanzados" },
  { t:"Alertas de inventario"},
  { t:"Unidades de empresa / flotas"},
  { t:"Programación preventiva a escala"},
  { t:"Reportes técnicos exportables"},
  { t:"Recomendaciones inteligentes (llantas/aceite)"},
  { t:"Registro en campo (tablet)" },
];

export default function ProximamentePills(){
  return (
    <section className="container" aria-label="Próximamente" style={{padding:"12px 0 24px"}}>
      <h3 style={{fontSize:"clamp(20px,3vw,28px)", marginBottom:10}}>Próximamente</h3>
      <div className="pills">
        {items.map((it, i)=>(
          <span key={i} className="pill-next">{it.t}</span>
        ))}
      </div>
    </section>
  );
}
