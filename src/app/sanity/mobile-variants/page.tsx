import { Metadata } from "next";
import { Separator } from "@/components/ui/separator";
import { ExamplesCompact, ExamplesSwipe, ExamplesTabs, HowGrid, HowSwipe, HowTimeline } from "@/components/sanity/mobile-variants";

export const metadata: Metadata = {
  title: "Mobile — warianty | tonik",
  robots: { index: false, follow: false },
};

const groups = [
  {
    label: "How it works (D / U / G / P)",
    variants: [
      { k: "H1", name: "Oś", note: "Ikona z lewej, tekst z prawej. Między krokami linia: pełna przed krokiem człowieka, przerywana przed krokiem AI. Czyta się jak proces z góry na dół.", C: HowTimeline },
      { k: "H2", name: "Siatka 2 × 2", note: "Cztery zwarte kafelki, wszystkie kroki widać naraz na jednym ekranie.", C: HowGrid },
      { k: "H3", name: "Przesuwanie", note: "Jeden krok na kartę, następna wystaje z prawej; pod spodem segmenty postępu jak w hero.", C: HowSwipe },
    ],
  },
  {
    label: "Ask for everyday work (przykłady)",
    variants: [
      { k: "E1", name: "Kompakt", note: "Ta sama kolejność co na desktopie, ale ciaśniej: numer i nazwa, ilustracja, a tekst zaraz pod nią (bez dużej przerwy i bez przygaszania).", C: ExamplesCompact },
      { k: "E2", name: "Przesuwanie", note: "Cztery przykłady jako karty obok siebie; animacja gra na karcie, która jest na ekranie. Cała sekcja zajmuje jeden ekran.", C: ExamplesSwipe },
      { k: "E3", name: "Zakładki", note: "Cztery numerowane zakładki z linią postępu; jedna ilustracja i jeden opis naraz, przełącza się samo co 7 s albo po tapnięciu.", C: ExamplesTabs },
    ],
  },
];

export default function MobileVariantsPage() {
  return (
    <div className="flex min-h-screen w-full justify-center bg-off-black px-6 py-20 text-off-white">
      <div className="flex w-full max-w-container-6xl flex-col gap-32">
        {groups.map((g) => (
          <section key={g.label} className="flex flex-col gap-12">
            <div className="flex flex-col gap-3">
              <Separator />
              <p className="font-mono text-sm uppercase leading-none tracking-tight">{g.label} — mobile</p>
            </div>
            <div className="grid grid-cols-1 items-start gap-16 lg:grid-cols-3 lg:gap-8">
              {g.variants.map(({ k, name, note, C }) => (
                <div key={k} className="flex flex-col gap-6">
                  <p className="font-mono text-sm uppercase leading-none tracking-tight">{k} · {name}</p>
                  <p className="max-w-[375px] text-base leading-6 text-off-white-light">{note}</p>
                  {/* phone-width frame with the page's 24px gutter */}
                  <div className="w-full max-w-[375px] overflow-hidden border border-dark-grey px-6 py-10">
                    <C />
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
