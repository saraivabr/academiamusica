import { AcademyShell } from "../components/Portal";
const items = [
  ["25 MÚSICAS", "Estúdio de criação", "Aprenda criando duas versões por vez e acompanhe seu saldo na plataforma.", "/biblioteca/gerador"],
  ["LETRA", "Roteiro de composição", "Transforme uma história real em uma letra humana, cantável e original.", "/biblioteca/compositor"],
  ["24 ESTILOS", "Mapa musical do Brasil", "Explore estilos brasileiros por região, instrumentos, voz e andamento.", "/biblioteca/estilos-brasileiros"],
  ["MÉTODO", "Da ideia às versões", "Aprenda a comparar resultados e escolher a direção mais forte.", "/academia/musica"],
  ["VISUAL", "Direção de capa", "Defina conceito, foto, identidade e o visual do lançamento.", "/academia/identidade"],
  ["LANÇAMENTO", "Checklist de publicação", "Organize arquivos, dados, distribuição e o link final.", "/academia/publicacao"],
];
export default function Biblioteca() {
  return (
    <AcademyShell title="Biblioteca" eyebrow="FERRAMENTAS • MÉTODOS • APOIO">
      <section className="library-portal-head">
        <div>
          <small>SEU PONTO DE PARTIDA</small>
          <h2>Crie primeiro.<br /><em>Aprofunde depois.</em></h2>
          <p>Você tem 25 músicas incluídas para aprender criando. Use os outros materiais quando quiser aprofundar letra, estilo, visual e lançamento.</p>
        </div>
        <a className="library-primary" href="/biblioteca/gerador">Criar minha música →</a>
      </section>
      <section className="resource-grid live">
        {items.map(([tag, title, text, href], index) => (
          <a href={href} key={title}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <small>{tag}</small>
            <h2>{title}</h2>
            <p>{text}</p>
            <b>Abrir →</b>
          </a>
        ))}
      </section>
      <section className="library-note">
        <b>Você não precisa dominar ferramentas</b>
        <p>Comece pelo estúdio, crie duas versões por vez e use suas 25 músicas para descobrir a melhor direção. Toda a preparação técnica fica invisível durante a criação.</p>
      </section>
    </AcademyShell>
  );
}
