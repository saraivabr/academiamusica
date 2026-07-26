import Link from "next/link";
import { AcademyShell, LessonCard } from "../../components/Portal";

export default function Publicacao() {
  return (
    <AcademyShell title="Prepare o lançamento" eyebrow="TUTORIAL • ETAPA 03">
      <section className="module-intro gold">
        <span>03</span>
        <div>
          <h2>Faça sua música existir no mundo.</h2>
          <p>Organize áudio, capa e metadados, entenda a distribuição e acompanhe o caminho até o link compartilhável.</p>
        </div>
      </section>
      <div className="lesson-list">
        <LessonCard number="01" title="Arquivos e metadados" text="Prepare título, créditos, áudio, capa e informações da faixa." />
        <LessonCard number="02" title="Como funciona uma distribuidora" text="Entenda prazos, planos, termos e responsabilidades." time="6 min" />
        <LessonCard number="03" title="Envio para as plataformas" text="Percorra o fluxo de cadastro e submissão com atenção." />
        <LessonCard number="04" title="Pré-lançamento" text="Organize data, materiais e comunicação antes do link sair." />
        <LessonCard number="05" title="Link publicado" text="Confira o lançamento, compartilhe e registre sua conquista." />
      </div>
      <Link className="module-next" href="/biblioteca">Voltar às minhas músicas →</Link>
    </AcademyShell>
  );
}
