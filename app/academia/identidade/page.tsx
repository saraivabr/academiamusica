import Link from "next/link";
import { AcademyShell, LessonCard } from "../../components/Portal";

export default function Identidade() {
  return (
    <AcademyShell title="Identidade visual" eyebrow="TUTORIAL • ETAPA 02">
      <section className="module-intro pink">
        <span>02</span>
        <div>
          <h2>Dê rosto, atmosfera e presença à faixa.</h2>
          <p>Transforme sua foto ou conceito em uma capa coerente e crie o movimento curto que acompanha a reprodução.</p>
        </div>
      </section>
      <div className="lesson-list">
        <LessonCard number="01" title="Conceito visual" text="Traduza a emoção da música em cor, cenário e direção estética." />
        <LessonCard number="02" title="Capa com sua imagem" text="Prepare sua foto e crie uma arte forte sem perder identidade." time="7 min" href="/biblioteca/capa" />
        <LessonCard number="03" title="Sistema visual do lançamento" text="Crie variações para redes, divulgação e perfil." />
        <LessonCard number="04" title="Spotify Canvas" text="Construa um loop vertical curto que amplifica a atmosfera." time="6 min" />
        <LessonCard number="05" title="Checklist de qualidade" text="Revise legibilidade, formatos e consistência visual." />
      </div>
      <Link className="module-next" href="/academia/publicacao">Próximo tutorial: publicação →</Link>
    </AcademyShell>
  );
}
