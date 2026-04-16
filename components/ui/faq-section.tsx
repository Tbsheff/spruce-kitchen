"use client"

import * as React from "react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { Plus } from "lucide-react"
import { cn } from "@/lib/utils"

interface FaqSectionProps {
  title: string
  description?: string
  items: { question: string; answer: string }[]
}

export function FaqSection({ title, description, items }: FaqSectionProps) {
  return (
    <section className="bg-background py-32 lg:py-48">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="grid gap-16 lg:grid-cols-12 lg:items-start lg:gap-12">
          <div className="lg:col-span-5 lg:sticky lg:top-32">
            <p className="text-[10px] font-semibold uppercase tracking-[0.4em] text-accent">
              Questions
            </p>
            <h2 className="font-display mt-8 text-[clamp(2.5rem,5vw,4rem)] font-medium leading-[0.95] tracking-tight text-foreground text-wrap-balance">
              {title}
            </h2>
            {description && (
              <p className="mt-8 max-w-sm text-lg leading-relaxed text-muted-foreground text-wrap-pretty">
                {description}
              </p>
            )}

            <div className="mt-14 hidden lg:block">
              <div className="h-px w-12 bg-border" />
              <p className="mt-8 max-w-xs text-sm leading-relaxed text-muted-foreground">
                Still curious?{" "}
                <Link
                  href="/contact"
                  className="text-accent underline decoration-accent/30 underline-offset-4 transition-colors hover:decoration-accent"
                >
                  Write our kitchen
                </Link>
                .
              </p>
            </div>
          </div>

          <div className="lg:col-span-7 border-t border-border/60 lg:border-t-0">
            {items.map((item) => (
              <FaqItem key={item.question} question={item.question} answer={item.answer} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function FaqItem({ question, answer }: { question: string; answer: string }) {
  const [open, setOpen] = React.useState(false)

  return (
    <div className="group border-b border-border/60">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-start justify-between gap-8 py-7 text-left"
        aria-expanded={open}
      >
        <span className="font-display text-2xl font-medium tracking-tight text-foreground transition-colors duration-300 group-hover:text-accent">
          {question}
        </span>
        <motion.div
          animate={{ rotate: open ? 45 : 0 }}
          transition={{ type: "spring", stiffness: 350, damping: 25 }}
          className="mt-2 shrink-0"
        >
          <Plus
            className={cn(
              "size-5 text-muted-foreground/60 transition-colors duration-300",
              open && "text-accent",
            )}
            strokeWidth={1.5}
          />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="overflow-hidden"
          >
            <p className="max-w-xl pb-8 pr-12 text-base leading-relaxed text-muted-foreground text-wrap-pretty">
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
