import { useEffect, useMemo, useState } from "react";
import {
  createApp,
  createAttachment,
  createDomain,
  deleteHosting,
  createHosting,
  createIntegration,
  createSecret,
  createSubscription,
  createSystemUser,
  deleteSystemUser,
  deleteApp,
  getAppDetail,
  listAlerts,
  listApps,
  listAttachments,
  listAuditEvents,
  listSecrets,
  listSubscriptions,
  listSystemUsers,
  login,
  revealSecret,
  updateSystemUser,
  updateHosting,
  updateApp,
  type AlertRecord,
  type AppRecord,
  type AttachmentRecord,
  type DomainRecord,
  type HostingRecord,
  type IntegrationRecord,
  type LoginResponse,
  type SecretRecord,
  type SystemUserRecord,
  type SubscriptionRecord
} from "../lib/api";
import { BUILD_NUMBER, VERSION_LABEL } from "../generated/buildInfo";
import "./App.css";

type Session = LoginResponse | null;
type Theme = "light" | "dark";
type MenuSection = "dashboard" | "app" | "users" | "hosting" | "domain" | "integration" | "subscription" | "secret" | "attachment" | "audit";

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
  const [activeMenu, setActiveMenu] = useState<MenuSection>("dashboard");
  const [now, setNow] = useState<Date>(new Date());

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
  const [systemUsers, setSystemUsers] = useState<SystemUserRecord[]>([]);

  const [selectedAppId, setSelectedAppId] = useState("");
  const [detail, setDetail] = useState<AppDetailState | null>(null);
  const [revealedSecrets, setRevealedSecrets] = useState<Record<string, string>>({});

  const [newAppName, setNewAppName] = useState("");
  const [newCommercialName, setNewCommercialName] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [newAppOwner, setNewAppOwner] = useState("");
  const [newAppStatus, setNewAppStatus] = useState<"ativo" | "inativo">("ativo");
  const [newAppTags, setNewAppTags] = useState("");

  const [hostingProvider, setHostingProvider] = useState("");
  const [hostingIp, setHostingIp] = useState("");
  const [hostingType, setHostingType] = useState<"VPS" | "Provedor">("VPS");
  const [hostingRegion, setHostingRegion] = useState("");
  const [hostingNotes, setHostingNotes] = useState("");
  const [editingHostingId, setEditingHostingId] = useState("");

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
  const [editName, setEditName] = useState("");
  const [editCommercialName, setEditCommercialName] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editStatus, setEditStatus] = useState<"ativo" | "inativo">("ativo");
  const [editOwner, setEditOwner] = useState("");
  const [editTags, setEditTags] = useState("");

  const [newUserName, setNewUserName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserRole, setNewUserRole] = useState<"admin" | "editor" | "leitor">("leitor");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [editingUserId, setEditingUserId] = useState("");
  const [editUserName, setEditUserName] = useState("");
  const [editUserRole, setEditUserRole] = useState<"admin" | "editor" | "leitor">("leitor");
  const [editUserPassword, setEditUserPassword] = useState("");

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
      setSuccess("");
    } catch (err) {
      notifyError(err, "Erro inesperado no login");
      setSession(null);
      setApps([]);
      setAlerts([]);
      setAuditEvents([]);
      setSystemUsers([]);
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
    if (session.user.role === "leitor") {
      setError("Perfil leitor nao pode criar apps.");
      return;
    }
    if (!newAppName.trim() || !newCommercialName.trim()) {
      setError("Nome interno e nome comercial sao obrigatorios.");
      return;
    }

    setLoading(true);
    try {
      await createApp(session.accessToken, {
        name: newAppName.trim(),
        commercialName: newCommercialName.trim(),
        description: newDescription.trim() || undefined,
        status: newAppStatus,
        owner: newAppOwner.trim() || undefined,
        tags: newAppTags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean)
      });
      setNewAppName("");
      setNewCommercialName("");
      setNewDescription("");
      setNewAppOwner("");
      setNewAppStatus("ativo");
      setNewAppTags("");
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

  useEffect(() => {
    if (!detail?.app) return;

    setEditName(detail.app.name);
    setEditCommercialName(detail.app.commercialName);
    setEditDescription(detail.app.description ?? "");
    setEditStatus(detail.app.status);
    setEditOwner(detail.app.owner ?? "");
    setEditTags((detail.app.tags ?? []).join(", "));
  }, [detail?.app]);

  useEffect(() => {
    if (!session || activeMenu !== "users" || session.user.role !== "admin") return;
    listSystemUsers(session.accessToken)
      .then(setSystemUsers)
      .catch((err) => notifyError(err, "Falha ao carregar usuarios"));
  }, [activeMenu, session]);

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const alertsByApp = useMemo(() => {
    const map = new Map<string, AlertRecord[]>();
    for (const alert of alerts) {
      const current = map.get(alert.appId) ?? [];
      current.push(alert);
      map.set(alert.appId, current);
    }
    return map;
  }, [alerts]);

  const dashboardStats = useMemo(() => {
    const total = apps.length;
    const ativos = apps.filter((app) => app.status === "ativo").length;
    const inativos = apps.filter((app) => app.status === "inativo").length;

    const appsComAlertaAlta = new Set(alerts.filter((a) => a.severity === "alta").map((a) => a.appId)).size;
    const appsSemAlerta = apps.filter((app) => (alertsByApp.get(app.id) ?? []).length === 0).length;

    const emDesenvolvimento = apps.filter((app) => {
      const appAlerts = alertsByApp.get(app.id) ?? [];
      const hasSetupPending = appAlerts.some((a) =>
        ["MISSING_HOSTING", "MISSING_DOMAIN", "MISSING_INTEGRATION"].includes(a.code)
      );
      return hasSetupPending;
    }).length;

    return { total, ativos, inativos, emDesenvolvimento, appsComAlertaAlta, appsSemAlerta };
  }, [alerts, alertsByApp, apps]);

  const nowTime = useMemo(
    () =>
      now.toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit"
      }),
    [now]
  );

  const nowDate = useMemo(
    () =>
      now.toLocaleDateString("pt-BR", {
        weekday: "long",
        day: "2-digit",
        month: "2-digit",
        year: "numeric"
      }),
    [now]
  );

  const requiresSelectedApp = useMemo(
    () => ["hosting", "domain", "integration", "subscription", "secret", "attachment"].includes(activeMenu),
    [activeMenu]
  );

  async function handleUpdateSelectedApp(e: React.FormEvent) {
    e.preventDefault();
    if (!session || !selectedAppId) {
      setError("Selecione um app para editar.");
      return;
    }
    if (session.user.role === "leitor") {
      setError("Perfil leitor nao pode editar apps.");
      return;
    }

    setLoading(true);
    try {
      await updateApp(session.accessToken, selectedAppId, {
        name: editName,
        commercialName: editCommercialName,
        description: editDescription,
        status: editStatus,
        owner: editOwner.trim() || undefined,
        tags: editTags
          .split(",")
          .map((tag) => tag.trim())
          .filter(Boolean)
      });
      await Promise.all([refreshCoreData(session.accessToken, search), refreshDetail(selectedAppId, session.accessToken)]);
      notifyOk("App atualizado.");
    } catch (err) {
      notifyError(err, "Falha ao atualizar app");
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteSelectedApp() {
    if (!session || !selectedAppId) {
      setError("Selecione um app para excluir.");
      return;
    }
    if (session.user.role === "leitor") {
      setError("Perfil leitor nao pode excluir apps.");
      return;
    }

    if (!window.confirm("Deseja realmente excluir este app? Esta ação não pode ser desfeita.")) {
      return;
    }

    setLoading(true);
    try {
      await deleteApp(session.accessToken, selectedAppId);
      setSelectedAppId("");
      setDetail(null);
      await refreshCoreData(session.accessToken, search);
      notifyOk("App excluído.");
    } catch (err) {
      notifyError(err, "Falha ao excluir app");
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteHosting(hostingId: string) {
    if (!session || !selectedAppId) return;
    if (session.user.role === "leitor") {
      setError("Perfil leitor nao pode excluir hospedagem.");
      return;
    }
    if (!window.confirm("Deseja excluir esta hospedagem?")) return;

    setLoading(true);
    try {
      await deleteHosting(session.accessToken, hostingId);
      setEditingHostingId("");
      setHostingProvider("");
      setHostingIp("");
      setHostingType("VPS");
      setHostingRegion("");
      setHostingNotes("");
      await Promise.all([refreshCoreData(session.accessToken, search), refreshDetail(selectedAppId, session.accessToken)]);
      notifyOk("Hospedagem excluida.");
    } catch (err) {
      notifyError(err, "Falha ao excluir hospedagem");
    } finally {
      setLoading(false);
    }
  }

  function loadHostingForEdit(hosting: HostingRecord) {
    setEditingHostingId(hosting.id);
    setHostingProvider(hosting.provider);
    setHostingIp(hosting.ip);
    setHostingType(hosting.type);
    setHostingRegion(hosting.region ?? "");
    setHostingNotes(hosting.notes ?? "");
  }

  async function refreshUsers() {
    if (!session || session.user.role !== "admin") return;
    const users = await listSystemUsers(session.accessToken);
    setSystemUsers(users);
  }

  async function handleCreateUser(e: React.FormEvent) {
    e.preventDefault();
    if (!session || session.user.role !== "admin") return;
    setLoading(true);
    try {
      await createSystemUser(session.accessToken, {
        name: newUserName,
        email: newUserEmail,
        role: newUserRole,
        password: newUserPassword
      });
      setNewUserName("");
      setNewUserEmail("");
      setNewUserPassword("");
      setNewUserRole("leitor");
      await refreshUsers();
      notifyOk("Usuario criado.");
    } catch (err) {
      notifyError(err, "Falha ao criar usuario");
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdateUser(e: React.FormEvent) {
    e.preventDefault();
    if (!session || session.user.role !== "admin" || !editingUserId) return;
    setLoading(true);
    try {
      await updateSystemUser(session.accessToken, editingUserId, {
        name: editUserName,
        role: editUserRole,
        password: editUserPassword || undefined
      });
      setEditingUserId("");
      setEditUserName("");
      setEditUserRole("leitor");
      setEditUserPassword("");
      await refreshUsers();
      notifyOk("Usuario atualizado.");
    } catch (err) {
      notifyError(err, "Falha ao atualizar usuario");
    } finally {
      setLoading(false);
    }
  }

  async function handleDeleteUser(userId: string) {
    if (!session || session.user.role !== "admin") return;
    if (!window.confirm("Deseja realmente excluir este usuario?")) return;
    setLoading(true);
    try {
      await deleteSystemUser(session.accessToken, userId);
      if (editingUserId === userId) {
        setEditingUserId("");
        setEditUserName("");
        setEditUserRole("leitor");
        setEditUserPassword("");
      }
      await refreshUsers();
      notifyOk("Usuario excluido.");
    } catch (err) {
      notifyError(err, "Falha ao excluir usuario");
    } finally {
      setLoading(false);
    }
  }

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
        <div className="datetime-block">
          <div className="datetime-time">{nowTime}</div>
          <div className="datetime-date">{nowDate}</div>
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
          <h2 className="section-title">Menu</h2>
          <nav className="menu-list">
            <button type="button" className={`menu-link ${activeMenu === "dashboard" ? "active" : ""}`} onClick={() => setActiveMenu("dashboard")}>Dashboard</button>
            <button type="button" className={`menu-link ${activeMenu === "app" ? "active" : ""}`} onClick={() => setActiveMenu("app")}>Apps</button>
            <button type="button" className={`menu-link ${activeMenu === "users" ? "active" : ""}`} onClick={() => setActiveMenu("users")}>Usuarios</button>
            <button type="button" className={`menu-link ${activeMenu === "hosting" ? "active" : ""}`} onClick={() => setActiveMenu("hosting")}>Hospedagem</button>
            <button type="button" className={`menu-link ${activeMenu === "domain" ? "active" : ""}`} onClick={() => setActiveMenu("domain")}>Domínio</button>
            <button type="button" className={`menu-link ${activeMenu === "integration" ? "active" : ""}`} onClick={() => setActiveMenu("integration")}>Integrações</button>
            <button type="button" className={`menu-link ${activeMenu === "subscription" ? "active" : ""}`} onClick={() => setActiveMenu("subscription")}>Assinaturas</button>
            <button type="button" className={`menu-link ${activeMenu === "secret" ? "active" : ""}`} onClick={() => setActiveMenu("secret")}>Segredos</button>
            <button type="button" className={`menu-link ${activeMenu === "attachment" ? "active" : ""}`} onClick={() => setActiveMenu("attachment")}>Anexos</button>
            <button type="button" className={`menu-link ${activeMenu === "audit" ? "active" : ""}`} onClick={() => setActiveMenu("audit")}>Auditoria</button>
          </nav>

          <div className="version-chip sidebar-version">
            <div>Versao: {VERSION_LABEL}</div>
            <div>Build: {BUILD_NUMBER}</div>
          </div>
        </aside>

        <section className="card main">
          <article id="mod-dashboard" className={`card module-card ${activeMenu !== "dashboard" ? "hidden" : ""}`}>
            <h3 className="section-title">Dashboard</h3>
            <div className="stats-grid">
              <div className="stat-card">
                <span className="muted">Total de Apps</span>
                <strong>{dashboardStats.total}</strong>
              </div>
              <div className="stat-card">
                <span className="muted">Apps Ativos</span>
                <strong>{dashboardStats.ativos}</strong>
              </div>
              <div className="stat-card">
                <span className="muted">Apps Inativos</span>
                <strong>{dashboardStats.inativos}</strong>
              </div>
              <div className="stat-card">
                <span className="muted">Em Desenvolvimento</span>
                <strong>{dashboardStats.emDesenvolvimento}</strong>
              </div>
              <div className="stat-card">
                <span className="muted">Com Alerta Alto</span>
                <strong>{dashboardStats.appsComAlertaAlta}</strong>
              </div>
              <div className="stat-card">
                <span className="muted">Sem Alertas</span>
                <strong>{dashboardStats.appsSemAlerta}</strong>
              </div>
            </div>
          </article>

          <article id="mod-app" className={`card module-card ${activeMenu !== "app" ? "hidden" : ""}`}>
            <h3 className="section-title">Apps ({apps.length})</h3>
            {session.user.role === "leitor" && (
              <p className="muted">Perfil leitor possui acesso somente de visualizacao para apps.</p>
            )}
            <form className="grid" onSubmit={handleCreateApp}>
              <input className="input" placeholder="Nome interno" value={newAppName} onChange={(e) => setNewAppName(e.target.value)} />
              <input className="input" placeholder="Nome comercial" value={newCommercialName} onChange={(e) => setNewCommercialName(e.target.value)} />
              <input className="input" placeholder="Descrição" value={newDescription} onChange={(e) => setNewDescription(e.target.value)} />
              <input className="input" placeholder="Responsável técnico" value={newAppOwner} onChange={(e) => setNewAppOwner(e.target.value)} />
              <select className="select" value={newAppStatus} onChange={(e) => setNewAppStatus(e.target.value as "ativo" | "inativo")}>
                <option value="ativo">Ativo</option>
                <option value="inativo">Inativo</option>
              </select>
              <input
                className="input"
                placeholder="Tags (separadas por vírgula)"
                value={newAppTags}
                onChange={(e) => setNewAppTags(e.target.value)}
              />
              <button className="button" type="submit" disabled={loading || session.user.role === "leitor"}>Criar App</button>
            </form>

            <div className="app-list" style={{ marginTop: 12 }}>
              {apps.map((app) => {
                const appAlerts = alertsByApp.get(app.id) ?? [];
                return (
                  <button key={app.id} className={`app-item ${selectedAppId === app.id ? "active" : ""}`} onClick={() => setSelectedAppId(app.id)}>
                    <strong>{app.commercialName}</strong>
                    <div className="muted">{app.name}</div>
                    <div className="muted">Status: {app.status} {app.owner ? `· Resp.: ${app.owner}` : ""}</div>
                    {app.tags.length > 0 && <div className="muted">Tags: {app.tags.join(", ")}</div>}
                    <div className="muted">{appAlerts.length ? `${appAlerts.length} alerta(s)` : "Sem alertas"}</div>
                  </button>
                );
              })}
              {apps.length === 0 && <div className="muted">Nenhum app cadastrado.</div>}
            </div>

            {selectedAppId && detail && (
              <form className="grid" style={{ marginTop: 12 }} onSubmit={handleUpdateSelectedApp}>
                <input className="input" placeholder="Nome interno" value={editName} onChange={(e) => setEditName(e.target.value)} />
                <input className="input" placeholder="Nome comercial" value={editCommercialName} onChange={(e) => setEditCommercialName(e.target.value)} />
                <input className="input" placeholder="Descrição" value={editDescription} onChange={(e) => setEditDescription(e.target.value)} />
                <input className="input" placeholder="Responsável técnico" value={editOwner} onChange={(e) => setEditOwner(e.target.value)} />
                <select className="select" value={editStatus} onChange={(e) => setEditStatus(e.target.value as "ativo" | "inativo")}>
                  <option value="ativo">Ativo</option>
                  <option value="inativo">Inativo</option>
                </select>
                <input
                  className="input"
                  placeholder="Tags (separadas por vírgula)"
                  value={editTags}
                  onChange={(e) => setEditTags(e.target.value)}
                />
                <div className="action-row">
                  <button className="button" type="submit" disabled={loading || session.user.role === "leitor"}>Salvar alterações</button>
                  <button className="button secondary danger" type="button" disabled={loading || session.user.role === "leitor"} onClick={handleDeleteSelectedApp}>Excluir App</button>
                </div>
              </form>
            )}
          </article>

          <article className={`card module-card ${activeMenu !== "users" ? "hidden" : ""}`}>
            <h3 className="section-title">Usuarios do Sistema</h3>
            {session.user.role !== "admin" ? (
              <p className="muted">Apenas administradores podem gerenciar usuarios.</p>
            ) : (
              <>
                <form className="grid" onSubmit={handleCreateUser}>
                  <input className="input" placeholder="Nome" value={newUserName} onChange={(e) => setNewUserName(e.target.value)} />
                  <input className="input" placeholder="Email" value={newUserEmail} onChange={(e) => setNewUserEmail(e.target.value)} />
                  <select className="select" value={newUserRole} onChange={(e) => setNewUserRole(e.target.value as "admin" | "editor" | "leitor")}>
                    <option value="admin">Admin</option>
                    <option value="editor">Editor</option>
                    <option value="leitor">Leitor</option>
                  </select>
                  <input className="input" type="password" placeholder="Senha temporaria" value={newUserPassword} onChange={(e) => setNewUserPassword(e.target.value)} />
                  <button className="button" type="submit" disabled={loading}>Criar Usuario</button>
                </form>

                <div className="rows" style={{ marginTop: 12 }}>
                  {systemUsers.map((user) => (
                    <div className="row" key={user.id}>
                      <div>
                        <strong>{user.name}</strong> · {user.email} · {user.role}
                        <div className="muted">
                          {user.emailConfirmed ? "Email confirmado" : "Email pendente"} · Criado em {new Date(user.createdAt).toLocaleDateString("pt-BR")}
                        </div>
                      </div>
                      <div className="action-row" style={{ marginTop: 8 }}>
                        <button
                          className="button secondary"
                          onClick={() => {
                            setEditingUserId(user.id);
                            setEditUserName(user.name);
                            setEditUserRole(user.role);
                            setEditUserPassword("");
                          }}
                        >
                          Editar
                        </button>
                        <button
                          className="button secondary danger"
                          onClick={() => handleDeleteUser(user.id)}
                          disabled={session.user.id === user.id}
                        >
                          Excluir
                        </button>
                      </div>
                    </div>
                  ))}
                  {systemUsers.length === 0 && <div className="row">Nenhum usuario encontrado.</div>}
                </div>

                {editingUserId && (
                  <form className="grid" style={{ marginTop: 12 }} onSubmit={handleUpdateUser}>
                    <input className="input" placeholder="Nome" value={editUserName} onChange={(e) => setEditUserName(e.target.value)} />
                    <select className="select" value={editUserRole} onChange={(e) => setEditUserRole(e.target.value as "admin" | "editor" | "leitor")}>
                      <option value="admin">Admin</option>
                      <option value="editor">Editor</option>
                      <option value="leitor">Leitor</option>
                    </select>
                    <input className="input" type="password" placeholder="Nova senha (opcional)" value={editUserPassword} onChange={(e) => setEditUserPassword(e.target.value)} />
                    <div className="action-row">
                      <button className="button" type="submit" disabled={loading}>Salvar Usuario</button>
                      <button
                        type="button"
                        className="button secondary"
                        onClick={() => {
                          setEditingUserId("");
                          setEditUserName("");
                          setEditUserRole("leitor");
                          setEditUserPassword("");
                        }}
                      >
                        Cancelar
                      </button>
                    </div>
                  </form>
                )}
              </>
            )}
          </article>

          {requiresSelectedApp ? (!selectedAppId || !detail ? (
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
                <article id="mod-hosting" className={`card module-card ${activeMenu !== "hosting" ? "hidden" : ""}`}>
                  <h3 className="section-title">Hospedagem</h3>
                  <form
                    className="grid"
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (session.user.role === "leitor") {
                        setError("Perfil leitor nao pode alterar hospedagem.");
                        return;
                      }
                      if (!hostingProvider.trim() || !hostingIp.trim()) {
                        setError("Provedor e IP sao obrigatorios.");
                        return;
                      }
                      withSelectedApp(async () => {
                        if (editingHostingId) {
                          await updateHosting(session.accessToken, editingHostingId, {
                            provider: hostingProvider.trim(),
                            ip: hostingIp.trim(),
                            type: hostingType,
                            region: hostingRegion.trim() || undefined,
                            notes: hostingNotes.trim() || undefined
                          });
                        } else {
                          await createHosting(session.accessToken, {
                            appId: selectedAppId,
                            provider: hostingProvider.trim(),
                            ip: hostingIp.trim(),
                            type: hostingType,
                            region: hostingRegion.trim() || undefined,
                            notes: hostingNotes.trim() || undefined
                          });
                        }
                        setHostingProvider("");
                        setHostingIp("");
                        setHostingType("VPS");
                        setHostingRegion("");
                        setHostingNotes("");
                        setEditingHostingId("");
                        notifyOk(editingHostingId ? "Hospedagem atualizada." : "Hospedagem cadastrada.");
                      });
                    }}
                  >
                    <input className="input" placeholder="Provedor" value={hostingProvider} onChange={(e) => setHostingProvider(e.target.value)} />
                    <input className="input" placeholder="IP" value={hostingIp} onChange={(e) => setHostingIp(e.target.value)} />
                    <select className="select" value={hostingType} onChange={(e) => setHostingType(e.target.value as "VPS" | "Provedor")}> 
                      <option value="VPS">VPS</option>
                      <option value="Provedor">Provedor</option>
                    </select>
                    <input className="input" placeholder="Região (opcional)" value={hostingRegion} onChange={(e) => setHostingRegion(e.target.value)} />
                    <input className="input" placeholder="Observações (opcional)" value={hostingNotes} onChange={(e) => setHostingNotes(e.target.value)} />
                    <div className="action-row">
                      <button className="button" disabled={session.user.role === "leitor"}>
                        {editingHostingId ? "Salvar Hospedagem" : "Adicionar"}
                      </button>
                      {editingHostingId && (
                        <button
                          type="button"
                          className="button secondary"
                          onClick={() => {
                            setEditingHostingId("");
                            setHostingProvider("");
                            setHostingIp("");
                            setHostingType("VPS");
                            setHostingRegion("");
                            setHostingNotes("");
                          }}
                        >
                          Cancelar
                        </button>
                      )}
                    </div>
                  </form>
                  <div className="rows">
                    {detail.hostings.map((h) => (
                      <div className="row" key={h.id}>
                        <div>
                          {h.provider} · {h.ip} · {h.type}
                          {(h.region || h.notes) && (
                            <div className="muted">
                              {h.region ? `Região: ${h.region}` : ""} {h.region && h.notes ? "·" : ""} {h.notes ? `Obs: ${h.notes}` : ""}
                            </div>
                          )}
                        </div>
                        <div className="action-row" style={{ marginTop: 8 }}>
                          <button className="button secondary" onClick={() => loadHostingForEdit(h)} disabled={session.user.role === "leitor"}>
                            Editar
                          </button>
                          <button className="button secondary danger" onClick={() => handleDeleteHosting(h.id)} disabled={session.user.role === "leitor"}>
                            Excluir
                          </button>
                        </div>
                      </div>
                    ))}
                    {detail.hostings.length === 0 && <div className="row">Sem hospedagens</div>}
                  </div>
                </article>

                <article id="mod-domain" className={`card module-card ${activeMenu !== "domain" ? "hidden" : ""}`}>
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

                <article id="mod-integration" className={`card module-card ${activeMenu !== "integration" ? "hidden" : ""}`}>
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

                <article id="mod-subscription" className={`card module-card ${activeMenu !== "subscription" ? "hidden" : ""}`}>
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

                <article id="mod-secret" className={`card module-card ${activeMenu !== "secret" ? "hidden" : ""}`}>
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

                <article id="mod-attachment" className={`card module-card ${activeMenu !== "attachment" ? "hidden" : ""}`}>
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
          )) : null}

          {success && <p className="success">{success}</p>}
          {error && <p className="error">{error}</p>}

          {activeMenu === "audit" && (
            <>
              <h3 id="mod-audit" className="section-title" style={{ marginTop: 20 }}>Auditoria (últimos eventos)</h3>
              <div className="rows">
                {auditEvents.map((item, idx) => (
                  <div className="row" key={idx}>{JSON.stringify(item)}</div>
                ))}
                {auditEvents.length === 0 && <div className="row">Sem eventos.</div>}
              </div>
            </>
          )}
        </section>
      </div>
    </main>
  );
}
