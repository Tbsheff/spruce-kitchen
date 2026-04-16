import { MoveRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button.tsx";

export function EditorialHero() {
  return (
    <section className="relative min-h-[85vh] overflow-hidden bg-isabelline pt-32 pb-24 selection:bg-primary/20 lg:pt-48 lg:pb-40">
      <div className="container relative z-10 mx-auto px-6 lg:px-12">
        <div className="grid gap-16 lg:grid-cols-12 lg:items-center lg:gap-16">
          <div className="flex flex-col items-center text-center lg:col-span-7 lg:items-start lg:text-left">
            <div>
              <span className="inline-block font-black text-[10px] text-accent/50 uppercase tracking-[0.6em] antialiased">
                Fine dining, paused.
              </span>
            </div>

            <h1 className="mt-10 font-display text-[clamp(3rem,8vw,6.75rem)] text-raisin text-wrap-balance leading-[0.85] tracking-tighter">
              Real food, <br />
              <span className="text-accent italic">
                ready when <br />
                you are.
              </span>
            </h1>

            <div className="mt-16 flex w-full flex-col gap-10 lg:mt-20">
              <p className="max-w-md text-muted-foreground/80 text-wrap-pretty text-xl leading-relaxed antialiased">
                Chef-crafted meals flash-frozen at their absolute prime. Your
                dinner, your schedule, no compromises.
              </p>

              <div className="flex flex-col gap-8">
                <div className="h-px w-24 bg-border" />

                <div className="flex flex-wrap items-center justify-center gap-10 lg:justify-start">
                  <Link
                    className="font-black text-[10px] text-accent uppercase tracking-[0.3em] transition-colors duration-500 hover:text-primary"
                    href="/menu"
                  >
                    Browse Menu
                  </Link>

                  <Button
                    asChild
                    className="h-16 bg-primary px-12 font-bold text-isabelline text-sm uppercase tracking-[0.2em] shadow-[0_20px_50px_-12px_rgba(226,132,65,0.2)] transition-transform duration-300 hover:-translate-y-1 hover:shadow-[0_25px_60px_-10px_rgba(226,132,65,0.3)]"
                    size="lg"
                  >
                    <Link href="/onboarding">
                      Get Started <MoveRight className="ml-4 size-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5">
            <div className="relative mx-auto w-full max-w-[480px] lg:max-w-none">
              <Image
                alt="A cream stoneware bowl of slow-cooked beef with carrots and thyme, a silver spoon resting in the bowl"
                className="h-auto w-full"
                height={1536}
                priority
                sizes="(min-width: 1024px) 42vw, 480px"
                src="/landing-shots/hero-floating-bowl-corrected.webp"
                style={{
                  maskImage:
                    "radial-gradient(ellipse 80% 80% at 50% 55%, black 75%, transparent 100%)",
                  WebkitMaskImage:
                    "radial-gradient(ellipse 80% 80% at 50% 55%, black 75%, transparent 100%)",
                }}
                width={1024}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="absolute -top-20 -right-20 size-[600px] rounded-full bg-primary/[0.03] blur-[120px]" />
    </section>
  );
}
