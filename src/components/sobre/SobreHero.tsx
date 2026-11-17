import { ABOUT_SUMMARY, PILLARS } from "@/lib/content";
import PageHero from "../PageHero";
import { EyeIcon, GemIcon, TargetIcon } from "../icons";

const HERO_IMAGE = "/images/sobre-hero.webp";

const ICONS = [TargetIcon, EyeIcon, GemIcon];
const pillars = PILLARS.map((pillar, i) => ({ ...pillar, icon: ICONS[i] }));

/** Topo da página Sobre: apresentação da NAYRO e os cartões de missão, visão e valores */
export default function SobreHero() {
  return (
    <PageHero
      eyebrow="Sobre nós"
      lines={[
        <span key="titulo">
          Conheça a <span className="text-roxo-luminoso">NAYRO</span>
        </span>,
      ]}
      text={ABOUT_SUMMARY}
      image={HERO_IMAGE}
      imagePosition="58% center"
      photoLayout="top"
    >
      <div className="  w-full max-w-[1600px] px-6 pb-12 md:px-12 lg:px-[6%] lg:pb-16">
        <ul className="grid grid-cols-1 gap-5 md:grid-cols-3 lg:gap-6">
          {pillars.map(({ title, text, icon: Icon }) => (
            <li
              key={title}
              data-sh="feature"
              data-intro
              className="group flex gap-5 rounded-2xl md:flex-col md:gap-4 lg:flex-row lg:gap-5 border border-branco/10 bg-[#0e0c15]/75 p-6 backdrop-blur-md transition-[border-color,box-shadow] duration-500 hover:border-violeta/45 hover:shadow-[0_0_36px_rgba(112,41,217,0.18)] lg:p-7"
            >
              <Icon className="size-10 shrink-0 text-roxo-luminoso transition-[filter] duration-500 group-hover:drop-shadow-[0_0_10px_rgba(164,91,255,0.7)]" />
              <div>
                <h2 className="font-poppins text-lg font-semibold text-branco">{title}</h2>
                <p className="mt-1.5 text-[14px] leading-relaxed text-branco/70">{text}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </PageHero>
  );
}
