// Formulário de contato: campos, limites e a mensagem montada para o WhatsApp

export const PROJECT_TYPES = ["Site ou landing page", "Sistema web", "Aplicativo", "E-commerce", "Outro"] as const;

export const LIMITS = {
  name: { min: 2, max: 80 },
  company: { max: 80 },
  message: { min: 10, max: 2000 },
};

export type ContactFields = {
  name: string;
  company: string;
  projectType: string;
  message: string;
};

export type ContactErrors = Partial<Record<keyof ContactFields, string>>;

export const EMPTY_FIELDS: ContactFields = { name: "", company: "", projectType: "", message: "" };

/** Confere os campos; devolve as mensagens de erro por campo (vazio = tudo certo) */
export function validateContact(v: ContactFields): ContactErrors {
  const errors: ContactErrors = {};
  if (v.name.length < LIMITS.name.min) errors.name = "Conte como podemos te chamar.";
  else if (v.name.length > LIMITS.name.max) errors.name = `Use até ${LIMITS.name.max} caracteres.`;
  if (v.company.length > LIMITS.company.max) errors.company = `Use até ${LIMITS.company.max} caracteres.`;
  if (v.projectType && !(PROJECT_TYPES as readonly string[]).includes(v.projectType)) errors.projectType = "Escolha uma das opções.";
  if (v.message.length < LIMITS.message.min) errors.message = "Conte um pouco mais sobre o seu projeto.";
  else if (v.message.length > LIMITS.message.max) errors.message = `Use até ${LIMITS.message.max} caracteres.`;
  return errors;
}

/** Mensagem pronta para o WhatsApp, com o que a pessoa escreveu no formulário */
export function whatsappMessage(v: ContactFields) {
  const lines = [
    `Nome: ${v.name}`,
    v.company ? `Empresa: ${v.company}` : null,
    v.projectType ? `Tipo de projeto: ${v.projectType}` : null,
  ];
  return `Olá! Vim pelo site da NAYRO.\n\n${lines.filter(Boolean).join("\n")}\n\n${v.message}`;
}
