"use client";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { Button } from "@/components/ui/button.tsx";

export function ManifestoSection() {
  const prefersReducedMotion = useReducedMotion();

  const textVariants = {
    hidden: { opacity: 0, y: prefersReducedMotion ? 0 : 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
  } satisfies Variants;

  return (
    <section className="flex flex-col items-center justify-center bg-isabelline px-6 py-24 text-center md:py-32 lg:py-48">
      <motion.div
        className="flex w-full max-w-3xl flex-col items-center gap-12 md:gap-16"
        initial="hidden"
        transition={{ staggerChildren: 0.2 }}
        viewport={{ once: true, margin: "-100px" }}
        whileInView="show"
      >
        <motion.p
          className="font-serif text-[clamp(1.5rem,4vw,2.5rem)] text-raisin/90 leading-tight"
          variants={textVariants}
        >
          We believe dinner should be simple.
        </motion.p>

        <motion.p
          className="font-serif text-[clamp(1.5rem,4vw,2.5rem)] text-raisin/90 leading-tight"
          variants={textVariants}
        >
          Not simple like a microwave burrito.
        </motion.p>

        <motion.p
          className="font-serif text-[clamp(1.5rem,4vw,2.5rem)] text-raisin/90 leading-tight"
          variants={textVariants}
        >
          Simple like someone who loves you made it.
        </motion.p>

        <motion.p
          className="mb-8 font-serif text-[clamp(1.5rem,4vw,2.5rem)] text-hookers leading-tight"
          variants={textVariants}
        >
          That&apos;s what Spruce Kitchen is.
        </motion.p>

        <motion.div
          className="mt-8 flex flex-col items-center gap-4 sm:flex-row"
          variants={textVariants}
        >
          <Button
            className="h-14 w-full rounded-md bg-[#DF894D] px-8 font-medium text-base text-white shadow-sm hover:bg-[#DF894D]/90 sm:w-auto"
            size="lg"
          >
            Build your box &rarr;
          </Button>
          <Button
            className="h-14 w-full rounded-md border-raisin/20 bg-transparent px-8 font-medium text-base text-raisin hover:bg-raisin/5 sm:w-auto"
            size="lg"
            variant="outline"
          >
            See the menu
          </Button>
        </motion.div>
      </motion.div>
    </section>
  );
}
