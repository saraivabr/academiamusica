import type { Metadata } from "next";
import { LegalPage } from "../components/Portal";
export const metadata: Metadata = {
  title: "Política de reembolso",
  description: "Condições de cancelamento e reembolso da Academia Música IA.",
  alternates: { canonical: "/reembolso/" },
};
export default function Reembolso(){return <LegalPage title="Política de reembolso" updated="26 de julho de 2026"><h2>Garantia de 7 dias</h2><p>O aluno poderá solicitar cancelamento dentro de 7 dias corridos contados da confirmação da compra, observadas as regras apresentadas no checkout e a legislação aplicável.</p><h2>Como solicitar</h2><p>A solicitação deverá ser feita pelo canal oficial disponível na página de suporte, informando o e-mail da compra e os dados necessários para localização do pedido.</p><h2>Processamento</h2><p>Após validação, o reembolso seguirá os prazos e procedimentos da Woovi e da instituição financeira. O tempo para visualização do crédito pode variar.</p><h2>Após o prazo</h2><p>Pedidos fora da garantia serão analisados conforme a legislação, as condições da oferta e eventuais problemas comprovados de acesso ou entrega.</p><h2>Contratações futuras</h2><p>Pacotes adicionais ou serviços opcionais, quando oferecidos, apresentarão preço e condições próprias antes da contratação.</p></LegalPage>}
