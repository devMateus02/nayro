import PageHero from "../PageHero";
import { BoltIcon, ShieldCheckIcon, TargetIcon, UsersIcon } from "../icons";

const features = [
  { label: "Soluções sob medida", icon: BoltIcon },
  { label: "Foco em performance", icon: TargetIcon },
  { label: "Parceria de verdade", icon: UsersIcon },
  { label: "Tecnologia com propósito", icon: ShieldCheckIcon },
];

/** Topo da página de serviços: foto do escritório à direita, chamada e botões à esquerda e a faixa de diferenciais */
export default function ServicosHero() {
  return (
    <PageHero
      eyebrow="Nossos serviços"
      lines={["Soluções digitais", "para o seu negócio", <span key="destaque" className="text-roxo-luminoso">crescer de verdade.</span>]}
      text="Desenvolvemos projetos sob medida, unindo tecnologia, design e estratégia para gerar resultados reais."
      image="/images/heroServico.webp"
    >
      {/* Faixa de diferenciais */}
      <div className="mx-auto w-full max-w-[1600px] px-6 md:px-12 lg:px-[6%]">
        <ul className="grid grid-cols-2 gap-y-6 pb-8 lg:grid-cols-4 lg:gap-y-0 lg:pb-10">
          {features.map(({ label, icon: Icon }, i) => (
            <li
              key={label}
              data-sh="feature"
              data-intro
              className={`flex items-center gap-3 font-poppins text-[13px] font-medium text-branco/90 lg:justify-center lg:text-[14px] ${
                i > 0 ? "lg:border-l lg:border-branco/10" : ""
              }`}
            >
              <Icon className="size-6 shrink-0 text-roxo-luminoso" />
              {label}
            </li>
          ))}
        </ul>
        <span data-sh="rule" data-intro aria-hidden className="block h-px w-full bg-branco/10" />
      </div>
    </PageHero>
  );
}
