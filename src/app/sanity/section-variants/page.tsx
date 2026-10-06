import { Metadata } from "next";
import { Separator } from "@/components/ui/separator";
import { NeedPipeline, NeedSwitch, PricingRows, PricingTimeline, VariantBlock, WhereBranches, WhereStages } from "@/components/sanity/section-variants";

export const metadata: Metadata = {
  title: "Sekcje — warianty | tonik",
  robots: { index: false, follow: false },
};

const groups = [
  {
    label: "Where it can go",
    variants: [
      { k: "W1", name: "Rozgałęzienie", note: "Jeden pień od „Start with pages”, z którego po kolei zapalają się trzy gałęzie. Widać, że wszystko wyrasta z tego samego workflow.", C: WhereBranches },
      { k: "W2", name: "Etapy", note: "Linia biegnie z lewej do prawej: najpierw strony („Now”), potem kolejne rozszerzenia (+01, +02, +03). Czyta się jak plan rozwoju.", C: WhereStages },
    ],
  },
  {
    label: "What we need and what you get",
    variants: [
      { k: "N1", name: "Przepływ", note: "To, co dajecie, przepływa przez budowę (siatka kwadratów, jak w Vibe Fixerze) i wychodzi jako to, co dostajecie. Na mobile przepływ idzie z góry na dół.", C: NeedPipeline },
      { k: "N2", name: "Przełącznik", note: "Jeden panel z dwoma stanami, które same się przełączają co 5 s (z linią postępu); można też kliknąć. Mniej miejsca, jedna rzecz naraz.", C: NeedSwitch },
    ],
  },
  {
    label: "Ballpark pricing · $150/hour",
    variants: [
      { k: "P1", name: "Oś czasu", note: "Obie oferty na jednej osi od 24 godzin do 8 tygodni — skala pracy widoczna od razu, bez dwóch identycznych kart.", C: PricingTimeline },
      { k: "P2", name: "Cennik w wierszach", note: "Pełnej szerokości wiersze jak w cenniku: czas, nazwa, cena. Najechanie / tapnięcie rozwija opis i listę.", C: PricingRows },
    ],
  },
];

export default function SectionVariantsPage() {
  return (
    <div className="flex min-h-screen w-full justify-center bg-off-black px-6 py-20 text-off-white">
      <div className="flex w-full max-w-container-6xl flex-col gap-32">
        {groups.map((g) => (
          <section key={g.label} className="flex flex-col gap-20">
            <div className="flex flex-col gap-3">
              <Separator />
              <p className="font-mono text-sm uppercase leading-none tracking-tight">{g.label} — warianty</p>
            </div>
            {g.variants.map(({ k, name, note, C }) => (
              <VariantBlock key={k} k={k} name={name} note={note}>
                <C />
              </VariantBlock>
            ))}
          </section>
        ))}
      </div>
    </div>
  );
}
