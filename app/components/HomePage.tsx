"use client";

import { useRef, useState, useSyncExternalStore } from "react";
import type { FormEvent } from "react";
import "../home-brasil.css";
import BrandLogo from "./BrandLogo";
import {
  getHomeStoryVariant,
  HOME_STORY_EXPERIMENT,
  type HomeStoryVariant,
} from "../lib/conversionExperiment";

const Arrow = () => <span aria-hidden="true">↗</span>;
const Check = () => <span aria-hidden="true">✓</span>;

const genres = [
  ["Sertanejo", "Viola, romance e refrão que fica"],
  ["Trap BR", "Grave, atitude e verdade na letra"],
  ["Forró", "Sanfona, calor e vontade de dançar"],
  ["Funk", "Batida, presença e energia de baile"],
  ["Pagode", "Roda, sentimento e coro com a galera"],
  ["Gospel", "Mensagem, emoção e voz que alcança"],
  ["MPB", "Palavra, harmonia e identidade"],
  ["Brega", "Drama, paixão e coração aberto"],
];

const steps = [
  ["01", "Conte a ideia", "Uma lembrança, uma homenagem, um jingle ou só uma frase. Escreva do seu jeito."],
  ["02", "Escolha a direção", "Defina sentimento, ritmo e voz com opções visuais. Sem prompt e sem termo técnico."],
  ["03", "Aprove a prévia", "Veja o título, o refrão inicial e a direção antes de liberar o áudio completo."],
  ["04", "Gere suas versões", "O Projeto Música Presente libera 20 créditos: 10 rodadas pagas, com até duas versões por rodada."],
];

const features = [
  ["GERAÇÃO", "Até duas versões por rodada", "Cada rodada paga usa dois créditos e cria até duas interpretações para você comparar."],
  ["REPERTÓRIO", "Suas músicas, no mesmo lugar", "Player, histórico, versões e downloads organizados como uma biblioteca musical."],
  ["CAPA", "Visual com a sua identidade", "Use sua foto e a direção da música para construir uma capa coerente com o estilo."],
  ["TUTORIAL", "Aprenda dentro da plataforma", "A orientação aparece no momento certo, enquanto você cria, escolhe e prepara o lançamento."],
];

const faqs = [
  ["Preciso saber cantar ou tocar?", "Não. Você parte da sua ideia e faz escolhas simples. A plataforma ajuda a organizar a direção musical e entrega versões completas para você ouvir."],
  ["Preciso escrever um prompt?", "Não. Você informa o que quer contar e escolhe sentimento, estilo e voz em uma experiência visual e direta."],
  ["Quais estilos posso criar?", "Você pode explorar ritmos brasileiros e outros estilos. A experiência dá destaque a referências como sertanejo, trap BR, forró, funk, pagode, gospel, MPB e brega."],
  ["Quanto custa para começar?", "A prévia criativa é grátis e não exige cartão. Para gerar o áudio completo, o Projeto Música Presente custa R$ 49,97 via Pix."],
  ["O que está incluído no Projeto Música Presente?", "Você recebe 20 créditos musicais: 10 rodadas pagas, com até duas versões por rodada, além de biblioteca, download, capa e tutorial."],
  ["Onde ficam as músicas?", "No seu repertório. Você pode ouvir, comparar, baixar e continuar o projeto sem perder o histórico."],
  ["Como funcionam os tutoriais?", "O aprendizado acontece dentro da própria plataforma. As orientações aparecem durante a criação, a capa e a preparação do lançamento."],
  ["A música vai direto para as plataformas?", "O tutorial mostra como preparar a publicação, mas distribuição e aprovação seguem as regras dos serviços utilizados. Não prometemos streams, renda ou aprovação automática."],
];

const ideaStarters = [
  ["Homenagem", "Uma homenagem para alguém que mudou a minha vida"],
  ["Minha história", "Uma história sobre o momento em que eu recomecei"],
  ["Jingle", "Um jingle marcante para apresentar o meu negócio"],
];

const heroMessages: Record<HomeStoryVariant, {
  kicker: string;
  title: string;
  emphasis: string;
  description: string;
  label: string;
  placeholder: string;
  cta: string;
}> = {
  control: {
    kicker: "DA SUA HISTÓRIA AO PLAY",
    title: "Uma história sua.",
    emphasis: "Uma música impossível de esquecer.",
    description: "Conte uma lembrança, uma homenagem ou uma ideia do seu jeito. Você escolhe a emoção e o ritmo. A musicacom.ia transforma em som.",
    label: "Que história você quer transformar em música?",
    placeholder: "Ex.: uma homenagem para minha mãe, com saudade e esperança...",
    cta: "Começar minha prévia grátis",
  },
  gift_first: {
    kicker: "UM PRESENTE QUE TEM A SUA HISTÓRIA",
    title: "Tem gente que merece",
    emphasis: "virar música.",
    description: "Conte quem marcou sua vida e o que vocês viveram. A musicacom.ia transforma essa lembrança em uma homenagem que ninguém encontra pronta.",
    label: "Para quem você quer criar essa homenagem?",
    placeholder: "Ex.: para minha mãe, que nunca soltou minha mão...",
    cta: "Criar minha homenagem em música",
  },
  example_first: {
    kicker: "COMECE COM UMA LEMBRANÇA",
    title: "Uma frase sua.",
    emphasis: "O começo de uma música.",
    description: "Não precisa escrever letra nem saber explicar o estilo. Conte uma lembrança simples e veja título, refrão e direção musical antes de decidir.",
    label: "Qual lembrança veio à sua cabeça agora?",
    placeholder: "Ex.: o dia em que a gente se conheceu na praça...",
    cta: "Transformar minha lembrança",
  },
};

const subscribeHomeStoryVariant = () => () => {};
const getServerHomeStoryVariant = (): HomeStoryVariant => "control";

function formatTime(value: number) {
  if (!Number.isFinite(value)) return "0:00";
  const minutes = Math.floor(value / 60);
  const seconds = Math.floor(value % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
}

export default function Home() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(188.64);
  const [openFaq, setOpenFaq] = useState(0);
  const [idea, setIdea] = useState("");
  const heroVariant = useSyncExternalStore(
    subscribeHomeStoryVariant,
    getHomeStoryVariant,
    getServerHomeStoryVariant,
  );
  const heroMessage = heroMessages[heroVariant];

  const toggleAudio = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) await audio.play();
    else audio.pause();
  };

  const startWithIdea = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const normalizedIdea = idea.trim();
    if (normalizedIdea.length < 8) return;
    window.location.assign(`/preview?idea=${encodeURIComponent(normalizedIdea)}`);
  };

  return (
    <main className="br-home" id="inicio">
      <nav className="br-nav" aria-label="Navegação principal">
        <a className="br-brand" href="#inicio" aria-label="musicacom.ia — início">
          <BrandLogo className="br-brand-logo" />
        </a>
        <div className="br-nav-links">
          <a href="#como-funciona">Como funciona</a>
          <a href="#ouca">Ouça uma música</a>
        </div>
        <div className="br-nav-actions">
          <a href="/login?mode=login" className="br-login">Entrar</a>
          <a
            href="/preview/"
            className="br-button br-button-small"
            data-track="offer_cta"
            data-track-placement="nav"
          >
            Prévia grátis
          </a>
        </div>
      </nav>

      <section className={`br-hero ${playing ? "is-playing" : ""}`}>
        <img
          className="br-hero-background"
          src="/hero-studio-empty-v3.webp"
          alt=""
          width="1717"
          height="916"
          fetchPriority="high"
        />
        <div className="br-hero-veil" aria-hidden="true" />

        <button
          type="button"
          className="br-floating-track br-floating-track-left"
          onClick={toggleAudio}
          aria-label={playing ? "Pausar música de exemplo" : "Ouvir música de exemplo"}
        >
          <img src="/elemento-vinil-capa.png" alt="" width="160" height="160" />
          <span>
            <small>CRIADA AQUI</small>
            <strong>Minha raiz</strong>
            <em>{playing ? "TOCANDO" : "OUVIR"}</em>
          </span>
        </button>

        <button
          type="button"
          className="br-floating-track br-floating-track-right"
          onClick={toggleAudio}
          aria-label={playing ? "Pausar música de exemplo" : "Ouvir música de exemplo"}
        >
          <img src="/elemento-play-3d.png" alt="" width="160" height="160" />
          <span>
            <small>DUAS VERSÕES</small>
            <strong>Casa da gente</strong>
            <em>{playing ? "PAUSAR" : "OUVIR"}</em>
          </span>
        </button>

        <div
          className="br-hero-center"
          data-experiment={HOME_STORY_EXPERIMENT}
          data-variant={heroVariant}
        >
          <div className="br-kicker">{heroMessage.kicker}</div>
          <h1>{heroMessage.title}<br /><em>{heroMessage.emphasis}</em></h1>
          <p>{heroMessage.description}</p>

          <form className="br-idea-form" onSubmit={startWithIdea}>
            <label htmlFor="hero-idea">{heroMessage.label}</label>
            <textarea
              id="hero-idea"
              name="idea"
              value={idea}
              onChange={(event) => setIdea(event.target.value)}
              placeholder={heroMessage.placeholder}
              maxLength={280}
              rows={2}
              required
            />
            <div className="br-idea-form-footer">
              <div className="br-idea-starters" aria-label="Sugestões para começar">
                {ideaStarters.map(([label, value]) => (
                  <button key={label} type="button" onClick={() => setIdea(value)}>
                    {label}
                  </button>
                ))}
              </div>
              <button
                type="submit"
                className="br-create-button"
                disabled={idea.trim().length < 8}
                data-track="story_started"
                data-track-placement="hero"
              >
                {heroMessage.cta}
              </button>
            </div>
          </form>

          <div className="br-hero-note">
            <span>Prévia criativa grátis</span>
            <span>Áudio completo após o Pix</span>
            <span>Sem prompt técnico</span>
          </div>
        </div>

        <div className="br-hero-proofbar">
          <span>FEITA NO BRASIL</span>
          <b>Português de verdade</b>
          <b>Até duas versões por rodada paga</b>
          <button type="button" onClick={toggleAudio}>
            {playing ? "Pausar exemplo" : "Ouvir um exemplo"}
          </button>
        </div>
      </section>

      <section className="br-statement br-section">
        <div className="br-section-tag">NOSSO JEITO DE CRIAR</div>
        <div className="br-statement-grid">
          <h2>Não é só traduzida.<br /><em>É brasileirada.</em></h2>
          <div>
            <p>Feita em português, pensada para quem fala do seu jeito e construída ao redor dos ritmos, sentimentos e histórias que vivem por aqui.</p>
            <p>Você não precisa se adaptar a uma ferramenta complicada. A plataforma aproxima a tecnologia da forma brasileira de contar, cantar e compartilhar.</p>
          </div>
        </div>
        <div className="br-pillars">
          <article><b>01</b><strong>Português de verdade</strong><span>Orientações claras, escolhas simples e nada de manual técnico.</span></article>
          <article><b>02</b><strong>Nossos ritmos na frente</strong><span>Do sertanejo ao funk, sem tratar música brasileira como detalhe.</span></article>
          <article><b>03</b><strong>Do som ao lançamento</strong><span>Música, repertório, capa e tutorial dentro da mesma jornada.</span></article>
        </div>
      </section>

      <section className="br-sounds br-section" id="plataforma">
        <div className="br-section-head">
          <div>
            <div className="br-section-tag">UM BRASIL INTEIRO DE POSSIBILIDADES</div>
            <h2>Qual é o som<br /><em>da sua história?</em></h2>
          </div>
          <p>Comece pelo sentimento. A plataforma ajuda a encontrar uma direção musical sem limitar sua ideia a um gênero só.</p>
        </div>
        <div className="br-genre-grid">
          {genres.map(([name, description], index) => (
            <article key={name}>
              <span>{String(index + 1).padStart(2, "0")}</span>
              <div className={`br-genre-disc disc-${index + 1}`} aria-hidden="true"><i /></div>
              <h3>{name}</h3>
              <p>{description}</p>
              <b>↗</b>
            </article>
          ))}
        </div>
      </section>

      <section className="br-flow br-section" id="como-funciona">
        <div className="br-flow-intro">
          <div className="br-section-tag">DA IDEIA AO PLAY</div>
          <h2>Fazer música ficou<br /><em>mais simples.</em></h2>
          <p>Uma decisão por vez. Você entende o que está escolhendo e vê o resultado dentro da própria plataforma.</p>
          <a
            href="/preview/"
            className="br-text-link"
            data-track="offer_cta"
            data-track-placement="how_it_works"
          >
            Começar minha prévia grátis <Arrow />
          </a>
        </div>
        <div className="br-step-list">
          {steps.map(([number, title, description]) => (
            <article key={number}>
              <span>{number}</span>
              <div><h3>{title}</h3><p>{description}</p></div>
              <b>↗</b>
            </article>
          ))}
        </div>
      </section>

      <section className="br-player-section br-section" id="ouca">
        <div className="br-listen-copy">
          <div className="br-section-tag">PROVA ANTES DA PROMESSA</div>
          <h2>Uma ideia virou<br /><em>essa música.</em></h2>
          <p>Dê o play e sinta o tipo de experiência que começa com uma direção simples e ganha forma com escolhas.</p>
          <div className="br-song-tags"><span>TRAP BR</span><span>JINGLE</span><span>3:08</span></div>
        </div>
        <div className={`br-audio-card ${playing ? "active" : ""}`}>
          <img
            src="/brand/musicacom-social-square.jpg"
            alt="Capa da música musicacom.ia"
            loading="lazy"
            decoding="async"
            width="1254"
            height="1254"
          />
          <div className="br-audio-info">
            <small>CRIADA NA PLATAFORMA</small>
            <strong>musicacom.ia</strong>
            <span>Trap Jingle • musicasbyia</span>
            <div className="br-wave" aria-hidden="true">
              {Array.from({ length: 36 }, (_, index) => <i key={index} style={{ "--wave": `${22 + ((index * 19) % 68)}%` } as React.CSSProperties} />)}
            </div>
            <div className="br-progress">
              <span>{formatTime(currentTime)}</span>
              <input
                aria-label="Posição da música"
                type="range"
                min="0"
                max={duration || 0}
                value={Math.min(currentTime, duration || 0)}
                step="0.1"
                onChange={(event) => {
                  const next = Number(event.target.value);
                  if (audioRef.current) audioRef.current.currentTime = next;
                  setCurrentTime(next);
                }}
                style={{ "--progress": `${duration ? (currentTime / duration) * 100 : 0}%` } as React.CSSProperties}
              />
              <span>{formatTime(duration)}</span>
            </div>
          </div>
          <button type="button" onClick={toggleAudio} aria-label={playing ? "Pausar música" : "Tocar música"}>{playing ? "Ⅱ" : "▶"}</button>
          <audio
            ref={audioRef}
            src="/academia-musica-ia-trap-jingle.mp3"
            preload="none"
            onPlay={() => setPlaying(true)}
            onPause={() => setPlaying(false)}
            onEnded={() => setPlaying(false)}
            onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)}
            onLoadedMetadata={(event) => setDuration(event.currentTarget.duration)}
          />
        </div>
      </section>

      <section className="br-features br-section">
        <div className="br-section-head">
          <div>
            <div className="br-section-tag">MAIS QUE UM GERADOR</div>
            <h2>Seu estúdio.<br /><em>Seu repertório.</em></h2>
          </div>
          <p>Crie, compare, organize e dê identidade às músicas sem montar um quebra-cabeça de ferramentas.</p>
        </div>
        <div className="br-feature-grid">
          {features.map(([tag, title, description], index) => (
            <article key={tag} className={`feature-${index + 1}`}>
              <small>{tag}</small>
              <div className="br-feature-icon" aria-hidden="true">{index === 0 ? "♫" : index === 1 ? "▶" : index === 2 ? "▣" : "◎"}</div>
              <h3>{title}</h3>
              <p>{description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="br-tutorial br-section" id="tutorial">
        <div className="br-tutorial-art">
          <img
            src="/elemento-ideia-ao-link.png"
            alt="Da ideia ao play: música pronta para compartilhar"
            loading="lazy"
            decoding="async"
            width="1254"
            height="1254"
          />
          <div className="br-tutorial-label"><span>TUTORIAL INTEGRADO</span><b>Aprenda fazendo.</b></div>
        </div>
        <div className="br-tutorial-copy">
          <div className="br-section-tag">APRENDA NO FLUXO</div>
          <h2>A orientação aparece<br /><em>quando você precisa.</em></h2>
          <p>O aprendizado faz parte da plataforma. Em cada etapa, você recebe explicações curtas para entender suas escolhas, melhorar o resultado e avançar até o lançamento.</p>
          <ul>
            <li><Check /> Comece sem experiência musical</li>
            <li><Check /> Entenda suas escolhas criativas</li>
            <li><Check /> Transforme a faixa em projeto</li>
            <li><Check /> Prepare a apresentação do lançamento</li>
          </ul>
        </div>
      </section>

      <section className="br-access br-section" id="acesso">
        <div className="br-access-copy">
          <div className="br-section-tag">SEU PRIMEIRO PLAY COMEÇA AQUI</div>
          <h2>Entre com uma ideia.<br /><em>Saia com música.</em></h2>
          <p>Monte gratuitamente a direção da música. Quando estiver do seu jeito, libere as versões completas com pagamento único via Pix.</p>
          <div className="br-access-includes">
            <span><Check /> Criador visual sem prompt</span>
            <span><Check /> Prévia criativa grátis</span>
            <span><Check /> Repertório com player e download</span>
            <span><Check /> Criação de capa</span>
            <span><Check /> Tutorial integrado à experiência</span>
          </div>
          <div className="br-access-price">
            <small>PROJETO MÚSICA PRESENTE</small>
            <strong>R$ 49,97</strong>
            <span>pagamento único via Pix</span>
          </div>
          <a
            href="/preview/"
            className="br-button br-button-light"
            data-track="offer_cta"
            data-track-placement="paid_offer"
          >
            Começar minha prévia grátis <Arrow />
          </a>
          <small>20 créditos musicais • 10 rodadas pagas • até 2 versões por rodada</small>
        </div>
        <div className="br-access-art">
          <img
            src="/elemento-vinil-capa.png"
            alt="Vinil e capa representando uma música pronta"
            loading="lazy"
            decoding="async"
            width="1254"
            height="1254"
          />
          <span>IDEIA → MÚSICA → CAPA → LANÇAMENTO</span>
        </div>
      </section>

      <section className="br-faq br-section" id="duvidas">
        <div>
          <div className="br-section-tag">PERGUNTAS FREQUENTES</div>
          <h2>Antes do seu<br /><em>primeiro play.</em></h2>
        </div>
        <div className="br-faq-list">
          {faqs.map(([question, answer], index) => (
            <article key={question} className={openFaq === index ? "open" : ""}>
              <button type="button" aria-expanded={openFaq === index} onClick={() => setOpenFaq(openFaq === index ? -1 : index)}>
                <span>{question}</span><i>{openFaq === index ? "−" : "+"}</i>
              </button>
              <div><p>{answer}</p></div>
            </article>
          ))}
        </div>
      </section>

      <section className="br-final">
        <div className="br-final-map" aria-hidden="true">BR</div>
        <div className="br-section-tag">A SUA HISTÓRIA MERECE SOM</div>
        <h2>O Brasil já tem ritmo.<br /><em>Agora falta o seu.</em></h2>
        <p>Comece simples. Escolha a direção. Aperte o play.</p>
        <a
          href="/preview/"
          className="br-button br-button-light"
          data-track="offer_cta"
          data-track-placement="final"
        >
          Começar minha prévia grátis <Arrow />
        </a>
      </section>

      <footer className="br-footer">
        <a className="br-brand" href="#inicio">
          <BrandLogo className="br-brand-logo" />
        </a>
        <p>Plataforma brasileira para transformar ideias em música.</p>
        <div><a href="/termos">Termos</a><a href="/privacidade">Privacidade</a><a href="/suporte">Suporte</a></div>
      </footer>
    </main>
  );
}
