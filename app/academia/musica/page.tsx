import Link from "next/link";
import { AcademyShell, LessonCard } from "../../components/Portal";

export default function Musica() {
  return (
    <AcademyShell title="Crie sua música" eyebrow="TUTORIAL • ETAPA 01">
      <section className="module-intro accent">
        <span>01</span>
        <div>
          <h2>Transforme escolhas simples em som.</h2>
          <p>Conte o essencial, escolha emoção, estilo e voz e receba duas músicas para comparar.</p>
          <Link className="module-intro-action" href="/biblioteca/gerador">Abrir o criador →</Link>
        </div>
      </section>
      <div className="lesson-list">
        <LessonCard number="01" title="Escolha o motivo da música" text="Comece por homenagem, romance, superação, jingle, instrumental ou sua própria história." href="/biblioteca/gerador" />
        <LessonCard number="02" title="Dê uma direção clara" text="Use ideia, emoção, ritmo e voz para aproximar a música do que você imaginou." time="8 min" href="/biblioteca/gerador" />
        <LessonCard number="03" title="Explore ritmos brasileiros" text="Compare instrumentação, energia e textura antes de decidir." href="/biblioteca/estilos-brasileiros" />
        <LessonCard number="04" title="Escute com atenção" text="Na música grátis, avalie refrão, emoção e arranjo. Nas rodadas extras, compare as duas versões." time="6 min" href="/biblioteca" />
        <LessonCard number="05" title="Crie uma nova rodada" text="Escolha uma mudança rápida ou altere a direção antes de usar novos créditos." href="/biblioteca/gerador" />
      </div>
      <Link className="module-next" href="/academia/identidade">Próximo tutorial: identidade visual →</Link>
    </AcademyShell>
  );
}
