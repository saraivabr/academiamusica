import { PublicShell } from "../components/Portal";
import AccessLogin from "./AccessLogin";

export const metadata = {
  title: "Entrar | Academia Música IA",
};

export default function Login() {
  return (
    <PublicShell compact>
      <main className="login-page">
        <section>
          <div className="eyebrow">BEM-VINDO DE VOLTA</div>
          <h1>Sua próxima faixa começa aqui.</h1>
          <p>
            Use o código do seu pedido confirmado para acessar a Academia neste dispositivo.
          </p>
        </section>
        <AccessLogin />
      </main>
    </PublicShell>
  );
}
