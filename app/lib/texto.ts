// Mensagens que contam quanto falta digitar aparecem no hero e na prévia. Sem
// concordância, a última letra antes de liberar vira "Faltam 1 caracteres".
export function faltamCaracteres(quantidade: number, complemento: string) {
  return quantidade === 1
    ? `Falta 1 caractere ${complemento}.`
    : `Faltam ${quantidade} caracteres ${complemento}.`;
}
