import Image from "next/image";

interface Step {
  description: string;
  detail: string;
  id: string;
  image?: { src: string; alt: string; aspect?: "portrait" | "landscape" };
  label: string;
  title: string;
}

const steps: Step[] = [
  {
    id: "01",
    label: "Browse",
    title: "Pick your meals",
    description:
      "Choose from a rotating menu of seasonal slow-cooker dishes. Set dietary preferences once — vegetarian, gluten-free, low-sodium — and we'll match you to meals that actually fit.",
    detail: "About a minute",
  },
  {
    id: "02",
    label: "Prep",
    title: "We prep & freeze",
    description:
      "Our chefs portion every ingredient by hand in small batches — protein, aromatics, herbs, spices — then flash-freeze the sealed kit so it arrives at your door ready to cook.",
    detail: "Fresh that week",
  },
  {
    id: "03",
    label: "Cook",
    title: "Dump it and go",
    description:
      "Empty the kit into your slow cooker before you leave in the morning. Come home to a house that smells like dinner, already cooked.",
    detail: "6–8 hands-off hours",
  },
];

export function HowItWorks() {
  return (
    <section className="bg-background py-32 lg:py-48">
      <div className="container mx-auto px-6 lg:px-12">
        <header className="grid gap-12 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <p className="font-semibold text-[10px] text-accent uppercase tracking-[0.4em]">
              The Process
            </p>
            <h2 className="mt-8 font-display font-medium text-[clamp(2.75rem,6vw,5rem)] text-foreground text-wrap-balance leading-[0.92] tracking-tight">
              From kit to table,{" "}
              <span className="text-accent italic">
                without you lifting a spoon.
              </span>
            </h2>
          </div>
          <p className="max-w-md text-lg text-muted-foreground text-wrap-pretty leading-relaxed lg:col-span-4 lg:col-start-9">
            Real slow-cooked meals without the prep. No chopping, no measuring,
            no cleanup — just dump the kit and get on with your day.
          </p>
        </header>

        <ol className="mt-28 lg:mt-36">
          {steps.map((step) => (
            <li
              className="grid gap-8 border-border/60 border-t pt-16 first:border-t-0 first:pt-0 lg:grid-cols-12 lg:gap-16 lg:pt-24 [&:not(:first-child)]:mt-16 lg:[&:not(:first-child)]:mt-24"
              key={step.id}
            >
              <div className="flex items-start gap-6 lg:col-span-3">
                <span className="font-display text-[5rem] text-accent italic leading-[0.8] lg:text-[6.5rem]">
                  {step.id}
                </span>
                <div className="hidden flex-col gap-3 pt-4 lg:flex">
                  <span className="h-px w-10 bg-border" />
                  <span className="font-semibold text-[10px] text-muted-foreground uppercase tracking-[0.3em]">
                    {step.label}
                  </span>
                </div>
              </div>

              <div
                className={
                  step.image
                    ? "lg:col-span-4 lg:col-start-5"
                    : "lg:col-span-6 lg:col-start-5"
                }
              >
                <h3 className="font-display font-medium text-3xl text-foreground text-wrap-balance tracking-tight lg:text-4xl">
                  {step.title}
                </h3>
                <p className="mt-6 max-w-[55ch] text-lg text-muted-foreground text-wrap-pretty leading-relaxed">
                  {step.description}
                </p>
                {step.image && (
                  <div className="mt-8 flex items-baseline gap-6">
                    <span className="font-semibold text-[10px] text-muted-foreground/70 uppercase tracking-[0.3em]">
                      Takes
                    </span>
                    <span className="font-display text-foreground text-xl italic">
                      {step.detail}
                    </span>
                  </div>
                )}
              </div>

              {!step.image && (
                <div className="lg:col-span-2 lg:col-start-11 lg:pt-4">
                  <span className="block font-semibold text-[10px] text-muted-foreground/70 uppercase tracking-[0.3em]">
                    Takes
                  </span>
                  <span className="mt-3 block font-display text-foreground text-xl italic">
                    {step.detail}
                  </span>
                </div>
              )}

              {step.image && (
                <div className="lg:col-span-4 lg:col-start-9">
                  <div
                    className={
                      step.image.aspect === "landscape"
                        ? "relative mx-auto aspect-[3/2] w-full max-w-[520px] overflow-hidden bg-background"
                        : "relative mx-auto aspect-[2/3] w-full max-w-[420px] overflow-hidden bg-background"
                    }
                  >
                    <Image
                      alt={step.image.alt}
                      className="object-cover"
                      fill
                      sizes={
                        step.image.aspect === "landscape"
                          ? "(min-width: 1024px) 520px, 100vw"
                          : "(min-width: 1024px) 420px, 100vw"
                      }
                      src={step.image.src}
                      style={{
                        maskImage:
                          "linear-gradient(to bottom, black 0%, black 94%, transparent 100%)",
                        WebkitMaskImage:
                          "linear-gradient(to bottom, black 0%, black 94%, transparent 100%)",
                      }}
                    />
                  </div>
                </div>
              )}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
