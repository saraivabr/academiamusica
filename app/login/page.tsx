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
          <div className="eyebrow">COMECE GRÁTIS</div>
          <h1>Uma música nova, todos os dias.</h1>
          <p>
            Crie sua conta, confirme o e-mail e faça uma música por dia sem pagar.
            Quando quiser produzir mais, é só adicionar créditos.
          </p>
          <div className="login-free-proof">
            <span>✓ Sem cartão</span>
            <span>✓ Sem prazo de teste</span>
            <span>✓ Sua biblioteca fica salva</span>
          </div>
        </section>
        <AccessLogin />
      </main>
    </PublicShell>
  );
}
