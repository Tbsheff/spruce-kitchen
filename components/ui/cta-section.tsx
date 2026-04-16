import { MoveRight } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button.tsx";

export function CtaSection() {
  return (
    <section className="relative overflow-hidden border-border/60 border-t bg-background py-32 lg:py-56">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="mx-auto max-w-5xl">
          <p className="font-semibold text-[10px] text-accent uppercase tracking-[0.4em]">
            Begin
          </p>

          <h2 className="mt-10 font-display font-medium text-[clamp(3rem,9vw,7rem)] text-foreground text-wrap-balance leading-[0.88] tracking-tight">
            Taste the <span className="text-accent italic">difference.</span>
          </h2>

          <div className="mt-16 grid gap-12 lg:mt-20 lg:grid-cols-12 lg:items-end lg:gap-16">
            <p className="max-w-[48ch] text-muted-foreground text-wrap-pretty text-xl leading-relaxed lg:col-span-6">
              Join the home cooks who've reclaimed their evenings. Build your
              first box in about a minute. Pause, skip, or cancel anytime.
            </p>

            <div className="flex flex-col items-start gap-8 lg:col-span-6 lg:items-end">
              <Button
                asChild
                className="h-16 bg-primary px-10 font-bold text-isabelline text-sm uppercase tracking-[0.2em] transition-transform duration-300 hover:-translate-y-0.5"
                size="lg"
              >
                <Link href="/onboarding">
                  Build your first box
                  <MoveRight className="ml-3 size-4" />
                </Link>
              </Button>

              <Link
                className="group inline-flex items-center gap-3 font-semibold text-[11px] text-muted-foreground uppercase tracking-[0.3em] transition-colors duration-300 hover:text-foreground"
                href="/menu"
              >
                Browse this week&apos;s menu
                <MoveRight className="size-3 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
