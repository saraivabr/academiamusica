import type { Metadata } from "next";
import { LegalPage } from "../components/Portal";

export const metadata: Metadata = {
  title: "Termos de uso",
  description: "Condições para usar a plataforma Academia Música IA.",
  alternates: { canonical: "/termos/" },
};

export default function Termos() {
  return (
    <LegalPage title="Termos de uso" updated="27 de julho de 2026">
      <h2>1. Objeto</h2>
      <p>Estes termos regulam o acesso à Academia Música IA, uma plataforma para criação, organização e preparação de lançamentos musicais com tutoriais integrados à experiência.</p>

      <h2>2. Conta gratuita</h2>
      <p>O cadastro inicial é gratuito e exige e-mail válido e confirmado. A conta oferece uma música gratuita por dia, sujeita à disponibilidade técnica e aos controles de uso justo. Não é necessário cadastrar cartão.</p>

      <h2>3. Criador musical</h2>
      <p>O usuário informa sua ideia e escolhe direção, emoção, estilo e voz por meio da interface visual. Antes da criação, a plataforma apresenta o resumo e o consumo de créditos para confirmação. Resultados automatizados podem exigir revisão e uma nova tentativa.</p>

      <h2>4. Música diária e créditos</h2>
      <p>A primeira criação elegível de cada dia entrega uma música e não reduz créditos. Depois dela, cada criação extra normalmente entrega duas versões e utiliza o saldo apresentado na confirmação. O benefício diário não acumula, renova pelo horário de Brasília e pode ser suspenso em caso de fraude, automação ou criação abusiva de contas. Tentativas que falharem antes da entrega liberam novamente o benefício ou saldo reservado.</p>

      <h2>5. Histórico das músicas</h2>
      <p>As versões concluídas ficam disponíveis no repertório pessoal do usuário, com player e link de download, enquanto a plataforma permanecer disponível. Recargas são opcionais, pagas separadamente e não expiram enquanto o acesso estiver disponível.</p>

      <h2>6. Recargas e Clube Criador</h2>
      <p>Recargas avulsas são compras únicas e não geram renovação. O Clube Criador é uma assinatura mensal por Pix Automático: cada mensalidade efetivamente paga adiciona o saldo informado na oferta. Os créditos não utilizados se somam ao saldo existente. A autorização pode ser cancelada pelo aplicativo do banco do pagador ou pelo suporte; o cancelamento impede cobranças futuras e não remove créditos já pagos.</p>

      <h2>7. Uso justo e segurança</h2>
      <p>Cada pessoa deve manter uma única conta gratuita. Para prevenir abuso, a plataforma aplica limites de cadastro e uso por conta, dispositivo e rede, utilizando identificadores protegidos e sinais técnicos proporcionais. Redes compartilhadas podem exigir análise do suporte. Não coletamos endereço MAC.</p>

      <h2>8. Responsabilidade do usuário</h2>
      <p>O usuário é responsável por revisar suas escolhas, respeitar direitos autorais, direitos de imagem, termos das ferramentas, distribuidoras e plataformas utilizadas e não solicitar imitação indevida de terceiros.</p>

      <h2>9. Resultados</h2>
      <p>A plataforma orienta o processo e fornece as criações indicadas. Não garante aprovação, publicação, monetização, quantidade de streams, renda, fama ou resultado artístico específico.</p>

      <h2>10. Custos opcionais e externos</h2>
      <p>A música diária é gratuita. Recargas, assinaturas, distribuição, publicação ou outros serviços externos podem ter custos próprios, sempre apresentados antes da contratação.</p>

      <h2>11. Uso dos tutoriais</h2>
      <p>Os tutoriais são licenciados para uso pessoal do usuário e não podem ser revendidos, redistribuídos ou publicados integralmente sem autorização.</p>

      <h2>12. Suporte e reembolso</h2>
      <p>O usuário pode solicitar suporte pelo canal oficial indicado no site. Garantias e reembolsos aplicam-se apenas às compras realizadas e seguem as condições apresentadas no momento do pagamento.</p>
    </LegalPage>
  );
}
