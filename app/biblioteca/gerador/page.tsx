"use client";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { AcademyShell } from "../../components/Portal";
import { memberApi } from "../../lib/access";
import { musicStyles, structureTags } from "../../lib/musicStyles";

type SunoTrack = {
  id: string;
  title: string;
  tags: string;
  duration: number | null;
  audioUrl: string;
  streamAudioUrl: string;
  imageUrl: string;
};

const completedStatuses = new Set([
  "SUCCESS",
  "CREATE_TASK_FAILED",
  "GENERATE_AUDIO_FAILED",
  "CALLBACK_EXCEPTION",
  "SENSITIVE_WORD_ERROR",
]);

export default function Gerador() {
  const [styleSlug,setStyleSlug]=useState(musicStyles[0].slug);
  const [theme,setTheme]=useState("uma história de superação que começou quando ninguém acreditava");
  const [emotion,setEmotion]=useState("orgulho e esperança");
  const [voice,setVoice]=useState("voz masculina média, humana e próxima");
  const [hook,setHook]=useState("eu não parei quando ficou difícil");
  const [copied,setCopied]=useState("");
  const [model,setModel]=useState("V5_5");
  const [instrumental,setInstrumental]=useState(false);
  const [providerReady,setProviderReady]=useState<boolean|null>(null);
  const [remainingGenerations,setRemainingGenerations]=useState<number|null>(null);
  const [taskId,setTaskId]=useState("");
  const [generationStatus,setGenerationStatus]=useState("IDLE");
  const [tracks,setTracks]=useState<SunoTrack[]>([]);
  const [generationError,setGenerationError]=useState("");
  const style=musicStyles.find(s=>s.slug===styleSlug)!;
  const outputs=useMemo(()=>({
    style:`${style.prompt}. Theme: ${theme}. Emotional direction: ${emotion}. ${voice}. Song arc: intimate opening, increasing energy, concise memorable chorus. Avoid direct imitation of any living artist.`,
    lyrics:`Escreva uma letra original em português brasileiro sobre ${theme}. Emoção central: ${emotion}. Use linguagem falada, imagens concretas e frases que uma pessoa real diria. O refrão deve nascer da ideia “${hook}”, ter de 2 a 4 linhas e funcionar sem explicar a história inteira. Evite rimas óbvias, palavras abstratas em sequência e clichês de inteligência artificial.\n\nEstrutura:\n${structureTags}`,
    exclude:style.exclude,
  }),[style,theme,emotion,voice,hook]);
  const generationPrompt=useMemo(()=>{
    const prompt=[
      `Canção brasileira original em ${style.name}.`,
      `Tema: ${theme}.`,
      `Emoção: ${emotion}.`,
      `Voz: ${voice}.`,
      `Refrão inspirado em “${hook}”.`,
      `Arranjo: ${style.instruments}; ${style.groove}; ${style.bpm} BPM.`,
      "Letra humana, imagens concretas e refrão memorável. Não imite artistas reais.",
    ].join(" ");
    if(prompt.length<=500)return prompt;
    return `${prompt.slice(0,499).replace(/\s+\S*$/,"").trim()}.`;
  },[style,theme,emotion,voice,hook]);

  useEffect(()=>{
    let active=true;
    memberApi("/v1/suno/credits")
      .then(data=>{
        if(!active)return;
        setProviderReady(Boolean(data.available));
        setRemainingGenerations(Number(data.remainingGenerations));
        const savedTask=window.localStorage.getItem("academia_suno_task");
        if(savedTask&&/^[a-zA-Z0-9_-]{8,100}$/.test(savedTask)){
          setTaskId(savedTask);
          setGenerationStatus("PENDING");
        }
      })
      .catch(error=>{
        if(active)setGenerationError(error instanceof Error?error.message:"Não foi possível conectar ao gerador.");
      });
    return()=>{active=false};
  },[]);

  useEffect(()=>{
    if(!taskId||completedStatuses.has(generationStatus))return;
    let active=true;
    let timer=0;
    const check=async()=>{
      try{
        const data=await memberApi(`/v1/suno/generations/${encodeURIComponent(taskId)}`);
        if(!active)return;
        setGenerationStatus(data.status);
        setTracks(data.tracks??[]);
        setGenerationError(data.error??"");
        if(typeof data.remainingGenerations==="number"){
          setRemainingGenerations(data.remainingGenerations);
        }
        if(!completedStatuses.has(data.status)){
          timer=window.setTimeout(check,5000);
        }
      }catch(error){
        if(!active)return;
        const message=error instanceof Error?error.message:"Não foi possível acompanhar a geração.";
        setGenerationError(message);
        if(message.includes("não encontrada")){
          window.localStorage.removeItem("academia_suno_task");
          setTaskId("");
          setGenerationStatus("IDLE");
        }else{
          timer=window.setTimeout(check,8000);
        }
      }
    };
    timer=window.setTimeout(check,4000);
    return()=>{active=false;window.clearTimeout(timer)};
  },[taskId,generationStatus]);

  const copy=async(key:string,value:string)=>{await navigator.clipboard.writeText(value);setCopied(key);setTimeout(()=>setCopied(""),1600)};
  const generate=async(event:FormEvent<HTMLFormElement>)=>{
    event.preventDefault();
    setGenerationError("");
    setGenerationStatus("STARTING");
    setTracks([]);
    try{
      const data=await memberApi("/v1/suno/generations",{
        method:"POST",
        body:JSON.stringify({prompt:generationPrompt,model,instrumental}),
      });
      setTaskId(data.taskId);
      window.localStorage.setItem("academia_suno_task",data.taskId);
      setGenerationStatus(data.status);
      setRemainingGenerations(Number(data.remainingGenerations));
    }catch(error){
      setGenerationStatus("IDLE");
      setGenerationError(error instanceof Error?error.message:"Não foi possível iniciar a geração.");
    }
  };
  const isGenerating=generationStatus==="STARTING"||(!completedStatuses.has(generationStatus)&&generationStatus!=="IDLE");
  const statusLabel={
    STARTING:"Enviando o briefing…",
    PENDING:"A Suno está compondo…",
    TEXT_SUCCESS:"Letra pronta. Produzindo o áudio…",
    FIRST_SUCCESS:"Primeira versão pronta. Finalizando a segunda…",
    SUCCESS:"Suas duas versões estão prontas.",
  }[generationStatus]??"Preparar geração";

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
    <section className="live-generator">
      <div className="live-generator-copy">
        <small>GERAÇÃO REAL • SUNOAPI</small>
        <h2>Ouça o seu briefing virar música.</h2>
        <p>Para este teste, a Suno cria a letra e entrega duas versões com base nas escolhas acima. O processamento pode levar alguns minutos.</p>
        <div className="live-generator-meta">
          <span><small>CONEXÃO</small>{providerReady===null?"Verificando…":providerReady?"SunoAPI pronta":"Indisponível"}</span>
          <span><small>TESTE NESTE ACESSO</small>{remainingGenerations===null?"—":remainingGenerations?"1 geração • 2 versões":"Já utilizado"}</span>
        </div>
      </div>
      <form className="live-generator-form" onSubmit={generate}>
        <div className="form-split">
          <label>Modelo<select value={model} onChange={event=>setModel(event.target.value)}><option value="V5_5">Suno v5.5</option><option value="V5">Suno v5</option><option value="V4_5ALL">Suno v4.5 All</option></select></label>
          <label className="instrumental-toggle"><input type="checkbox" checked={instrumental} onChange={event=>setInstrumental(event.target.checked)}/><span><b>Instrumental</b><small>Sem voz ou letra</small></span></label>
        </div>
        <label>Briefing enviado à geração<textarea value={generationPrompt} readOnly rows={6}/><small>{generationPrompt.length}/500 caracteres</small></label>
        {generationError?<p className="generation-error">{generationError}</p>:null}
        <button className="generate-music-button" disabled={isGenerating||remainingGenerations!==1||providerReady!==true}>
          {isGenerating?<><i/>{statusLabel}</>:remainingGenerations===0?"Teste utilizado":providerReady===null?"Verificando conexão…":providerReady?"Gerar duas versões agora →":"Geração indisponível"}
        </button>
        {taskId?<small className="task-reference">Geração {taskId.slice(0,8)} • você pode manter esta página aberta</small>:null}
      </form>
      {tracks.length?<div className="generated-tracks">
        {tracks.map((track,index)=>{
          const playableUrl=track.audioUrl||track.streamAudioUrl;
          return <article key={track.id||index}>
            <div className="track-cover" style={track.imageUrl?{backgroundImage:`url("${track.imageUrl}")`}:{}}><span>0{index+1}</span></div>
            <div className="track-info"><small>VERSÃO {index+1}</small><h3>{track.title}</h3><p>{track.tags||style.name}{track.duration?` • ${Math.round(track.duration)}s`:""}</p></div>
            {playableUrl?<audio controls preload="none" src={playableUrl}/>:<span className="audio-wait">Áudio finalizando…</span>}
            {track.audioUrl?<a href={track.audioUrl} target="_blank" rel="noreferrer" download>Baixar MP3 ↗</a>:null}
          </article>;
        })}
      </div>:null}
    </section>
    <section className="suno-guide"><article><b>01</b><h3>Comece pelo briefing</h3><p>Defina tema, emoção, voz e refrão antes de gastar a sua geração.</p></article><article><b>02</b><h3>Use referências éticas</h3><p>Descreva qualidades musicais; não peça clonagem de identidade.</p></article><article><b>03</b><h3>Compare as duas versões</h3><p>Observe refrão, interpretação, dicção e dinâmica antes de escolher.</p></article><article><b>04</b><h3>Baixe a sua favorita</h3><p>O link da SunoAPI é temporário; salve o MP3 que quiser continuar refinando.</p></article></section>
  </AcademyShell>
}
