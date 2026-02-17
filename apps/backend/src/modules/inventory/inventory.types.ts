export interface AppRecord {
  id: string;
  name: string;
  commercialName: string;
  description?: string;
  status: "ativo" | "inativo";
  tags: string[];
  owner?: string;
  createdAt: string;
  updatedAt: string;
}

export interface HostingRecord {
  id: string;
  appId: string;
  provider: string;
  ip: string;
  type: "VPS" | "Provedor";
  region?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DomainRecord {
  id: string;
  appId: string;
  domain: string;
  registrar: string;
  status: "ativo" | "expirado" | "pendente";
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AiIntegrationRecord {
  id: string;
  appId: string;
  provider: string;
  integrationName: string;
  scope?: string;
  secretRefId?: string;
  createdAt: string;
  updatedAt: string;
}
