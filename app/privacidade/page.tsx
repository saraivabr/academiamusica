import type { Metadata } from "next";
import { LegalPage } from "../components/Portal";

export const metadata: Metadata = {
  title: "Política de privacidade",
  description: "Saiba como a musicacom.ia trata e protege seus dados.",
  alternates: { canonical: "/privacidade/" },
};

export default function Privacidade() {
  return (
    <LegalPage title="Política de privacidade" updated="27 de julho de 2026">
      <h2>1. Quem controla os dados</h2>
      <p>A musicacom.ia é responsável pelas decisões sobre o tratamento realizado dentro da plataforma. Solicitações podem ser encaminhadas pelo canal oficial indicado na página de suporte.</p>

      <h2>2. Dados tratados</h2>
      <p>Tratamos nome, e-mail confirmado, telefone informado voluntariamente, identificadores da conta e do pedido, situação do pagamento, dados de acesso, suporte, progresso e informações técnicas necessárias para segurança e entrega da experiência. Na assinatura via Pix Automático, CPF e endereço são enviados ao provedor de pagamento para criar e administrar a autorização recorrente.</p>
      <p>Para impedir múltiplas contas gratuitas, usamos um identificador aleatório salvo no dispositivo e uma representação criptográfica temporária do endereço de rede. Não coletamos endereço MAC, não armazenamos o IP em formato legível nesses controles e limitamos a retenção dos marcadores antifraude.</p>

      <h2>3. Conversa e criação com inteligência artificial</h2>
      <p>As mensagens enviadas ao Produtor IA são processadas para organizar a direção musical e gerar a resposta. O conteúdo da conversa permanece salvo no dispositivo do aluno e não é armazenado pela Academia em sua base de métricas. Quando o ditado do navegador é usado, a Academia recebe o texto transcrito, não o arquivo de áudio; o tratamento do microfone também depende das regras do navegador e do dispositivo.</p>
      <p>Textos, imagens, referências e demais materiais enviados aos recursos criativos podem ser processados pelos provedores tecnológicos necessários para entregar música, capa ou orientação solicitada.</p>

      <h2>4. Finalidades e bases de tratamento</h2>
      <p>Os dados são utilizados para executar a compra e o serviço contratado, gerar e confirmar pedidos, liberar acesso, produzir as criações solicitadas, prestar suporte, cumprir obrigações legais, prevenir fraude e abuso e melhorar a estabilidade do produto. Medições publicitárias dependem de autorização do visitante.</p>

      <h2>5. Pagamentos</h2>
      <p>O pagamento Pix é processado pela Woovi. A Academia recebe apenas as informações necessárias para identificar e confirmar a cobrança e não acessa credenciais ou dados bancários do comprador.</p>

      <h2>6. Medição de campanhas e produto</h2>
      <p>Com a sua autorização, usamos o Pixel da Meta para medir visualizações, abertura do checkout, início de compra e compras confirmadas. Também registramos eventos operacionais como conversa iniciada, direção pronta e criação concluída, sem guardar o texto da história nessas métricas.</p>
      <p>Você pode recusar a medição publicitária e continuar usando os recursos essenciais. O consentimento poderá ser revogado pelo controle de privacidade apresentado no site ou mediante solicitação ao suporte, sem afetar tratamentos realizados anteriormente de forma legítima.</p>

      <h2>7. Compartilhamento e operadores</h2>
      <p>Dados poderão ser compartilhados, no limite necessário, com provedores de hospedagem e nuvem, autenticação e envio de código por e-mail, inteligência artificial, geração musical e visual, pagamento, comunicação, métricas e área de membros. Mediante autorização, informações de medição poderão ser compartilhadas com a Meta.</p>
      <p>Alguns provedores podem processar dados fora do Brasil. Nesses casos, a Academia adota fornecedores com mecanismos contratuais e práticas de proteção compatíveis com a finalidade do serviço.</p>

      <h2>8. Conservação e segurança</h2>
      <p>Os registros são conservados somente pelo período necessário para entregar a plataforma, manter o histórico contratado, prestar suporte, prevenir fraude, resolver disputas e cumprir obrigações legais ou regulatórias. Encerrada a finalidade, os dados são eliminados ou anonimizados, salvo quando a conservação for permitida ou exigida.</p>
      <p>São aplicadas medidas técnicas e organizacionais de proteção. Nenhum ambiente digital é totalmente imune a incidentes, por isso os controles são revistos conforme a evolução da plataforma.</p>

      <h2>9. Direitos do titular</h2>
      <p>O titular poderá solicitar confirmação de tratamento, acesso, correção, portabilidade quando aplicável, informação sobre compartilhamento, revisão de decisões automatizadas, revogação de consentimento, anonimização, bloqueio ou eliminação, observadas as hipóteses legais de conservação.</p>

      <h2>10. Cookies e armazenamento local</h2>
      <p>Cookies e armazenamento do navegador são usados para sessão, segurança, preferências, continuidade do checkout e funcionamento da área de membros. Recursos não essenciais de publicidade somente são ativados conforme a escolha do visitante.</p>

      <h2>11. Atualizações e contato</h2>
      <p>Esta política pode ser atualizada para refletir mudanças no produto, nos provedores ou na legislação. A data da versão vigente aparece no topo desta página. Solicitações de privacidade podem ser enviadas pelo canal oficial disponível na página de suporte.</p>
    </LegalPage>
  );
}
