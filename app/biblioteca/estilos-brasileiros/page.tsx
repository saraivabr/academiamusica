"use client";
import { useMemo, useState } from "react";
import { AcademyShell } from "../../components/Portal";
import { musicStyles } from "../../lib/musicStyles";
export default function Estilos(){
  const [query,setQuery]=useState(""); const [family,setFamily]=useState("Todos"); const [open,setOpen]=useState(musicStyles[0].slug); const [copied,setCopied]=useState("");
  const families=["Todos",...Array.from(new Set(musicStyles.map(s=>s.family)))];
  const filtered=useMemo(()=>musicStyles.filter(s=>(family==="Todos"||s.family===family)&&`${s.name} ${s.region} ${s.family}`.toLowerCase().includes(query.toLowerCase())),[query,family]);
  const copy=async(slug:string,text:string)=>{await navigator.clipboard.writeText(text);setCopied(slug);setTimeout(()=>setCopied(""),1500)};
  return <AcademyShell title="Estilos brasileiros" eyebrow="MAPA MUSICAL • SUNO v5+">
    <section className="styles-head"><div><h2>O Brasil não cabe em<br/><em>“Brazilian music”.</em></h2><p>Escolha o gênero e use uma direção que descreve groove, timbres, interpretação e produção.</p></div><strong>{musicStyles.length}<span>MAPAS DE ESTILO</span></strong></section>
    <div className="style-tools"><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Buscar estilo ou região…"/><select value={family} onChange={e=>setFamily(e.target.value)}>{families.map(f=><option key={f}>{f}</option>)}</select></div>
    <section className="style-catalog">{filtered.map((s,i)=><article key={s.slug} className={open===s.slug?"open":""}>
      <button className="style-summary" onClick={()=>setOpen(open===s.slug?"":s.slug)}><span>{String(i+1).padStart(2,"0")}</span><div><small>{s.family} • {s.region}</small><h3>{s.name}</h3></div><em>{s.bpm} BPM</em><b>{open===s.slug?"−":"+"}</b></button>
      {open===s.slug&&<div className="style-detail"><div className="style-data"><p><small>CLIMA</small>{s.mood}</p><p><small>INSTRUMENTOS</small>{s.instruments}</p><p><small>GROOVE</small>{s.groove}</p><p><small>VOCAL</small>{s.vocal}</p></div><div className="style-prompt"><header><span>STYLE OF MUSIC</span><button onClick={()=>copy(s.slug,s.prompt)}>{copied===s.slug?"COPIADO ✓":"COPIAR PROMPT"}</button></header><p>{s.prompt}</p><small>EXCLUDE</small><p>{s.exclude}</p></div></div>}
    </article>)}</section>
  </AcademyShell>
}
