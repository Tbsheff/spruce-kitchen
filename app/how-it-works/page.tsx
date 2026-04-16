import { ChefHat, Thermometer, Utensils } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button.tsx";
import { Footer } from "@/components/ui/footer.tsx";
import { Header } from "@/components/ui/header.tsx";

const processSteps = [
  {
    id: "01",
    title: "Choose Your Meals",
    description:
      "Browse our weekly menu of chef-crafted frozen meals and pick the box that fits your household.",
  },
  {
    id: "02",
    title: "We Prep Everything",
    description:
      "Our kitchen prepares each meal with real ingredients, portions it carefully, and freezes it at peak freshness.",
  },
  {
    id: "03",
    title: "Store, Heat, Enjoy",
    description:
      "Your box arrives frozen and ready to store, then goes from freezer to table in minutes when you need it.",
  },
];

const heatingMethods = [
  {
    icon: Thermometer,
    title: "Microwave",
    time: "3-5 minutes",
    description:
      "Remove from packaging, pierce film, and microwave on high. Let stand 1 minute before serving.",
  },
  {
    icon: Utensils,
    title: "Oven",
    time: "15-20 minutes",
    description:
      "Preheat oven to 375°F. Remove film, cover with foil, and bake. Remove foil for last 5 minutes.",
  },
];

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main>
        <section className="px-4 pt-24 pb-16">
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-orange-100 px-4 py-2 font-medium text-orange-700 text-sm dark:bg-orange-900/20 dark:text-orange-300">
              <ChefHat className="h-4 w-4" />
              Simple Process
            </div>
            <h1 className="mb-6 font-bold text-4xl text-foreground md:text-6xl">
              How It Works
            </h1>
            <p className="mx-auto max-w-2xl text-muted-foreground text-xl">
              From selection to your table, we&apos;ve made getting delicious,
              nutritious meals as simple as possible.
            </p>
          </div>
        </section>

        <section className="bg-background py-20">
          <div className="container mx-auto px-6 lg:px-12">
            <div className="grid gap-8 md:grid-cols-3">
              {processSteps.map((step) => (
                <article
                  className="rounded-2xl border border-border/60 bg-card p-8"
                  key={step.id}
                >
                  <div className="font-semibold text-accent text-sm tracking-[0.3em] uppercase">
                    {step.id}
                  </div>
                  <h2 className="mt-4 font-semibold text-2xl text-foreground">
                    {step.title}
                  </h2>
                  <p className="mt-4 text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-muted/50 px-4 py-16">
          <div className="mx-auto max-w-4xl">
            <div className="mb-12 text-center">
              <h2 className="mb-4 font-bold text-3xl text-foreground">
                Simple Heating Instructions
              </h2>
              <p className="text-lg text-muted-foreground">
                Choose your preferred heating method for perfectly prepared
                meals every time.
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2">
              {heatingMethods.map((method) => (
                <div className="rounded-xl border bg-background p-6" key={method.title}>
                  <div className="mb-4 flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/20">
                      <method.icon className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground text-xl">
                        {method.title}
                      </h3>
                      <p className="font-medium text-orange-600 dark:text-orange-400">
                        {method.time}
                      </p>
                    </div>
                  </div>
                  <p className="text-muted-foreground">{method.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-4 py-16">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="mb-4 font-bold text-3xl text-foreground">
              Ready to Get Started?
            </h2>
            <p className="mb-8 text-lg text-muted-foreground">
              Join thousands of families who have simplified their dinner
              routine with Spruce Kitchen Meals.
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <Button asChild className="bg-primary hover:bg-primary/90" size="lg">
                <Link href="/menu">View Weekly Menu</Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link href="/onboarding">Build Your Box</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
