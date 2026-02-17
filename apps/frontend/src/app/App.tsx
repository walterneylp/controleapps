import { useEffect, useMemo, useState } from "react";
import {
  createApp,
  createAttachment,
  createDomain,
  createHosting,
  createIntegration,
  createSecret,
  createSubscription,
  getAppDetail,
  listAlerts,
  listApps,
  listAttachments,
  listAuditEvents,
  listSecrets,
  listSubscriptions,
  login,
  revealSecret,
  type AlertRecord,
  type AppRecord,
  type AttachmentRecord,
  type DomainRecord,
  type HostingRecord,
  type IntegrationRecord,
  type LoginResponse,
  type SecretRecord,
  type SubscriptionRecord
} from "../lib/api";
import "./App.css";

type Session = LoginResponse | null;
type Theme = "light" | "dark";
const APP_VERSION = import.meta.env.VITE_APP_VERSION ?? "v0.1.0";

interface AppDetailState {
  app: AppRecord;
  hostings: HostingRecord[];
  domains: DomainRecord[];
  integrations: IntegrationRecord[];
  subscriptions: SubscriptionRecord[];
  secrets: SecretRecord[];
  attachments: AttachmentRecord[];
}

export function App(): JSX.Element {
  const [theme, setTheme] = useState<Theme>("light");

  const [session, setSession] = useState<Session>(null);
  const [email, setEmail] = useState("admin@controle.local");
  const [password, setPassword] = useState("Admin@123");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const [apps, setApps] = useState<AppRecord[]>([]);
  const [search, setSearch] = useState("");
  const [alerts, setAlerts] = useState<AlertRecord[]>([]);
  const [auditEvents, setAuditEvents] = useState<unknown[]>([]);

  const [selectedAppId, setSelectedAppId] = useState("");
  const [detail, setDetail] = useState<AppDetailState | null>(null);
  const [revealedSecrets, setRevealedSecrets] = useState<Record<string, string>>({});

  const [newAppName, setNewAppName] = useState("");
  const [newCommercialName, setNewCommercialName] = useState("");
  const [newDescription, setNewDescription] = useState("");

  const [hostingProvider, setHostingProvider] = useState("");
  const [hostingIp, setHostingIp] = useState("");
  const [hostingType, setHostingType] = useState<"VPS" | "Provedor">("VPS");

  const [domainValue, setDomainValue] = useState("");
  const [domainRegistrar, setDomainRegistrar] = useState("");
  const [domainStatus, setDomainStatus] = useState<"ativo" | "expirado" | "pendente">("ativo");

  const [integrationProvider, setIntegrationProvider] = useState("");
  const [integrationName, setIntegrationName] = useState("");
  const [integrationScope, setIntegrationScope] = useState("");

  const [subProvider, setSubProvider] = useState("");
  const [subCardName, setSubCardName] = useState("");
  const [subCardLast4, setSubCardLast4] = useState("");
  const [subRecurrence, setSubRecurrence] = useState<"mensal" | "anual">("mensal");

  const [secretKind, setSecretKind] = useState<"ssh" | "domain" | "api_key">("api_key");
  const [secretLabel, setSecretLabel] = useState("");
  const [secretValue, setSecretValue] = useState("");

  const [attachmentName, setAttachmentName] = useState("");
  const [attachmentType, setAttachmentType] = useState("application/pdf");
  const [attachmentSize, setAttachmentSize] = useState("1024");

  async function refreshCoreData(token: string, currentSearch = "") {
    const [appsResult, alertsResult] = await Promise.all([listApps(token, currentSearch), listAlerts(token)]);
    setApps(appsResult);
    setAlerts(alertsResult);
  }

  async function refreshDetail(appId: string, token = session?.accessToken) {
    if (!token || !appId) return;

    const [base, subscriptions, secrets, attachments] = await Promise.all([
      getAppDetail(token, appId),
      listSubscriptions(token, appId),
      listSecrets(token, appId),
      listAttachments(token, appId)
    ]);

    setDetail({ ...base, subscriptions, secrets, attachments });
  }

  function notifyOk(message: string) {
    setSuccess(message);
    setError("");
  }

  function notifyError(err: unknown, fallback: string) {
    setError(err instanceof Error ? err.message : fallback);
    setSuccess("");
  }

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await login({ email, password });
      setSession(result);
      await refreshCoreData(result.accessToken);

      if (result.user.role === "admin" || result.user.role === "editor") {
        const events = await listAuditEvents(result.accessToken);
        setAuditEvents(events.slice(0, 30));
      }

      notifyOk("Login realizado com sucesso.");
    } catch (err) {
      notifyError(err, "Erro inesperado no login");
      setSession(null);
      setApps([]);
      setAlerts([]);
      setAuditEvents([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleSearch() {
    if (!session) return;
    setLoading(true);
    try {
      await refreshCoreData(session.accessToken, search);
    } catch (err) {
      notifyError(err, "Falha na busca");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateApp(e: React.FormEvent) {
    e.preventDefault();
    if (!session) return;
    setLoading(true);
    try {
      await createApp(session.accessToken, { name: newAppName, commercialName: newCommercialName, description: newDescription });
      setNewAppName("");
      setNewCommercialName("");
      setNewDescription("");
      await refreshCoreData(session.accessToken, search);
      notifyOk("App criado.");
    } catch (err) {
      notifyError(err, "Falha ao criar app");
    } finally {
      setLoading(false);
    }
  }

  async function withSelectedApp(action: () => Promise<void>) {
    if (!session || !selectedAppId) {
      setError("Selecione um app antes de cadastrar dados.");
      return;
    }
    setLoading(true);
    try {
      await action();
      await Promise.all([refreshCoreData(session.accessToken, search), refreshDetail(selectedAppId, session.accessToken)]);
    } catch (err) {
      notifyError(err, "Falha na operacao");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!session || !selectedAppId) {
      setDetail(null);
      return;
    }

    refreshDetail(selectedAppId).catch((err) => notifyError(err, "Falha ao carregar detalhe"));
  }, [session, selectedAppId]);

  const alertsByApp = useMemo(() => {
    const map = new Map<string, AlertRecord[]>();
    for (const alert of alerts) {
      const current = map.get(alert.appId) ?? [];
      current.push(alert);
      map.set(alert.appId, current);
    }
    return map;
  }, [alerts]);

  if (!session) {
    return (
      <main className={`shell theme-${theme}`}>
        <div className="login-wrap">
          <section className="card login-card">
            <h1 className="h1">Controle Técnico SaaS/APP</h1>
            <p className="muted">Login da plataforma interna.</p>

            <form onSubmit={handleLogin} className="grid" style={{ marginTop: 12 }}>
              <input className="input" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
              <input className="input" type="password" placeholder="Senha" value={password} onChange={(e) => setPassword(e.target.value)} />
              <button className="button" type="submit" disabled={loading}>
                {loading ? "Entrando..." : "Entrar"}
              </button>
            </form>

            <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
              <button className="button secondary" onClick={() => setTheme(theme === "light" ? "dark" : "light")}>
                Tema: {theme === "light" ? "Claro" : "Escuro"}
              </button>
            </div>

            <p className="muted" style={{ marginTop: 12 }}>Use: admin@controle.local / Admin@123</p>
            {error && <p className="error">{error}</p>}
          </section>
        </div>
        <div className="version-chip">{APP_VERSION}</div>
      </main>
    );
  }

  return (
    <main className={`shell theme-${theme}`}>
      <header className="card topbar">
        <div>
          <h1 className="h1">Painel de Controle Técnico</h1>
          <p className="muted">
            Usuário: {session.user.name} ({session.user.role})
          </p>
        </div>
        <div className="right">
          <input className="input" placeholder="Buscar app" value={search} onChange={(e) => setSearch(e.target.value)} />
          <button className="button" onClick={handleSearch}>
            Buscar
          </button>
          <button className="button secondary" onClick={() => setTheme(theme === "light" ? "dark" : "light")}>Tema {theme === "light" ? "Escuro" : "Claro"}</button>
        </div>
      </header>

      <div className="layout">
        <aside className="card sidebar">
          <h2 className="section-title">Cadastrar App</h2>
          <form className="grid" onSubmit={handleCreateApp}>
            <input className="input" placeholder="Nome interno" value={newAppName} onChange={(e) => setNewAppName(e.target.value)} />
            <input className="input" placeholder="Nome comercial" value={newCommercialName} onChange={(e) => setNewCommercialName(e.target.value)} />
            <input className="input" placeholder="Descrição" value={newDescription} onChange={(e) => setNewDescription(e.target.value)} />
            <button className="button" type="submit" disabled={loading}>Criar App</button>
          </form>

          <h2 className="section-title" style={{ marginTop: 16 }}>Apps ({apps.length})</h2>
          <div className="app-list">
            {apps.map((app) => {
              const appAlerts = alertsByApp.get(app.id) ?? [];
              return (
                <button key={app.id} className={`app-item ${selectedAppId === app.id ? "active" : ""}`} onClick={() => setSelectedAppId(app.id)}>
                  <strong>{app.commercialName}</strong>
                  <div className="muted">{app.name}</div>
                  <div className="muted">{appAlerts.length ? `${appAlerts.length} alerta(s)` : "Sem alertas"}</div>
                </button>
              );
            })}
            {apps.length === 0 && <div className="muted">Nenhum app cadastrado.</div>}
          </div>
        </aside>

        <section className="card main">
          {!selectedAppId || !detail ? (
            <p className="muted">Selecione um app para cadastrar hospedagem, domínio, integrações, segredos, assinaturas e anexos.</p>
          ) : (
            <>
              <h2 className="section-title">{detail.app.commercialName}</h2>
              <p className="muted">{detail.app.description || "Sem descrição"}</p>

              <div className="badges" style={{ marginBottom: 12 }}>
                {(alertsByApp.get(detail.app.id) ?? []).map((a) => (
                  <span key={`${a.code}-${a.message}`} className={`badge ${a.severity === "alta" ? "high" : "med"}`}>
                    {a.code}: {a.message}
                  </span>
                ))}
              </div>

              <div className="two-col">
                <article className="card module-card">
                  <h3 className="section-title">Hospedagem</h3>
                  <form
                    className="grid"
                    onSubmit={(e) => {
                      e.preventDefault();
                      withSelectedApp(async () => {
                        await createHosting(session.accessToken, {
                          appId: selectedAppId,
                          provider: hostingProvider,
                          ip: hostingIp,
                          type: hostingType
                        });
                        setHostingProvider("");
                        setHostingIp("");
                        notifyOk("Hospedagem cadastrada.");
                      });
                    }}
                  >
                    <input className="input" placeholder="Provedor" value={hostingProvider} onChange={(e) => setHostingProvider(e.target.value)} />
                    <input className="input" placeholder="IP" value={hostingIp} onChange={(e) => setHostingIp(e.target.value)} />
                    <select className="select" value={hostingType} onChange={(e) => setHostingType(e.target.value as "VPS" | "Provedor")}> 
                      <option value="VPS">VPS</option>
                      <option value="Provedor">Provedor</option>
                    </select>
                    <button className="button">Adicionar</button>
                  </form>
                  <div className="rows">{detail.hostings.map((h) => <div className="row" key={h.id}>{h.provider} · {h.ip} · {h.type}</div>)}{detail.hostings.length === 0 && <div className="row">Sem hospedagens</div>}</div>
                </article>

                <article className="card module-card">
                  <h3 className="section-title">Domínio</h3>
                  <form
                    className="grid"
                    onSubmit={(e) => {
                      e.preventDefault();
                      withSelectedApp(async () => {
                        await createDomain(session.accessToken, { appId: selectedAppId, domain: domainValue, registrar: domainRegistrar, status: domainStatus });
                        setDomainValue("");
                        setDomainRegistrar("");
                        notifyOk("Domínio cadastrado.");
                      });
                    }}
                  >
                    <input className="input" placeholder="Domínio" value={domainValue} onChange={(e) => setDomainValue(e.target.value)} />
                    <input className="input" placeholder="Registrador" value={domainRegistrar} onChange={(e) => setDomainRegistrar(e.target.value)} />
                    <select className="select" value={domainStatus} onChange={(e) => setDomainStatus(e.target.value as "ativo" | "expirado" | "pendente")}>
                      <option value="ativo">Ativo</option>
                      <option value="pendente">Pendente</option>
                      <option value="expirado">Expirado</option>
                    </select>
                    <button className="button">Adicionar</button>
                  </form>
                  <div className="rows">{detail.domains.map((d) => <div className="row" key={d.id}>{d.domain} · {d.registrar} · {d.status}</div>)}{detail.domains.length === 0 && <div className="row">Sem domínios</div>}</div>
                </article>

                <article className="card module-card">
                  <h3 className="section-title">Integrações IA/API</h3>
                  <form
                    className="grid"
                    onSubmit={(e) => {
                      e.preventDefault();
                      withSelectedApp(async () => {
                        await createIntegration(session.accessToken, {
                          appId: selectedAppId,
                          provider: integrationProvider,
                          integrationName: integrationName,
                          scope: integrationScope
                        });
                        setIntegrationProvider("");
                        setIntegrationName("");
                        setIntegrationScope("");
                        notifyOk("Integração cadastrada.");
                      });
                    }}
                  >
                    <input className="input" placeholder="Provider (OpenAI, Anthropic...)" value={integrationProvider} onChange={(e) => setIntegrationProvider(e.target.value)} />
                    <input className="input" placeholder="Nome da integração" value={integrationName} onChange={(e) => setIntegrationName(e.target.value)} />
                    <input className="input" placeholder="Escopo" value={integrationScope} onChange={(e) => setIntegrationScope(e.target.value)} />
                    <button className="button">Adicionar</button>
                  </form>
                  <div className="rows">{detail.integrations.map((i) => <div className="row" key={i.id}>{i.provider} · {i.integrationName} {i.scope ? `· ${i.scope}` : ""}</div>)}{detail.integrations.length === 0 && <div className="row">Sem integrações</div>}</div>
                </article>

                <article className="card module-card">
                  <h3 className="section-title">Assinaturas Técnicas</h3>
                  <form
                    className="grid"
                    onSubmit={(e) => {
                      e.preventDefault();
                      withSelectedApp(async () => {
                        await createSubscription(session.accessToken, {
                          appId: selectedAppId,
                          provider: subProvider,
                          cardHolderName: subCardName,
                          cardLast4: subCardLast4,
                          recurrence: subRecurrence
                        });
                        setSubProvider("");
                        setSubCardName("");
                        setSubCardLast4("");
                        notifyOk("Assinatura cadastrada.");
                      });
                    }}
                  >
                    <input className="input" placeholder="Fornecedor" value={subProvider} onChange={(e) => setSubProvider(e.target.value)} />
                    <input className="input" placeholder="Nome no cartão" value={subCardName} onChange={(e) => setSubCardName(e.target.value)} />
                    <input className="input" placeholder="Últimos 4 dígitos" value={subCardLast4} onChange={(e) => setSubCardLast4(e.target.value)} maxLength={4} />
                    <select className="select" value={subRecurrence} onChange={(e) => setSubRecurrence(e.target.value as "mensal" | "anual")}>
                      <option value="mensal">Mensal</option>
                      <option value="anual">Anual</option>
                    </select>
                    <button className="button">Adicionar</button>
                  </form>
                  <div className="rows">{detail.subscriptions.map((s) => <div className="row" key={s.id}>{s.provider} · {s.cardHolderName} · **** {s.cardLast4} · {s.recurrence}</div>)}{detail.subscriptions.length === 0 && <div className="row">Sem assinaturas</div>}</div>
                </article>

                <article className="card module-card">
                  <h3 className="section-title">Segredos</h3>
                  <form
                    className="grid"
                    onSubmit={(e) => {
                      e.preventDefault();
                      withSelectedApp(async () => {
                        await createSecret(session.accessToken, { appId: selectedAppId, kind: secretKind, label: secretLabel, plainValue: secretValue });
                        setSecretLabel("");
                        setSecretValue("");
                        notifyOk("Segredo cadastrado com criptografia.");
                      });
                    }}
                  >
                    <select className="select" value={secretKind} onChange={(e) => setSecretKind(e.target.value as "ssh" | "domain" | "api_key")}>
                      <option value="api_key">API Key</option>
                      <option value="ssh">SSH</option>
                      <option value="domain">Domínio</option>
                    </select>
                    <input className="input" placeholder="Rótulo" value={secretLabel} onChange={(e) => setSecretLabel(e.target.value)} />
                    <input className="input" placeholder="Valor secreto" value={secretValue} onChange={(e) => setSecretValue(e.target.value)} />
                    <button className="button">Adicionar</button>
                  </form>
                  <div className="rows">
                    {detail.secrets.map((s) => (
                      <div className="row" key={s.id}>
                        {s.kind} · {s.label}
                        {session.user.role === "admin" && (
                          <div style={{ marginTop: 6 }}>
                            <button
                              className="button secondary"
                              onClick={() =>
                                withSelectedApp(async () => {
                                  const revealed = await revealSecret(session.accessToken, s.id);
                                  setRevealedSecrets((prev) => ({ ...prev, [s.id]: revealed.value }));
                                })
                              }
                            >
                              Revelar
                            </button>
                            {revealedSecrets[s.id] && <div className="muted" style={{ marginTop: 6 }}>Valor: {revealedSecrets[s.id]}</div>}
                          </div>
                        )}
                      </div>
                    ))}
                    {detail.secrets.length === 0 && <div className="row">Sem segredos</div>}
                  </div>
                </article>

                <article className="card module-card">
                  <h3 className="section-title">Anexos</h3>
                  <form
                    className="grid"
                    onSubmit={(e) => {
                      e.preventDefault();
                      withSelectedApp(async () => {
                        await createAttachment(session.accessToken, {
                          appId: selectedAppId,
                          fileName: attachmentName,
                          mimeType: attachmentType,
                          sizeBytes: Number(attachmentSize)
                        });
                        setAttachmentName("");
                        notifyOk("Anexo (metadado) cadastrado.");
                      });
                    }}
                  >
                    <input className="input" placeholder="Nome do arquivo" value={attachmentName} onChange={(e) => setAttachmentName(e.target.value)} />
                    <input className="input" placeholder="MIME Type" value={attachmentType} onChange={(e) => setAttachmentType(e.target.value)} />
                    <input className="input" placeholder="Tamanho em bytes" value={attachmentSize} onChange={(e) => setAttachmentSize(e.target.value)} />
                    <button className="button">Adicionar</button>
                  </form>
                  <div className="rows">{detail.attachments.map((a) => <div className="row" key={a.id}>{a.fileName} · {a.mimeType} · {a.sizeBytes} bytes</div>)}{detail.attachments.length === 0 && <div className="row">Sem anexos</div>}</div>
                </article>
              </div>
            </>
          )}

          {success && <p className="success">{success}</p>}
          {error && <p className="error">{error}</p>}

          <h3 className="section-title" style={{ marginTop: 20 }}>Auditoria (últimos eventos)</h3>
          <div className="rows">
            {auditEvents.map((item, idx) => (
              <div className="row" key={idx}>{JSON.stringify(item)}</div>
            ))}
            {auditEvents.length === 0 && <div className="row">Sem eventos.</div>}
          </div>
        </section>
      </div>
      <div className="version-chip">{APP_VERSION}</div>
    </main>
  );
}
