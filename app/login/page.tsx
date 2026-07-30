import type { Metadata } from "next";
import { PublicShell } from "../components/Portal";
import AccessLogin from "./AccessLogin";
import styles from "./login.module.css";

export const metadata: Metadata = {
  title: "Entrar",
  description: "Entre ou crie sua conta na musicacom.ia.",
  robots: {
    index: false,
    follow: false,
  },
};

export default function Login() {
  return (
    <PublicShell compact>
      <main id="login-experience" className={styles.loginExperience}>
        <section className={styles.visualPanel} aria-labelledby="login-promise">
          <div className={styles.ambientGlow} aria-hidden="true" />

          <div className={styles.visualCopy}>
            <span className={styles.kicker}>SEU ESTÚDIO COMEÇA AQUI</span>
            <h1 id="login-promise">
              Uma ideia hoje.
              <em>Uma música sua.</em>
            </h1>
            <p>
              Entre, recupere sua direção e acompanhe cada etapa até a música
              pronta, com créditos e projetos preservados.
            </p>
          </div>

          <div className={styles.recordStage} aria-hidden="true">
            <div className={styles.albumSleeve}>
              <span>PROJETO INICIAL</span>
              <strong>20 CRÉDITOS</strong>
              <small>10 RODADAS</small>
              <i />
            </div>
            <div className={styles.vinyl}>
              <div className={styles.vinylLabel}>
                <img src="/brand/musicacom-symbol.png" alt="" width="358" height="188" />
              </div>
            </div>
          </div>

          <div className={styles.miniPlayer} aria-hidden="true">
            <div className={styles.playerCover}>
              <img src="/brand/musicacom-symbol.png" alt="" width="358" height="188" />
            </div>
            <div className={styles.playerTrack}>
              <strong>Seu próximo som</strong>
              <span>Pronto para ganhar forma</span>
            </div>
            <div className={styles.waveform}>
              {Array.from({ length: 18 }, (_, index) => <i key={index} />)}
            </div>
            <div className={styles.playButton}>▶</div>
          </div>

          <div className={styles.benefitStrip}>
            <span>PIX ÚNICO</span>
            <span>CRÉDITOS PRESERVADOS</span>
            <span>BIBLIOTECA SALVA</span>
          </div>
        </section>

        <section className={styles.formPanel} aria-label="Acesso à plataforma">
          <AccessLogin />
          <p className={styles.trustLine}>
            <span aria-hidden="true">●</span>
            Acesso protegido e seus projetos sempre com você.
          </p>
        </section>
      </main>
    </PublicShell>
  );
}
