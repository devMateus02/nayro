// Carga inicial: grava no banco os serviços que o site já apresentava.
// Rodar com `npm run db:seed`. Só grava se a tabela de serviços estiver vazia.
import { existsSync } from "node:fs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

if (existsSync(".env")) process.loadEnvFile(".env");

const db = new PrismaClient({ adapter: new PrismaPg({ connectionString: process.env.DIRECT_URL ?? process.env.DATABASE_URL }) });

const SERVICES = [
  {
    name: "Desenvolvimento Web",
    summary: "Sites, landing pages e sistemas web personalizados.",
    description: "Criamos sites e plataformas web modernas, rápidas e estratégicas, com foco em performance e resultados.",
    icon: "code",
    featured: true,
  },
  {
    name: "Sistemas Personalizados",
    summary: "Plataformas sob medida para as necessidades do seu negócio.",
    description: "Desenvolvemos sistemas sob medida para organizar processos, centralizar dados e acompanhar o crescimento do seu negócio.",
    icon: "layers",
    featured: true,
  },
  {
    name: "Automações e Integrações",
    summary: "Ferramentas conectadas e tarefas repetitivas no automático.",
    description: "Conectamos suas ferramentas e automatizamos tarefas repetitivas para sua equipe ganhar tempo e errar menos.",
    icon: "bolt",
    featured: true,
  },
  {
    name: "Soluções para E-commerce",
    summary: "Lojas virtuais completas, seguras e preparadas para vender.",
    description: "Lojas virtuais completas, integradas a pagamentos, estoque e logística, prontas para vender mais.",
    icon: "bag",
    featured: true,
  },
  {
    name: "Aplicativos Mobile",
    summary: "Apps modernos, intuitivos e focados na experiência do usuário.",
    description: "",
    icon: "phone",
    featured: false,
  },
  {
    name: "Sites em WordPress",
    summary: "Sites profissionais, gerenciáveis e com alta performance.",
    description: "",
    icon: "wordpress",
    featured: false,
  },
  {
    name: "Suporte e Evolução",
    summary: "Acompanhamento, melhorias e novas funcionalidades.",
    description: "",
    icon: "headset",
    featured: false,
  },
];

async function main() {
  if (await db.service.count()) {
    console.log("Serviços: a tabela já tem dados, nada foi alterado.");
    return;
  }
  await db.service.createMany({ data: SERVICES.map((service, position) => ({ ...service, position })) });
  console.log(`Serviços criados: ${SERVICES.length}`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
