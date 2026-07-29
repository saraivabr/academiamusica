import type { Metadata } from "next";
import { PublicShell } from "../components/Portal";
export const metadata: Metadata = {
  title: "Suporte",
  description: "Ajuda para acessar, criar músicas e usar a musicacom.ia.",
  alternates: { canonical: "/suporte/" },
};

const topics = [
  {
    number: "01",
    title: "Acesso e senha",
    description: "Primeiro acesso, recuperação de senha ou código de confirmação.",
    message: "Oi, preciso de ajuda com meu acesso ou senha na musicacom.ia.",
  },
  {
    number: "02",
    title: "Pagamento",
    description: "Confirmação de Pix, recarga, garantia ou comprovante.",
    message: "Oi, preciso de ajuda com um pagamento ou recarga na musicacom.ia.",
  },
  {
    number: "03",
    title: "Criação e plataforma",
    description: "Criador, repertório, capa, download ou publicação.",
    message: "Oi, preciso de ajuda para criar ou usar a musicacom.ia.",
  },
];

function whatsappHref(message: string) {
  return `https://wa.me/5511991143605?text=${encodeURIComponent(message)}`;
}

export default function Suporte() {
  return (
    <PublicShell compact>
      <main className="support-page">
        <div className="eyebrow">CENTRAL DE AJUDA</div>
        <h1>Como podemos ajudar?</h1>
        <p>Escolha o assunto e já abra uma conversa com o contexto certo.</p>
        <section aria-label="Assuntos de suporte">
          {topics.map((topic) => (
            <a
              key={topic.number}
              href={whatsappHref(topic.message)}
              target="_blank"
              rel="noreferrer"
              data-track="support_click"
              data-track-placement={`topic_${topic.number}`}
            >
              <span>{topic.number}</span>
              <h2>{topic.title}</h2>
              <p>{topic.description}</p>
              <b>Abrir ajuda ↗</b>
            </a>
          ))}
        </section>
        <div className="support-contact" id="atendimento">
          <div>
            <small>ATENDIMENTO</small>
            <h2>Prefere explicar com suas palavras?</h2>
            <p>Inclua o e-mail da conta ou da compra para agilizar a localização.</p>
          </div>
          <a
            className="support-whatsapp"
            href={whatsappHref("Oi, preciso de ajuda com a musicacom.ia.")}
            target="_blank"
            rel="noreferrer"
            data-track="support_click"
            data-track-placement="general"
          >
            Abrir WhatsApp ↗
          </a>
        </div>
      </main>
    </PublicShell>
  );
}
