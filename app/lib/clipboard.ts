"use client";

// A área de transferência falha em contexto não seguro, quando a permissão é
// negada ou quando o navegador não expõe a API. Sem tratamento, a promessa
// rejeita em silêncio e o botão não dá sinal nenhum ao usuário.
export async function copyText(value: string): Promise<boolean> {
  if (!value) return false;
  try {
    await navigator.clipboard.writeText(value);
    return true;
  } catch {
    return false;
  }
}
