"use client";

import { motion } from "framer-motion";
import { MoveRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button.tsx";

function Hero() {
  const [titleNumber, setTitleNumber] = useState(0);
  const titles = useMemo(
    () => ["delicious", "wholesome", "ready", "comforting", "affordable"],
    []
  );

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (titleNumber === titles.length - 1) {
        setTitleNumber(0);
      } else {
        setTitleNumber(titleNumber + 1);
      }
    }, 2000);
    return () => clearTimeout(timeoutId);
  }, [titleNumber, titles]);

  return (
    <div className="w-full bg-background">
      <div className="container mx-auto">
        <div className="grid items-center gap-12 py-20 lg:grid-cols-2 lg:py-40">
          {/* Left side - Content */}
          <div className="flex flex-col items-start gap-8">
            {/* Promo badge */}
            <div>
              <Button className="gap-2" size="sm" variant="secondary">
                Free delivery on orders over $50{" "}
                <MoveRight className="h-4 w-4" />
              </Button>
            </div>

            {/* Heading + rotating words */}
            <div className="flex flex-col items-start gap-6">
              <h1
                aria-live="polite"
                className="max-w-3xl text-left font-regular text-5xl text-foreground tracking-tighter md:text-7xl"
              >
                <span>Meals that are</span>
                <span className="relative inline-flex w-full justify-start overflow-hidden text-left md:pt-1 md:pb-4">
                  &nbsp;
                  {titles.map((title, index) => (
                    <motion.span
                      animate={
                        titleNumber === index
                          ? { y: 0, opacity: 1 }
                          : { y: titleNumber > index ? -150 : 150, opacity: 0 }
                      }
                      className="absolute font-semibold"
                      initial={{ opacity: 0, y: -100 }}
                      key={title}
                      transition={{ type: "spring", stiffness: 50 }}
                    >
                      {title}
                    </motion.span>
                  ))}
                </span>
              </h1>

              <p className="max-w-2xl text-left text-lg text-muted-foreground leading-relaxed tracking-tight md:text-xl">
                Spruce Kitchen Meals delivers chef-crafted, ready-to-cook
                freezer meals made with real ingredients. Skip the prep and
                enjoy restaurant-quality dinners at home in minutes.
              </p>
            </div>

            <div className="flex flex-row gap-3">
              <Button
                asChild
                className="gap-2 bg-transparent"
                size="lg"
                variant="outline"
              >
                <Link href="/menu">View Weekly Menu</Link>
              </Button>
              <Button
                asChild
                className="gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
                size="lg"
              >
                <Link href="/onboarding">
                  Build Your Box <MoveRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>

          <div className="flex justify-center lg:justify-end">
            <div className="relative">
              <Image
                alt="Delicious prepared meal"
                className="h-auto w-full max-w-lg rounded-2xl object-cover shadow-2xl"
                height={600}
                src="/placeholder.svg?height=600&width=500"
                width={500}
              />
              <div className="absolute -right-4 -bottom-4 -z-10 h-24 w-24 rounded-full bg-orange-500/20 dark:bg-orange-400/30" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export { Hero };
