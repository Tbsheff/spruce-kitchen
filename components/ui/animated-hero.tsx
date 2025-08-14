"use client"

import { useEffect, useMemo, useState } from "react"
import { motion } from "framer-motion"
import { MoveRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

function Hero() {
  const [titleNumber, setTitleNumber] = useState(0)
  const titles = useMemo(() => ["delicious", "wholesome", "ready", "comforting", "affordable"], [])

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (titleNumber === titles.length - 1) {
        setTitleNumber(0)
      } else {
        setTitleNumber(titleNumber + 1)
      }
    }, 2000)
    return () => clearTimeout(timeoutId)
  }, [titleNumber, titles])

  return (
    <div className="w-full bg-background">
      <div className="container mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 py-20 lg:py-40 items-center">
          {/* Left side - Content */}
          <div className="flex gap-8 flex-col items-start">
            {/* Promo badge */}
            <div>
              <Button variant="secondary" size="sm" className="gap-2">
                Free delivery on orders over $50 <MoveRight className="w-4 h-4" />
              </Button>
            </div>

            {/* Heading + rotating words */}
            <div className="flex gap-6 flex-col items-start">
              <h1
                className="text-5xl md:text-7xl max-w-3xl tracking-tighter text-left font-regular text-foreground"
                aria-live="polite"
              >
                <span>Meals that are</span>
                <span className="relative inline-flex w-full justify-start overflow-hidden text-left md:pb-4 md:pt-1">
                  &nbsp;
                  {titles.map((title, index) => (
                    <motion.span
                      key={index}
                      className="absolute font-semibold"
                      initial={{ opacity: 0, y: -100 }}
                      transition={{ type: "spring", stiffness: 50 }}
                      animate={
                        titleNumber === index
                          ? { y: 0, opacity: 1 }
                          : { y: titleNumber > index ? -150 : 150, opacity: 0 }
                      }
                    >
                      {title}
                    </motion.span>
                  ))}
                </span>
              </h1>

              <p className="text-lg md:text-xl leading-relaxed tracking-tight text-muted-foreground max-w-2xl text-left">
                Spruce Kitchen Meals delivers chef-crafted, ready-to-cook freezer meals made with real ingredients. Skip
                the prep and enjoy restaurant-quality dinners at home in minutes.
              </p>
            </div>

            <div className="flex flex-row gap-3">
              <Button size="lg" className="gap-2 bg-transparent" variant="outline" asChild>
                <Link href="/menu">View Weekly Menu</Link>
              </Button>
              <Button size="lg" className="gap-2 bg-primary hover:bg-primary/90 text-primary-foreground" asChild>
                <Link href="/onboarding">
                  Build Your Box <MoveRight className="w-4 h-4" />
                </Link>
              </Button>
            </div>
          </div>

          <div className="flex justify-center lg:justify-end">
            <div className="relative">
              <img
                src="/placeholder.svg?height=600&width=500"
                alt="Delicious prepared meal"
                className="rounded-2xl shadow-2xl w-full max-w-lg h-auto object-cover"
              />
              <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-orange-500/20 dark:bg-orange-400/30 rounded-full -z-10"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export { Hero }
