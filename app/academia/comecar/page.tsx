import Link from "next/link";
import { AcademyShell, LessonCard } from "../../components/Portal";

export default function Comecar() {
  return (
    <AcademyShell title="Como usar" eyebrow="TUTORIAL DA PLATAFORMA">
      <section className="module-intro">
        <span>00</span>
        <div>
          <h2>Você aprende enquanto cria.</h2>
          <p>Comece com uma ideia e avance por escolhas visuais. O tutorial explica cada decisão no momento em que ela aparece.</p>
        </div>
      </section>
      <div className="lesson-list">
        <LessonCard number="01" title="Comece pela sua ideia" text="Escolha o tipo de música e descreva o essencial com as suas palavras." time="3 min" href="/biblioteca/gerador" />
        <LessonCard number="02" title="Escolha emoção, ritmo e voz" text="Entenda como cada escolha muda o resultado sem precisar escrever prompt." time="5 min" href="/biblioteca/gerador" />
        <LessonCard number="03" title="Confirme os créditos" text="Revise a direção e veja o custo antes de criar as duas versões." time="3 min" href="/biblioteca/gerador" />
        <LessonCard number="04" title="Ouça, compare e continue" text="Escolha a favorita, peça uma nova direção ou siga para a criação da capa." time="6 min" href="/biblioteca" />
      </div>
      <Link className="module-next" href="/biblioteca/gerador">Abrir o criador →</Link>
    </AcademyShell>
  );
}
