import { Metadata } from "next";
import { Separator } from "@/components/ui/separator";
import { HeroPeek, HeroSlide, HeroTabs } from "@/components/sanity/hero-mobile";

export const metadata: Metadata = {
  title: "Hero na mobile — propozycje | tonik",
  robots: { index: false, follow: false },
};

const variants = [
  {
    key: "A",
    name: "Zakładki",
    C: HeroTabs,
    note: "U góry trzy zakładki 01 Ask / 02 Build / 03 Review, każda z linią postępu. Pod nimi jeden panel, który przenika się przy zmianie kroku. Tapnięcie zakładki przeskakuje do kroku.",
  },
  {
    key: "B",
    name: "Przesuwanie",
    C: HeroSlide,
    note: "Jedna ramka, panele wjeżdżają z prawej do lewej. Pod spodem trzy segmenty postępu (jak w stories) i podpis kroku. Można przesunąć palcem albo tapnąć segment.",
  },
  {
    key: "C",
    name: "Karuzela z podglądem",
    C: HeroPeek,
    note: "Natywne przewijanie z przyciąganiem: aktywna karta zajmuje 85% szerokości, następna wystaje z prawej, więc widać, że jest ciąg dalszy. Przesuwa się sama, można też przewinąć palcem.",
  },
];

export default function HeroMobilePage() {
  return (
    <div className="flex min-h-screen w-full justify-center bg-off-black px-6 py-20 text-off-white">
      <div className="flex w-full max-w-container-6xl flex-col gap-16">
        <div className="flex flex-col gap-3">
          <Separator />
          <p className="font-mono text-sm uppercase leading-none tracking-tight">Hero na mobile — trzy propozycje</p>
        </div>
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-3 lg:gap-10">
          {variants.map(({ key, name, C, note }) => (
            <div key={key} className="flex flex-col gap-6">
              <p className="font-mono text-sm uppercase leading-none tracking-tight">{key} · {name}</p>
              {/* phone-width frame with the page's 24px gutter */}
              <div className="w-full max-w-[375px] overflow-hidden border border-dark-grey px-6 py-8">
                <C />
              </div>
              <p className="max-w-[375px] text-base leading-6 text-off-white-light">{note}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
