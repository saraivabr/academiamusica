"use client";
import { useMemo, useState } from "react";
import { AcademyShell } from "../../components/Portal";
import { musicStyles, structureTags } from "../../lib/musicStyles";

export default function Gerador() {
  const [styleSlug,setStyleSlug]=useState(musicStyles[0].slug);
  const [theme,setTheme]=useState("uma história de superação que começou quando ninguém acreditava");
  const [emotion,setEmotion]=useState("orgulho e esperança");
  const [voice,setVoice]=useState("voz masculina média, humana e próxima");
  const [hook,setHook]=useState("eu não parei quando ficou difícil");
  const [copied,setCopied]=useState("");
  const style=musicStyles.find(s=>s.slug===styleSlug)!;
  const outputs=useMemo(()=>({
    style:`${style.prompt}. Theme: ${theme}. Emotional direction: ${emotion}. ${voice}. Song arc: intimate opening, increasing energy, concise memorable chorus. Avoid direct imitation of any living artist.`,
    lyrics:`Escreva uma letra original em português brasileiro sobre ${theme}. Emoção central: ${emotion}. Use linguagem falada, imagens concretas e frases que uma pessoa real diria. O refrão deve nascer da ideia “${hook}”, ter de 2 a 4 linhas e funcionar sem explicar a história inteira. Evite rimas óbvias, palavras abstratas em sequência e clichês de inteligência artificial.\n\nEstrutura:\n${structureTags}`,
    exclude:style.exclude,
  }),[style,theme,emotion,voice,hook]);
  const copy=async(key:string,value:string)=>{await navigator.clipboard.writeText(value);setCopied(key);setTimeout(()=>setCopied(""),1600)};
  return <AcademyShell title="Gerador Suno" eyebrow="PROMPT LAB • v5 / v5.5">
    <section className="generator-hero"><div><small>GERADOR GUIADO</small><h2>Da intenção ao prompt pronto.</h2><p>Preencha o briefing. O sistema separa estilo, instrução de letra e exclusões para o Custom Mode.</p></div><span className="model-badge">SUNO<br/><b>v5+</b></span></section>
    <section className="generator-layout">
      <form className="generator-form">
        <label>Estilo brasileiro<select value={styleSlug} onChange={e=>setStyleSlug(e.target.value)}>{musicStyles.map(s=><option key={s.slug} value={s.slug}>{s.name}</option>)}</select></label>
        <label>Sobre o que é a música?<textarea value={theme} onChange={e=>setTheme(e.target.value)} rows={3}/></label>
        <div className="form-split"><label>Emoção central<input value={emotion} onChange={e=>setEmotion(e.target.value)}/></label><label>Direção vocal<input value={voice} onChange={e=>setVoice(e.target.value)}/></label></div>
        <label>Frase-semente do refrão<input value={hook} onChange={e=>setHook(e.target.value)}/></label>
        <div className="style-facts"><span><small>BPM</small>{style.bpm}</span><span><small>GROOVE</small>{style.groove}</span><span><small>INSTRUMENTOS</small>{style.instruments}</span></div>
      </form>
      <div className="prompt-results">
        {([["style","STYLE OF MUSIC",outputs.style],["lyrics","LYRICS / WRITE WITH SUNO",outputs.lyrics],["exclude","EXCLUDE",outputs.exclude]] as const).map(([key,title,value])=><article key={key}><header><span>{title}</span><button onClick={()=>copy(key,value)}>{copied===key?"COPIADO ✓":"COPIAR"}</button></header><pre>{value}</pre></article>)}
      </div>
    </section>
    <section className="suno-guide"><article><b>01</b><h3>Abra o Custom Mode</h3><p>Use campos separados para letra, estilo e opções avançadas.</p></article><article><b>02</b><h3>Cole sem nomes de artistas</h3><p>Descreva qualidades musicais; não peça clonagem de identidade.</p></article><article><b>03</b><h3>Gere pelo menos 4 versões</h3><p>Compare refrão, interpretação, dicção e dinâmica antes de escolher.</p></article><article><b>04</b><h3>Refine uma variável por vez</h3><p>Troque voz, groove ou instrumentação sem desmontar tudo.</p></article></section>
  </AcademyShell>
}
