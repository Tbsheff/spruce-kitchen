const features = [
  {
    id: "01",
    name: "Chef-crafted recipes",
    description:
      "Every kit is built by experienced chefs around real ingredients — no shelf-stable sauces, no seasoning mystery packets, no shortcuts that would embarrass a home cook.",
  },
  {
    id: "02",
    name: "Flash-frozen raw",
    description:
      "We flash-freeze each sealed kit within hours of portioning. That's your food safety guarantee and the reason the kit holds its quality for months in your freezer.",
  },
  {
    id: "03",
    name: "Set it and forget it",
    description:
      "Empty the kit into your slow cooker, set the timer, and leave. Come home six to eight hours later to a dinner that's already done.",
  },
  {
    id: "04",
    name: "Delivered to your door",
    description:
      "Nationwide delivery in insulated, recyclable packaging. Order by Tuesday and your kits arrive the following week, still frozen.",
  },
]

export function FeatureSection() {
  return (
    <section className="relative bg-background py-24 lg:py-36 text-foreground overflow-hidden">
      <div className="container relative mx-auto px-6 lg:px-12">
        <div className="grid gap-10 lg:grid-cols-12 lg:gap-16 lg:items-end">
          <div className="lg:col-span-8">
            <p className="text-[10px] font-semibold uppercase tracking-[0.4em] text-accent">
              Our Philosophy
            </p>
            <h2 className="font-display mt-6 text-[clamp(2.5rem,6vw,4.75rem)] font-medium leading-[0.95] tracking-tight text-foreground text-wrap-balance">
              The ritual of real cooking. <br />
              <span className="italic text-accent">Without the labor.</span>
            </h2>
          </div>
          <div className="lg:col-span-4 lg:pb-3">
            <p className="text-xl leading-relaxed text-muted-foreground text-wrap-pretty">
              Slow-cooked food takes time, not effort. Every kit is prepped by hand with real ingredients so all you do is empty it into your slow cooker and come home to dinner.
            </p>
          </div>
        </div>

        <div className="mt-16 h-px w-full bg-border lg:mt-20" />

        <ul role="list" className="mt-14 grid gap-x-16 gap-y-16 sm:grid-cols-2 lg:mt-16">
          {features.map((feature) => (
            <li key={feature.id}>
              <div className="flex items-center gap-5">
                <span className="font-display text-2xl italic text-accent">
                  {feature.id}
                </span>
                <span className="h-px flex-1 bg-border" />
              </div>
              <h3 className="font-display mt-7 text-3xl font-medium tracking-tight text-foreground text-wrap-balance">
                {feature.name}
              </h3>
              <p className="mt-5 max-w-[44ch] text-base leading-relaxed text-muted-foreground text-wrap-pretty">
                {feature.description}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
