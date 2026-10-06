import { Metadata } from "next";
import { Separator } from "@/components/ui/separator";
import { ReviewApprove, ReviewGrid, ReviewText, VariantPlayer } from "@/components/sanity/review-variants";

export const metadata: Metadata = {
  title: "Review — warianty | tonik",
  robots: { index: false, follow: false },
};

const variants = [
  {
    key: "A",
    name: "Text",
    Panel: ReviewText,
    dur: 6.8,
    note: "Strona wygląda jak prawdziwa strona: dwulinijkowy nagłówek, akapity, teksty na kartach. Wszystkie linie w jednym kolorze, hierarchia tylko przez grubość. Człowiek przepisuje nagłówek, przeciąga czwartą kartę na początek i przełącza stronę na LIVE.",
  },
  {
    key: "B",
    name: "Grid",
    Panel: ReviewGrid,
    dur: 7.2,
    note: "Strona zostaje w kwadratach, tak jak panel 02 i filmy Vibe Fixera. Zero „tekstu”. Nagłówek zmienia się przez szum danych, który się uspokaja, rząd logotypów jest przeciągany pod karty, a przejście na LIVE rozjaśnia wszystkie kratki.",
  },
  {
    key: "C",
    name: "Approve",
    Panel: ReviewApprove,
    dur: 7.4,
    note: "Wykorzystuje zasadę strony: szkic AI jest przerywany, decyzja człowieka — pełna. Kursor przechodzi po stronie i zatwierdza blok po bloku (po drodze skraca nagłówek i przenosi kartę), dopiero potem przełącza na LIVE.",
  },
];

export default function ReviewVariantsPage() {
  return (
    <div className="flex min-h-screen w-full justify-center bg-off-black px-6 py-20 text-off-white">
      <div className="flex w-full max-w-container-6xl flex-col gap-16">
        <div className="flex flex-col gap-3">
          <Separator />
          <p className="font-mono text-sm uppercase leading-none tracking-tight">Hero · 03 Review — trzy kierunki</p>
        </div>
        <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
          {variants.map((v) => (
            <div key={v.key} className="flex flex-col gap-5">
              <VariantPlayer Panel={v.Panel} dur={v.dur} />
              <div className="h-px w-full bg-dark-grey" />
              <p className="font-mono text-sm uppercase leading-none tracking-tight">
                {v.key} · {v.name}
              </p>
              <p className="text-base leading-6 text-off-white-light">{v.note}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
