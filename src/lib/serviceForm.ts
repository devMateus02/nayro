// Formulário de serviço do painel: campos, limites e validação (usados na tela e na action)
import { SERVICE_ICONS } from "./services";

export const SERVICE_LIMITS = { name: 60, summary: 160, description: 320 };

export type ServiceFields = {
  name: string;
  summary: string;
  description: string;
  icon: string;
  featured: boolean;
  published: boolean;
};

export type ServiceErrors = Partial<Record<keyof ServiceFields, string>>;
export type ServiceFormState = { status: "idle" } | { status: "invalid"; errors: ServiceErrors; message?: string };

export function validateService(v: ServiceFields): ServiceErrors {
  const errors: ServiceErrors = {};
  if (v.name.length < 2) errors.name = "Dê um nome ao serviço.";
  else if (v.name.length > SERVICE_LIMITS.name) errors.name = `Use até ${SERVICE_LIMITS.name} caracteres.`;
  if (v.summary.length < 10) errors.summary = "Escreva um resumo de pelo menos 10 caracteres.";
  else if (v.summary.length > SERVICE_LIMITS.summary) errors.summary = `Use até ${SERVICE_LIMITS.summary} caracteres.`;
  if (v.description.length > SERVICE_LIMITS.description) errors.description = `Use até ${SERVICE_LIMITS.description} caracteres.`;
  if (!SERVICE_ICONS.some((i) => i.id === v.icon)) errors.icon = "Escolha um ícone.";
  return errors;
}
