import { AcademyShell } from "../components/Portal";
const items=[
  ["GERADOR","Gerador Suno v5","Monte Style of Music, letra e Exclude em um fluxo guiado.","/biblioteca/gerador"],
  ["COMPOSIÇÃO","Prompt Compositor","Transforme história real em letra humana, cantável e original.","/biblioteca/compositor"],
  ["24 ESTILOS","Brasil no Suno","Prompts de estilos brasileiros com groove, timbre, voz e BPM.","/biblioteca/estilos-brasileiros"],
  ["MÉTODO","Da ideia às versões","Briefing, critérios de comparação e refinamento.","/academia/musica"],
  ["VISUAL","Direção de capa","Conceito, foto, identidade e checklist visual.","/academia/identidade"],
  ["LANÇAMENTO","Checklist de publicação","Arquivos, metadados, distribuidora e link final.","/academia/publicacao"],
];
export default function Biblioteca(){return <AcademyShell title="Biblioteca Viva" eyebrow="GERADORES • PROMPTS • MÉTODOS"><section className="library-portal-head"><div><h2>Menos prompt solto.<br/><em>Mais direção.</em></h2><p>Ferramentas práticas para criar música brasileira com identidade — da primeira frase ao arquivo final.</p></div><a className="library-primary" href="/biblioteca/gerador">Abrir Gerador Suno →</a></section><section className="resource-grid live">{items.map(([tag,title,text,href],i)=><a href={href} key={title}><span>{String(i+1).padStart(2,"0")}</span><small>{tag}</small><h2>{title}</h2><p>{text}</p><b>Abrir ferramenta →</b></a>)}</section><section className="library-note"><b>Atualizado para o fluxo atual do Suno</b><p>Os geradores usam Custom Mode, instruções detalhadas de estilo, estrutura no campo de letras e exclusões. O resultado continua exigindo seleção e refinamento humano.</p></section></AcademyShell>}
