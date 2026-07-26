"use client";

import { useRef, useState } from "react";

const Arrow = () => <span aria-hidden="true">↗</span>;
const Check = () => <span className="check" aria-hidden="true">✓</span>;

const tracks = [
  ["01", "Conte por texto ou voz", "Fale como falaria com alguém. Você não precisa conhecer termos técnicos nem escrever prompt.", "CONVERSA"],
  ["02", "Receba direção", "O Produtor IA faz uma pergunta útil por vez e organiza história, emoção, estilo, voz e refrão.", "PLANO"],
  ["03", "Confirme antes de criar", "Você vê exatamente o que foi entendido e só usa seu saldo quando aprovar a direção.", "CONTROLE"],
  ["04", "Ouça duas músicas", "A plataforma cria duas versões completas para você comparar, baixar e pedir uma nova direção.", "2 FAIXAS"],
  ["05", "Construa a identidade", "Transforme a favorita em projeto com conceito, capa profissional e Spotify Canvas.", "VISUAL"],
  ["06", "Prepare o lançamento", "Organize arquivos, dados e distribuição para conquistar um link para compartilhar.", "LANÇAMENTO"],
];

const library = [
  ["Produtor IA + 25 músicas", "Converse por texto ou voz, confirme a direção e receba duas músicas por rodada.", "CONVERSA"],
  ["Roteiro de composição", "Desenvolva letras, conceitos e direções musicais com apoio da inteligência artificial.", "COMPOSIÇÃO"],
  ["Capa profissional", "Transforme sua foto ou ideia artística na identidade visual do lançamento.", "IDENTIDADE"],
  ["Spotify Canvas", "Crie o vídeo curto que acompanha sua música durante a reprodução.", "MOVIMENTO"],
  ["Publicação", "Prepare e distribua sua música nas principais plataformas de streaming.", "DISTRIBUIÇÃO"],
  ["Biblioteca Viva", "Novos conteúdos e atualizações para você continuar evoluindo.", "ATUALIZAÇÕES"],
  ["Comunidade", "Compartilhe sua primeira música com pessoas que também decidiram criar.", "ENCONTROS"],
];

const faqs = [
  ["Preciso saber cantar?", "Não. A Academia foi pensada para iniciantes e mostra como usar ferramentas que podem apoiar voz, composição e instrumentação."],
  ["Preciso tocar ou entender teoria musical?", "Não. O processo parte da sua ideia e das suas escolhas criativas. Os conceitos necessários aparecem de forma prática durante a criação."],
  ["Como funciona o Produtor IA?", "Você conta sua ideia por texto ou voz. Ele faz uma pergunta por vez, organiza a direção da música e mostra um resumo para sua confirmação antes de criar duas versões."],
  ["As 25 músicas estão incluídas?", "Sim. Sua inscrição libera 25 criações musicais dentro do estúdio da Academia, sem cobrança adicional para gerar esse pacote."],
  ["Vou publicar direto no Spotify?", "Você aprende a preparar e distribuir sua música por meio dos serviços disponíveis. A publicação depende das regras, requisitos e aprovações das plataformas e distribuidoras utilizadas."],
  ["Posso monetizar minha música?", "Depende dos termos da ferramenta, da distribuidora e das plataformas usadas. A Academia mostra o caminho, mas não promete monetização, streams ou renda."],
  ["Existem outros custos?", "As 25 músicas estão incluídas. Serviços opcionais de distribuição, publicação ou ferramentas externas podem ter custos próprios e são contratados separadamente."],
  ["A música fica perfeita de primeira?", "Provavelmente não. Por isso o método inclui geração de versões, comparação, seleção e refinamento. IA acelera a criação; direção continua sendo necessária."],
  ["Posso usar minha foto na capa?", "Sim. Você pode trabalhar com sua própria foto, uma ideia artística ou uma identidade criada especificamente para o lançamento."],
  ["Terei comunidade?", "Sim. A comunidade existe para você mostrar músicas, acompanhar outros criadores, trocar experiências e evoluir nos próximos lançamentos."],
];

function Equalizer({ playing = false }: { playing?: boolean }) {
  return (
    <span className={`equalizer ${playing ? "is-playing" : ""}`} aria-hidden="true">
      {[1, 2, 3, 4].map(bar => <i key={bar} />)}
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
  const [jinglePlaying, setJinglePlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(188.64);
  const [openFaq, setOpenFaq] = useState(0);

  const toggleJingle = async () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      await audio.play();
    } else {
      audio.pause();
    }
  };

  return (
    <main className={jinglePlaying ? "music-is-playing" : ""}>
      <nav className="nav">
        <a href="#inicio" className="brand" aria-label="Academia Música IA — início">
          <span className="brand-disc"><i /><i /><i /></span>
          <span>Academia <b>Música IA</b></span>
        </a>
        <div className="nav-links">
          <a href="#jornada">Método</a>
          <a href="#biblioteca">Entregas</a>
          <a href="#duvidas">Dúvidas</a>
        </div>
        <a href="/checkout" className="pill pill-outline" data-track="checkout_cta">Conversar e criar <Arrow /></a>
      </nav>

      <section className="hero" id="inicio">
        <img src="/hero-premium.webp" alt="Saraiva em um estúdio musical com inteligência artificial" className="hero-image" />
        <div className="hero-overlay" />
        <div className="hero-grid" aria-hidden="true" />
        <img src="/elemento-play-3d.png" alt="" className="hero-play-asset" aria-hidden="true" />
        <div className="hero-motion" aria-hidden="true">
          <i className="motion-orbit orbit-a" />
          <i className="motion-orbit orbit-b" />
          <i className="motion-glow" />
          <span className="motion-tile tile-a" />
          <span className="motion-tile tile-b" />
          <span className="motion-tile tile-c" />
        </div>
        <div className="hero-content">
          <div className="status"><span /> Produtor IA • 25 músicas incluídas</div>
          <h1>Conte sua história.<br />O <em>Produtor IA</em> transforma em música.</h1>
          <p>Escreva ou fale como falaria com alguém. O Produtor IA faz as perguntas certas, organiza estilo, emoção, voz e refrão e cria duas versões para você ouvir e baixar.</p>
          <div className="hero-actions">
            <a href="#oferta" className="pill pill-green" data-track="offer_cta">Quero conversar e criar <Arrow /></a>
            <button className="play-link" onClick={toggleJingle} aria-label={jinglePlaying ? "Pausar jingle" : "Ouvir jingle"}>
              <span className="play-circle">{jinglePlaying ? "Ⅱ" : "▶"}</span>
              {jinglePlaying ? "Tocando o jingle" : "Ouvir o jingle"}
              <Equalizer playing={jinglePlaying} />
            </button>
          </div>
          <div className="hero-proof">
            <span><Check /> Sem escrever prompt</span>
            <span><Check /> Texto ou voz</span>
            <span><Check /> 25 músicas incluídas</span>
          </div>
          <small className="hero-disclaimer">Sem promessa de fama, streams, renda ou aprovação automática pelas plataformas.</small>
        </div>
        <div className="now-playing">
          <div className="playing-cover">
            <img src="/album-grid-saraiva.webp" alt="" />
          </div>
          <div><small>OUÇA AGORA</small><strong>Academia Música IA</strong><span>Trap Jingle • musicasbyia</span></div>
          <button onClick={toggleJingle} aria-label={jinglePlaying ? "Pausar faixa" : "Tocar faixa"}>{jinglePlaying ? "Ⅱ" : "▶"}</button>
        </div>
        <div className="scroll-note">ROLE PARA DESCOBRIR <span>↓</span></div>
      </section>

      <section className="marquee" aria-label="Possibilidades criativas">
        <div>
          <span>IDEIA</span><i>→</i><span>MÚSICA</span><i>→</i><span>CAPA</span><i>→</i><span>CANVAS</span><i>→</i><span>PLATAFORMAS</span><i>→</i><span>LINK</span><i>✦</i>
          <span>IDEIA</span><i>→</i><span>MÚSICA</span><i>→</i><span>CAPA</span><i>→</i><span>CANVAS</span><i>→</i><span>PLATAFORMAS</span><i>→</i><span>LINK</span><i>✦</i>
        </div>
      </section>

      <section className="jingle section" id="jingle">
        <img src="/elemento-onda-sonora.png" alt="" className="jingle-wave-asset" aria-hidden="true" />
        <div className="jingle-copy">
          <div className="eyebrow">PROVA ANTES DA PROMESSA</div>
          <h2>Aperte o play.<br /><em>Isso começou como uma ideia.</em></h2>
          <p>Antes de explicar o método, ouça uma amostra do que a inteligência artificial pode ajudar a construir quando existe intenção, estilo e refinamento.</p>
          <div className="jingle-tags"><span>TRAP</span><span>JINGLE</span><span>CRIADA COM IA</span><span>3:08</span></div>
        </div>
        <div className={`custom-player ${jinglePlaying ? "active" : ""}`}>
          <div className="player-art">
            <img src="/album-grid-saraiva.webp" alt="Capa do Trap Jingle da Academia Música IA" />
            <span className="player-disc" aria-hidden="true" />
          </div>
          <div className="player-content">
            <div className="player-top">
              <div><small>FAIXA EXCLUSIVA</small><strong>Academia Música IA</strong><span>Trap Jingle • musicasbyia</span></div>
              <Equalizer playing={jinglePlaying} />
            </div>
            <div className="audio-spectrum" aria-hidden="true">
              {Array.from({ length: 48 }, (_, index) => <i key={index} style={{ "--bar": `${18 + ((index * 17) % 52)}%` } as React.CSSProperties} />)}
            </div>
            <div className="progress-row">
              <span>{formatTime(currentTime)}</span>
              <input
                type="range"
                min="0"
                max={duration || 0}
                value={Math.min(currentTime, duration || 0)}
                step="0.1"
                aria-label="Posição da música"
                onChange={(event) => {
                  const next = Number(event.target.value);
                  if (audioRef.current) audioRef.current.currentTime = next;
                  setCurrentTime(next);
                }}
                style={{ "--progress": `${duration ? (currentTime / duration) * 100 : 0}%` } as React.CSSProperties}
              />
              <span>{formatTime(duration)}</span>
            </div>
            <div className="player-controls">
              <button aria-label="Voltar 10 segundos" onClick={() => {
                if (audioRef.current) audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime - 10);
              }}>−10</button>
              <button className="main-play" onClick={toggleJingle} aria-label={jinglePlaying ? "Pausar Academia Música IA Trap Jingle" : "Tocar Academia Música IA Trap Jingle"}>
                {jinglePlaying ? "Ⅱ" : "▶"}
              </button>
              <button aria-label="Avançar 10 segundos" onClick={() => {
                if (audioRef.current) audioRef.current.currentTime = Math.min(duration, audioRef.current.currentTime + 10);
              }}>+10</button>
            </div>
          </div>
          <audio
            ref={audioRef}
            src="/academia-musica-ia-trap-jingle.mp3"
            preload="metadata"
            onPlay={() => setJinglePlaying(true)}
            onPause={() => setJinglePlaying(false)}
            onEnded={() => setJinglePlaying(false)}
            onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime)}
            onLoadedMetadata={(event) => setDuration(event.currentTarget.duration)}
          />
        </div>
      </section>

      <section className="manifest section" id="problema">
        <div className="eyebrow">O PONTO ONDE QUASE TODO MUNDO TRAVA</div>
        <div className="manifest-grid">
          <h2>O problema não é gerar uma música.<br /><em>É fazer ela existir.</em></h2>
          <div className="manifest-copy">
            <p>Você abre uma ferramenta, digita uma ideia, gera uma faixa e talvez até goste do resultado.</p>
            <p>Então trava. A música fica em uma pasta, numa conversa ou dentro da própria ferramenta: sem capa, sem Canvas, sem distribuição, sem link e sem presença.</p>
            <strong>A inteligência artificial abriu a porta. Porta aberta ainda não é lançamento concluído.</strong>
          </div>
        </div>
        <div className="transition-line">
          <span>BRINCADEIRA</span><b>Um áudio perdido</b><i>→</i><span>PROJETO</span><b className="green">Som + capa + Canvas + link</b>
        </div>
        <a href="#jornada" className="pain-cta">QUERO CRIAR COM DIREÇÃO <Arrow /></a>
      </section>

      <section className="recognition section" id="mercado">
        <div className="recognition-orbits" aria-hidden="true"><i /><i /><i /></div>
        <div className="recognition-head">
          <div>
            <div className="eyebrow">A MÚSICA COM IA JÁ SAIU DA BOLHA</div>
            <h2>Não é mais só curiosidade.<br /><em>É uma nova categoria.</em></h2>
          </div>
          <p>Ela entrou na Billboard, conquistou milhões de ouvintes, chegou às rádios e passou a fazer parte dos planos das maiores gravadoras. Isso prova a categoria — não garante o seu resultado.</p>
        </div>

        <div className="recognition-chart" aria-label="Marcos da música criada com inteligência artificial">
          <a className="chart-row chart-featured" href="https://abcnews.com/GMA/Culture/ai-generated-country-song-topping-billboards-country-digital/story?id=127445549" target="_blank" rel="noreferrer">
            <span className="chart-position">01</span>
            <span className="chart-cover chart-cover-rust"><i>BR</i></span>
            <span className="chart-copy"><small>BILLBOARD • COUNTRY DIGITAL SONG SALES</small><strong>Uma música criada com IA chegou ao primeiro lugar</strong><span>“Walk My Walk”, do projeto Breaking Rust, ultrapassou 3 milhões de streams no Spotify em menos de um mês.</span></span>
            <span className="chart-signal"><b>↑</b> #1</span>
            <span className="chart-source">ABC NEWS ↗</span>
          </a>

          <a className="chart-row" href="https://www.billboard.com/pro/ai-music-artist-xania-monet-multimillion-dollar-record-deal/" target="_blank" rel="noreferrer">
            <span className="chart-position">02</span>
            <span className="chart-cover chart-cover-xania"><i>XM</i></span>
            <span className="chart-copy"><small>CONTRATO E INDÚSTRIA</small><strong>US$ 3 milhões por um projeto musical criado com IA</strong><span>Xania Monet assinou com a Hallwood Media e acumulou milhões de streams nos Estados Unidos.</span></span>
            <span className="chart-signal"><b>●</b> US$3M</span>
            <span className="chart-source">BILLBOARD ↗</span>
          </a>

          <a className="chart-row" href="https://www.berklee.edu/berklee-now/news/velvet-sundown-ai-band-controversy" target="_blank" rel="noreferrer">
            <span className="chart-position">03</span>
            <span className="chart-cover chart-cover-velvet"><i>VS</i></span>
            <span className="chart-copy"><small>AUDIÊNCIA NO SPOTIFY</small><strong>Mais de 1,4 milhão de ouvintes mensais</strong><span>The Velvet Sundown construiu música, integrantes e universo visual usando inteligência artificial.</span></span>
            <span className="chart-signal"><b>◉</b> 1,4M+</span>
            <span className="chart-source">BERKLEE ↗</span>
          </a>

          <a className="chart-row" href="https://newsroom-deezer.com/2025/11/deezer-ipsos-survey-ai-music/" target="_blank" rel="noreferrer">
            <span className="chart-position">04</span>
            <span className="chart-cover chart-cover-test"><i>97</i></span>
            <span className="chart-copy"><small>PESQUISA DEEZER + IPSOS • INCLUIU O BRASIL</small><strong>97% não identificaram corretamente todas as músicas de IA</strong><span>Cerca de 9 mil pessoas, em oito países, participaram do teste cego.</span></span>
            <span className="chart-signal"><b>≈</b> 97%</span>
            <span className="chart-source">DEEZER ↗</span>
          </a>
        </div>

        <div className="industry-deals">
          <div className="industry-intro">
            <span className="pulse-dot" />
            <small>O MERCADO SE MOVEU</small>
            <strong>De processo judicial<br />a parceria comercial.</strong>
          </div>
          <a href="https://www.wmg.com/news" target="_blank" rel="noreferrer">
            <span>GRAVADORAS × IA MUSICAL</span>
            <p>Desenvolvimento de música licenciada e novas oportunidades para artistas e compositores.</p>
            <b>LER FONTE ↗</b>
          </a>
          <a href="https://www.universalmusic.com" target="_blank" rel="noreferrer">
            <span>LICENCIAMENTO × IA MUSICAL</span>
            <p>Uma nova plataforma comercial de criação musical com conteúdo autorizado e licenciado.</p>
            <b>LER FONTE ↗</b>
          </a>
        </div>

        <div className="recognition-thesis">
          <span className="thesis-wave" aria-hidden="true">{Array.from({ length: 30 }, (_, index) => <i key={index} />)}</span>
          <div>
            <small>A VERDADE QUE IMPORTA</small>
            <strong>O mundo não precisa de mais música genérica gerada em massa.</strong>
            <p>Precisa de pessoas que saibam usar inteligência artificial com intenção, identidade e direção artística.</p>
          </div>
        </div>
        <div className="center-cta"><a href="#jornada" className="pill pill-green">Quero construir uma música com identidade <Arrow /></a></div>
      </section>

      <section className="journey section" id="jornada">
        <img src="/elemento-ideia-ao-link.png" alt="" className="journey-flow-asset" aria-hidden="true" />
        <div className="journey-head">
          <div>
            <div className="eyebrow">O MECANISMO</div>
            <h2>Método<br /><em>Da Ideia ao Link.</em></h2>
          </div>
          <p>Você não compra um passeio por ferramentas. Segue uma jornada organizada para construir música, identidade e lançamento.</p>
        </div>
        <div className="launch-line" aria-label="Etapas da ideia ao link">
          {["IDEIA", "MÚSICA", "CAPA", "CANVAS", "PLATAFORMAS", "LINK"].map((item, index) => (
            <span key={item}><i>{String(index + 1).padStart(2, "0")}</i><b>{item}</b></span>
          ))}
        </div>
        <figure className="method-visual">
          <img src="/metodo-ideia-ao-link.webp" alt="Saraiva produzindo uma música: da ideia, passando pela capa e pelo Canvas, até a publicação" />
          <figcaption>
            <small>O CAMINHO COMPLETO</small>
            <strong>Criação, identidade e publicação dentro da mesma jornada.</strong>
          </figcaption>
        </figure>
        <div className="tracklist">
          <div className="tracklist-head"><span>#</span><span>ETAPA</span><span>O QUE ACONTECE</span><span>ENTREGA</span></div>
          {tracks.map(([number, title, description, duration], index) => (
            <article key={number} className={index === 0 ? "active" : ""}>
              <span className="track-number">{index === 0 ? <Equalizer playing={jinglePlaying} /> : number}</span>
              <strong>{title}</strong>
              <p>{description}</p>
              <time>{duration}</time>
              <span className="track-arrow">↗</span>
            </article>
          ))}
        </div>
        <div className="journey-result">
          <span className="result-icon">▶</span>
          <div><small>RESULTADO DA JORNADA</small><strong>Uma música criada com intenção, apresentada com identidade e corretamente preparada para distribuição.</strong></div>
        </div>
      </section>

      <section className="transformation section">
        <div className="transformation-head">
          <div className="eyebrow">A TRANSFORMAÇÃO</div>
          <h2>Sua música deixa de ser tentativa.<br /><em>Ela vira lançamento.</em></h2>
        </div>
        <div className="before-after">
          <article className="before-card">
            <small>ANTES</small>
            <h3>Um arquivo que só você escuta.</h3>
            {["Uma ideia solta", "Resultado genérico", "Dúvidas sobre direitos e plataformas", "Vergonha de mostrar algo incompleto"].map(item => <p key={item}><span>×</span>{item}</p>)}
          </article>
          <article className="after-card">
            <small>DEPOIS</small>
            <h3>Um projeto que você tem orgulho de mostrar.</h3>
            {["Música criada com direção", "Capa com aparência profissional", "Identidade visual + Spotify Canvas", "Caminho de distribuição entendido"].map(item => <p key={item}><Check />{item}</p>)}
          </article>
        </div>
      </section>

      <section className="identity-showcase section">
        <div className="identity-copy">
          <div className="eyebrow">UMA IDEIA. MUITAS IDENTIDADES.</div>
          <h2>Você não recebe uma estética pronta.<br /><em>Constrói a sua.</em></h2>
          <p>Trap, pop, eletrônico ou romântico: a inteligência artificial amplia possibilidades. O método ajuda você a manter intenção, coerência e presença em cada escolha.</p>
          <div className="identity-chips" aria-label="Exemplos de estilos musicais">
            <span>TRAP</span><span>POP</span><span>ACÚSTICO</span><span>ELETRÔNICO</span>
          </div>
        </div>
        <div className="identity-visual">
          <img src="/identidades-musicais.webp" alt="Saraiva representado em quatro universos musicais diferentes" />
          <span className="identity-scan" aria-hidden="true" />
        </div>
      </section>

      <section className="founder section">
        <div className="founder-image-wrap">
          <img src="/studio-saraiva.webp" alt="Saraiva criando música em um estúdio com inteligência artificial" />
          <div className="image-caption"><span>8.000+</span> gerações para transformar tentativa em método</div>
        </div>
        <div className="founder-copy">
          <div className="eyebrow">QUEM VAI TE GUIAR</div>
          <h2>Eu gerei. Errei. Refiz. E aprendi a <em>publicar.</em></h2>
          <p>Eu também comecei gerando músicas e deixando tudo preso dentro da ferramenta. Depois de milhares de testes, distribuidoras, erros e versões, organizei o caminho completo que eu gostaria de ter recebido no começo.</p>
          <blockquote>“Gerar o áudio é só o começo. A música passa a existir quando ganha identidade, lançamento e um lugar para ser ouvida.”</blockquote>
          <div className="signature"><b>Saraiva</b><span>Criador da Academia Música IA</span></div>
        </div>
      </section>

      <section className="spotify-showcase section" id="musicas">
        <div className="spotify-motion" aria-hidden="true">
          <i /><i /><i /><i /><i />
        </div>
        <div className="spotify-copy">
          <div className="eyebrow">MINHAS MÚSICAS JÁ ESTÃO NO MUNDO</div>
          <h2>Ouça no Spotify.<br /><em>Sem sair da página.</em></h2>
          <p>Esse é o resultado do processo completo: músicas criadas, finalizadas, distribuídas e disponíveis onde as pessoas realmente ouvem música.</p>
          <a className="pill pill-green" href="https://open.spotify.com/intl-pt/artist/6QCboo7mQn9Yhux3GBQnNr" target="_blank" rel="noreferrer">Abrir perfil no Spotify <Arrow /></a>
        </div>
        <div className="spotify-embed-wrap">
          <div className="embed-glow" aria-hidden="true" />
          <iframe
            title="Músicas de Saraiva no Spotify"
            src="https://open.spotify.com/embed/artist/6QCboo7mQn9Yhux3GBQnNr?utm_source=generator&theme=0"
            width="100%"
            height="352"
            allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
            loading="lazy"
          />
        </div>
      </section>

      <section className="library section" id="biblioteca">
        <div className="library-visual">
          <img src="/album-grid-saraiva.webp" alt="Coleção visual de capas musicais criadas com inteligência artificial" />
          <img src="/elemento-vinil-capa.png" alt="" className="library-vinyl-asset" aria-hidden="true" />
          <span className="library-badge">BIBLIOTECA<br /><b>VIVA</b></span>
        </div>
        <div className="library-content">
          <div className="eyebrow">CADA ENTREGA APROXIMA DO LINK</div>
          <h2>Menos conteúdo solto.<br /><em>Mais implementação.</em></h2>
          <div className="library-list">
            {library.map(([title, description, meta], index) => (
              <article key={title}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <div><strong>{title}</strong><p>{description}</p></div>
                <small>{meta}</small>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="audience section">
        <div className="audience-title">
          <div className="eyebrow">PARA QUEM É</div>
          <h2>Você traz a ideia.<br /><em>A Academia mostra o caminho.</em></h2>
        </div>
        <div className="audience-cards">
          {[
            ["01", "A pessoa curiosa", "Ama música, nunca aprendeu a tocar e quer descobrir o que consegue criar."],
            ["02", "Quem guarda histórias", "Tem letras, lembranças e sentimentos, mas nunca soube transformá-los em canção."],
            ["03", "Quem quer estar no Spotify", "Deseja ter uma música própria publicada e um link real para compartilhar."],
            ["04", "Quem já gerou e parou", "Tem arquivos de músicas com IA, mas nunca construiu capa, lançamento ou distribuição."],
          ].map(([n, title, copy]) => (
            <article key={n}><span>{n}</span><div className="vinyl" /><h3>{title}</h3><p>{copy}</p></article>
          ))}
        </div>
        <div className="not-for">
          <div><small>PARA QUEM NÃO É</small><h3>A promessa é processo.<br />Não milagre.</h3></div>
          <div className="not-for-list">
            {["Não é para quem procura botão mágico.", "Não é para quem quer copiar artista famoso.", "Não é para quem espera fama ou sucesso automático.", "Não é para quem quer ignorar regras de ferramentas e plataformas."].map(item => <p key={item}><span>×</span>{item}</p>)}
          </div>
        </div>
      </section>

      <section className="offer section" id="oferta">
        <div className="offer-art">
          <img src="/kit-lancamento.webp" alt="Kit visual de um lançamento musical com capa, player, Canvas, link e fones" />
          <span className="offer-orbit orbit-one" aria-hidden="true" />
          <span className="offer-orbit orbit-two" aria-hidden="true" />
        </div>
        <div className="offer-copy">
          <div className="eyebrow">APERTE O PLAY</div>
          <h2>Entre para a<br /><em>Academia Música IA</em></h2>
          <p>Você não recebe apenas aulas. Conversa com o Produtor IA, aprende enquanto cria e tem 25 músicas incluídas para testar estilos, comparar versões e escolher as favoritas.</p>
          <div className="included">
            {["Produtor IA por texto ou voz", "25 músicas para criar e baixar", "Método Da Ideia ao Link", "Capa + Spotify Canvas", "Publicação + comunidade"].map(item => <span key={item}><Check /> {item}</span>)}
          </div>
          <div className="price-row"><small>INVESTIMENTO</small><div><sup>R$</sup>197</div><span>pagamento único</span></div>
          <a href="/checkout" className="pill pill-green pill-full" data-track="checkout_cta">Quero meu Produtor IA + 25 músicas <Arrow /></a>
          <small className="safe">🔒 Compra segura • acesso online • nível iniciante</small>
          <p className="external-costs">As 25 músicas estão incluídas. Serviços opcionais de distribuição ou publicação podem ter custos externos.</p>
        </div>
      </section>

      <section className="guarantee section">
        <div className="guarantee-number">7<span>DIAS</span></div>
        <div><div className="eyebrow">VOCÊ DECIDE COM CLAREZA</div><h2>Entre. Explore.<br /><em>Decida com calma.</em></h2><p>Você tem 7 dias para conhecer o treinamento e avaliar se a experiência faz sentido. A solicitação de reembolso deve seguir as condições apresentadas no checkout.</p></div>
      </section>

      <section className="faq section" id="duvidas">
        <div className="faq-title">
          <div className="eyebrow">PERGUNTAS FREQUENTES</div>
          <h2>Antes do seu<br />primeiro <em>play.</em></h2>
        </div>
        <div className="faq-list">
          {faqs.map(([question, answer], index) => (
            <article key={question} className={openFaq === index ? "open" : ""}>
              <button onClick={() => setOpenFaq(openFaq === index ? -1 : index)} aria-expanded={openFaq === index}>
                <span>{question}</span><i>{openFaq === index ? "−" : "+"}</i>
              </button>
              <div><p>{answer}</p></div>
            </article>
          ))}
        </div>
      </section>

      <section className="final-cta" id="checkout">
        <div className="sound-rings" aria-hidden="true"><i /><i /><i /><i /></div>
        <img src="/elemento-play-3d.png" alt="" className="final-play-asset" aria-hidden="true" />
        <div className="eyebrow">SUA IDEIA JÁ É O COMEÇO</div>
        <h2>Sua primeira música<br /><em>começa com uma conversa.</em></h2>
        <div className="final-stack"><span>SOM</span><i>+</i><span>CAPA</span><i>+</i><span>CANVAS</span><i>+</i><span>LINK</span><i>=</i><b>PRESENÇA</b></div>
        <a href="/checkout" className="pill pill-dark" data-track="checkout_cta">Quero conversar e criar <Arrow /></a>
        <p>Você conta a história. O Produtor IA ajuda a transformar em música.</p>
      </section>

      <a href="/checkout" className="mobile-sticky-cta" data-track="checkout_cta">CONVERSAR E CRIAR <Arrow /></a>

      <footer>
        <a href="#inicio" className="brand"><span className="brand-disc"><i /><i /><i /></span><span>Academia <b>Música IA</b></span></a>
        <p>© 2026 Academia Música IA. Criado para quem decidiu criar.</p>
        <div><a href="/termos">Termos</a><a href="/privacidade">Privacidade</a></div>
      </footer>
    </main>
  );
}
