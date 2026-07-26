"use client";

import { useRef, useState } from "react";

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
  ["03", "Receba duas músicas", "Compare as versões, ouça dentro da plataforma e escolha a que mais combina com você."],
  ["04", "Dê cara ao lançamento", "Crie a capa, organize o projeto e siga o tutorial para colocar a música no mundo."],
];

const features = [
  ["GERAÇÃO", "Duas versões por rodada", "A mesma ideia ganha duas interpretações para você comparar antes de escolher."],
  ["REPERTÓRIO", "Suas músicas, no mesmo lugar", "Player, histórico, versões e downloads organizados como uma biblioteca musical."],
  ["CAPA", "Visual com a sua identidade", "Use sua foto e a direção da música para construir uma capa coerente com o estilo."],
  ["TUTORIAL", "Aprenda dentro da plataforma", "A orientação aparece no momento certo, enquanto você cria, escolhe e prepara o lançamento."],
];

const faqs = [
  ["Preciso saber cantar ou tocar?", "Não. Você parte da sua ideia e faz escolhas simples. A plataforma ajuda a organizar a direção musical e entrega versões completas para você ouvir."],
  ["Preciso escrever um prompt?", "Não. Você informa o que quer contar e escolhe sentimento, estilo e voz em uma experiência visual e direta."],
  ["Quais estilos posso criar?", "Você pode explorar ritmos brasileiros e outros estilos. A experiência dá destaque a referências como sertanejo, trap BR, forró, funk, pagode, gospel, MPB e brega."],
  ["Quantas músicas são criadas por vez?", "Cada rodada gera duas versões para comparação. Antes de confirmar, a plataforma mostra quantos créditos serão usados."],
  ["Onde ficam as músicas?", "No seu repertório. Você pode ouvir, comparar, baixar e continuar o projeto sem perder o histórico."],
  ["Como funcionam os tutoriais?", "O aprendizado acontece dentro da própria plataforma. As orientações aparecem durante a criação, a capa e a preparação do lançamento."],
  ["A música vai direto para as plataformas?", "O tutorial mostra como preparar a publicação, mas distribuição e aprovação seguem as regras dos serviços utilizados. Não prometemos streams, renda ou aprovação automática."],
];

function Equalizer({ playing }: { playing: boolean }) {
  return (
    <span className={`br-equalizer ${playing ? "is-playing" : ""}`} aria-hidden="true">
      <i /><i /><i /><i />
    </span>
  );
}

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

  const toggleAudio = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) await audio.play();
    else audio.pause();
  };

  return (
    <main className="br-home" id="inicio">
      <nav className="br-nav" aria-label="Navegação principal">
        <a className="br-brand" href="#inicio" aria-label="Academia Música IA — início">
          <span className="br-brand-mark" aria-hidden="true"><i /><i /><i /></span>
          <span>Academia <b>Música IA</b></span>
        </a>
        <div className="br-nav-links">
          <a href="#plataforma">A plataforma</a>
          <a href="#como-funciona">Como funciona</a>
          <a href="#tutorial">Tutorial</a>
          <a href="#duvidas">Dúvidas</a>
        </div>
        <div className="br-nav-actions">
          <a href="/login" className="br-login">Entrar</a>
          <a href="/checkout" className="br-button br-button-small" data-track="checkout_cta">Começar <Arrow /></a>
        </div>
      </nav>

      <section className="br-hero">
        <div className="br-hero-glow" aria-hidden="true" />
        <div className="br-hero-copy">
          <div className="br-kicker"><span>●</span> FEITA NO BRASIL. PARA O SOM DO BRASIL.</div>
          <h1>A plataforma de geração de música <em>100% brasileirada.</em></h1>
          <p>
            Tire sua música da cabeça sem entender de produção. Escolha a história,
            o sentimento, o ritmo e a voz. A plataforma organiza tudo e cria duas
            versões para você ouvir.
          </p>
          <div className="br-hero-actions">
            <a href="/checkout" className="br-button" data-track="checkout_cta">Criar minha música <Arrow /></a>
            <button type="button" className="br-play-button" onClick={toggleAudio}>
              <span>{playing ? "Ⅱ" : "▶"}</span>
              {playing ? "Pausar música" : "Ouvir uma música"}
              <Equalizer playing={playing} />
            </button>
          </div>
          <div className="br-proof-row">
            <span><Check /> Sem prompt</span>
            <span><Check /> Duas versões</span>
            <span><Check /> Capa integrada</span>
            <span><Check /> Tutorial durante a criação</span>
          </div>
        </div>

        <div className="br-product-stage" aria-label="Demonstração da plataforma">
          <div className="br-stage-flag">BR</div>
          <div className="br-product-window">
            <header>
              <span className="br-window-brand"><i /> CRIADOR</span>
              <span className="br-credit-pill">20 músicas • 10 rodadas</span>
            </header>
            <div className="br-product-body">
              <small>O QUE VOCÊ QUER CRIAR?</small>
              <h2>Uma música com a sua cara.</h2>
              <div className="br-idea-field">Uma homenagem para minha mãe</div>
              <div className="br-choice-label"><span>Escolha o ritmo</span><b>Ver todos</b></div>
              <div className="br-style-chips">
                <span className="active">Sertanejo</span><span>Forró</span><span>Pagode</span><span>Trap BR</span>
              </div>
              <button type="button" tabIndex={-1}>Criar duas músicas <Arrow /></button>
            </div>
          </div>
          <div className="br-track-card br-track-one">
            <img src="/album-grid-saraiva.webp" alt="" />
            <div><small>VERSÃO 01</small><strong>Minha raiz</strong><span>Sertanejo • 3:12</span></div>
            <i>▶</i>
          </div>
          <div className="br-track-card br-track-two">
            <img src="/identidades-musicais.webp" alt="" />
            <div><small>VERSÃO 02</small><strong>Casa da gente</strong><span>Sertanejo • 2:58</span></div>
            <i>▶</i>
          </div>
        </div>

        <div className="br-hero-ticker" aria-hidden="true">
          <div>
            <span>SERTANEJO</span><i>✦</i><span>TRAP BR</span><i>✦</i><span>FORRÓ</span><i>✦</i>
            <span>FUNK</span><i>✦</i><span>PAGODE</span><i>✦</i><span>GOSPEL</span><i>✦</i>
            <span>MPB</span><i>✦</i><span>BREGA</span><i>✦</i>
            <span>SERTANEJO</span><i>✦</i><span>TRAP BR</span><i>✦</i><span>FORRÓ</span><i>✦</i>
            <span>FUNK</span><i>✦</i><span>PAGODE</span><i>✦</i><span>GOSPEL</span><i>✦</i>
          </div>
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
          <a href="/checkout" className="br-text-link" data-track="checkout_cta">Quero começar <Arrow /></a>
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

      <section className="br-player-section br-section">
        <div className="br-listen-copy">
          <div className="br-section-tag">PROVA ANTES DA PROMESSA</div>
          <h2>Uma ideia virou<br /><em>essa música.</em></h2>
          <p>Dê o play e sinta o tipo de experiência que começa com uma direção simples e ganha forma com escolhas.</p>
          <div className="br-song-tags"><span>TRAP BR</span><span>JINGLE</span><span>3:08</span></div>
        </div>
        <div className={`br-audio-card ${playing ? "active" : ""}`}>
          <img src="/album-grid-saraiva.webp" alt="Capa da música Academia Música IA" />
          <div className="br-audio-info">
            <small>CRIADA NA PLATAFORMA</small>
            <strong>Academia Música IA</strong>
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
            preload="metadata"
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
          <img src="/studio-saraiva.webp" alt="Saraiva criando música em um estúdio" />
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
          <p>Entre na plataforma, aprenda no próprio fluxo e comece com saldo para criar 20 músicas completas.</p>
          <div className="br-access-includes">
            <span><Check /> Criador visual sem prompt</span>
            <span><Check /> Duas versões por rodada</span>
            <span><Check /> Repertório com player e download</span>
            <span><Check /> Criação de capa</span>
            <span><Check /> Tutorial integrado à experiência</span>
          </div>
          <div className="br-access-price">
            <small>ACESSO + 20 MÚSICAS</small>
            <strong>R$49,97</strong>
            <span>pagamento único via Pix</span>
          </div>
          <a href="/checkout" className="br-button br-button-light" data-track="checkout_cta">Começar com 20 músicas <Arrow /></a>
          <small>Sem assinatura obrigatória • recargas opcionais dentro da plataforma</small>
        </div>
        <div className="br-access-art">
          <img src="/kit-lancamento.webp" alt="Música, capa e materiais de lançamento reunidos" />
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
        <a href="/checkout" className="br-button br-button-light" data-track="checkout_cta">Criar minha primeira música <Arrow /></a>
      </section>

      <a href="/checkout" className="br-mobile-cta" data-track="checkout_cta">Criar minha música <Arrow /></a>

      <footer className="br-footer">
        <a className="br-brand" href="#inicio">
          <span className="br-brand-mark" aria-hidden="true"><i /><i /><i /></span>
          <span>Academia <b>Música IA</b></span>
        </a>
        <p>Plataforma brasileira para transformar ideias em música.</p>
        <div><a href="/termos">Termos</a><a href="/privacidade">Privacidade</a><a href="/suporte">Suporte</a></div>
      </footer>
    </main>
  );
}
