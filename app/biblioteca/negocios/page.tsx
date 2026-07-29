"use client";

import { FormEvent, useEffect, useState } from "react";
import { AcademyShell } from "../../components/Portal";
import {
  businessProspectStorageKey,
  type BusinessProspect,
} from "../../lib/businessProspects";
import { memberApi } from "../../lib/access";
import { trackEvent } from "../../lib/analytics";

const searchSuggestions = [
  "Restaurantes",
  "Clínicas de estética",
  "Academias",
  "Lojas de roupas",
] as const;

const runningStatuses = new Set(["READY", "RUNNING"]);

export default function Negocios() {
  const [query, setQuery] = useState("");
  const [location, setLocation] = useState("");
  const [limit, setLimit] = useState(10);
  const [searchId, setSearchId] = useState("");
  const [searchStatus, setSearchStatus] = useState("");
  const [prospects, setProspects] = useState<BusinessProspect[]>([]);
  const [error, setError] = useState("");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setHydrated(true), 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!searchId) return;
    let active = true;
    let timer = 0;
    let attempts = 0;

    const poll = async () => {
      try {
        const data = await memberApi(
          `/v1/prospects/search/${encodeURIComponent(searchId)}`,
        );
        if (!active) return;
        const status = String(data.status || "RUNNING");
        setSearchStatus(status);
        if (status === "SUCCEEDED") {
          const nextProspects = Array.isArray(data.prospects)
            ? data.prospects as BusinessProspect[]
            : [];
          setProspects(nextProspects);
          setSearchId("");
          trackEvent("prospect_search_completed", window.location.pathname, {
            outcome: nextProspects.length ? "results" : "empty",
          });
          return;
        }
        attempts += 1;
        if (!runningStatuses.has(status) || attempts >= 60) {
          setSearchId("");
          setError("A busca demorou além do esperado. Tente novamente.");
          return;
        }
        timer = window.setTimeout(poll, 3_000);
      } catch (requestError) {
        if (!active) return;
        setSearchId("");
        setError(
          requestError instanceof Error
            ? requestError.message
            : "Não foi possível concluir a busca.",
        );
      }
    };

    timer = window.setTimeout(poll, 1_000);
    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [searchId]);

  async function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (query.trim().length < 2 || location.trim().length < 2 || searchId) return;
    setError("");
    setProspects([]);
    setSearchStatus("STARTING");
    trackEvent("prospect_search_started");
    try {
      const data = await memberApi("/v1/prospects/search", {
        method: "POST",
        body: JSON.stringify({
          query: query.trim(),
          location: location.trim(),
          limit,
        }),
      });
      setSearchId(String(data.searchId));
      setSearchStatus(String(data.status || "RUNNING"));
    } catch (requestError) {
      setSearchStatus("");
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Não foi possível iniciar a busca.",
      );
    }
  }

  function createJingle(prospect: BusinessProspect) {
    window.sessionStorage.setItem(
      businessProspectStorageKey,
      JSON.stringify(prospect),
    );
    trackEvent("prospect_jingle_started", window.location.pathname, {
      placement: "business_result",
    });
    window.location.assign("/biblioteca/gerador/?source=business-prospect");
  }

  const isSearching = Boolean(searchId);

  return (
    <AcademyShell
      title="Buscar negócios"
      eyebrow="PROSPECÇÃO PARA JINGLES"
      className="prospect-academy"
    >
      <section className="prospect-hero">
        <div>
          <small>CLIENTES PERTO DE VOCÊ</small>
          <h2>Encontre negócios que podem virar música.</h2>
          <p>
            Pesquise empresas no Google Maps, escolha uma oportunidade e leve os
            dados reais direto para o Criador de Jingles.
          </p>
        </div>
        <span><b>5</b><small>buscas por dia</small></span>
      </section>

      <form
        className="prospect-search"
        data-interactive={hydrated ? "true" : "false"}
        onSubmit={submitSearch}
      >
        <header>
          <small>BUSCA COM APIFY</small>
          <h3>Onde estão seus próximos clientes?</h3>
        </header>
        <div className="prospect-fields">
          <label>
            <span>Tipo de negócio</span>
            <input
              value={query}
              maxLength={80}
              placeholder="Ex.: restaurantes, lojas, clínicas"
              onChange={(event) => setQuery(event.target.value)}
            />
          </label>
          <label>
            <span>Cidade ou região</span>
            <input
              value={location}
              maxLength={120}
              placeholder="Ex.: Salvador, BA"
              onChange={(event) => setLocation(event.target.value)}
            />
          </label>
          <label className="prospect-limit">
            <span>Resultados</span>
            <select value={limit} onChange={(event) => setLimit(Number(event.target.value))}>
              <option value={5}>5 empresas</option>
              <option value={10}>10 empresas</option>
            </select>
          </label>
          <button
            type="submit"
            disabled={
              !hydrated
              || isSearching
              || query.trim().length < 2
              || location.trim().length < 2
            }
          >
            {isSearching ? "Buscando…" : "Buscar negócios"}
          </button>
        </div>
        <div className="prospect-suggestions" aria-label="Sugestões de busca">
          <span>Experimente:</span>
          {searchSuggestions.map((suggestion) => (
            <button
              type="button"
              key={suggestion}
              onClick={() => setQuery(suggestion)}
            >
              {suggestion}
            </button>
          ))}
        </div>
      </form>

      {isSearching ? (
        <section className="prospect-progress" role="status">
          <i aria-hidden="true" />
          <div>
            <small>{searchStatus === "STARTING" ? "INICIANDO" : "CONSULTANDO O GOOGLE MAPS"}</small>
            <h3>O Apify está encontrando as melhores oportunidades.</h3>
            <p>Isso costuma levar de alguns segundos a poucos minutos. Pode deixar esta tela aberta.</p>
          </div>
        </section>
      ) : null}

      {error ? (
        <section className="prospect-error" role="alert">
          <b>Não foi possível concluir</b>
          <p>{error}</p>
        </section>
      ) : null}

      {!isSearching && prospects.length ? (
        <section className="prospect-results">
          <header>
            <div>
              <small>OPORTUNIDADES ENCONTRADAS</small>
              <h3>{prospects.length} negócios para abordar com um jingle</h3>
            </div>
            <span>Dados públicos do Google Maps</span>
          </header>
          <div className="prospect-grid">
            {prospects.map((prospect, index) => (
              <article key={prospect.id}>
                <div className="prospect-rank">
                  <span>{String(index + 1).padStart(2, "0")}</span>
                  {prospect.rating !== null ? (
                    <b>★ {prospect.rating.toLocaleString("pt-BR", { minimumFractionDigits: 1 })}</b>
                  ) : null}
                </div>
                <div className="prospect-copy">
                  <small>{prospect.category || "NEGÓCIO LOCAL"}</small>
                  <h4>{prospect.name}</h4>
                  <p>{prospect.address || "Endereço não informado no Google Maps"}</p>
                  <div>
                    {prospect.phone ? <span>☎ {prospect.phone}</span> : null}
                    {prospect.reviewsCount !== null ? (
                      <span>{prospect.reviewsCount} avaliações</span>
                    ) : null}
                  </div>
                </div>
                <div className="prospect-links">
                  {prospect.mapsUrl ? (
                    <a href={prospect.mapsUrl} target="_blank" rel="noreferrer">
                      Ver no Maps ↗
                    </a>
                  ) : null}
                  {prospect.website ? (
                    <a href={prospect.website} target="_blank" rel="noreferrer">
                      Abrir site ↗
                    </a>
                  ) : null}
                </div>
                <button type="button" onClick={() => createJingle(prospect)}>
                  Criar jingle para esta empresa <span>→</span>
                </button>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {!isSearching && !prospects.length && !error ? (
        <section className="prospect-empty">
          <span aria-hidden="true">⌖</span>
          <div>
            <h3>Comece por um nicho que você conhece.</h3>
            <p>Restaurantes, academias, lojas e clínicas costumam ter nome, público e oferta fáceis de transformar em refrão.</p>
          </div>
        </section>
      ) : null}
    </AcademyShell>
  );
}
