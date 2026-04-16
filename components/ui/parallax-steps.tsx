"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils.ts";

export interface ParallaxStep {
  content: string;
  icon: React.ComponentType<{ className?: string }>;
  image: string;
  step: string;
  title: string;
}

export interface ParallaxStepsProps {
  readonly className?: string;
  readonly steps: readonly ParallaxStep[];
  readonly title?: string;
}

export function ParallaxSteps({
  steps,
  className,
  title = "How It Works",
}: ParallaxStepsProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) {
        return;
      }

      const containerRect = containerRef.current.getBoundingClientRect();
      const windowHeight = window.innerHeight;

      if (isMobile) {
        const stepElements =
          containerRef.current.querySelectorAll("[data-step]");
        let activeStep = 0;

        stepElements.forEach((element, index) => {
          if (!(element instanceof HTMLElement)) {
            return;
          }
          const rect = element.getBoundingClientRect();
          if (rect.top <= windowHeight / 2 && rect.bottom >= windowHeight / 2) {
            activeStep = index;
          }
        });

        setCurrentStep(activeStep);
        // Desktop: Original sticky parallax logic
      } else if (containerRect.top <= 0 && containerRect.bottom > windowHeight) {
          const totalScrollDistance = containerRect.height - windowHeight;
          const scrolledDistance = Math.abs(containerRect.top);
          const progress = Math.min(1, scrolledDistance / totalScrollDistance);

          const stepIndex = Math.floor(progress * steps.length);
          const clampedIndex = Math.max(
            0,
            Math.min(steps.length - 1, stepIndex)
          );

          setCurrentStep(clampedIndex);
        } else if (containerRect.top > 0) {
          setCurrentStep(0);
        } else {
          setCurrentStep(steps.length - 1);
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener("scroll", handleScroll);
  }, [steps.length, isMobile]);

  if (isMobile) {
    return (
      <div className={cn("py-16", className)} ref={containerRef}>
        <div className="mx-auto max-w-4xl px-4">
          <motion.h2
            className="mb-12 text-center font-bold text-3xl"
            initial={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            whileInView={{ opacity: 1, y: 0 }}
          >
            {title}
          </motion.h2>

          <div className="space-y-16">
            {steps.map((step, index) => (
              <motion.div
                className="space-y-6"
                data-step={index}
                initial={{ opacity: 0, y: 30 }}
                key={step.title}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true, margin: "-100px" }}
                whileInView={{ opacity: 1, y: 0 }}
              >
                {/* Step header */}
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-orange-600 text-white">
                    <step.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-xl">{step.title}</h3>
                    <p className="text-muted-foreground text-sm">
                      Step {index + 1}
                    </p>
                  </div>
                </div>

                {/* Image */}
                <div className="relative h-48 overflow-hidden rounded-xl">
                  <Image
                    alt={step.title}
                    className="object-cover"
                    fill
                    src={step.image || "/placeholder.svg"}
                  />
                </div>

                {/* Content */}
                <p className="text-muted-foreground leading-relaxed">
                  {step.content}
                </p>

                {/* Divider (except for last item) */}
                {index < steps.length - 1 && (
                  <div className="flex items-center gap-4 pt-8">
                    <div className="h-px flex-1 bg-border" />
                    <div className="h-2 w-2 rounded-full bg-orange-600" />
                    <div className="h-px flex-1 bg-border" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Desktop: Original sticky parallax layout
  return (
    <div
      className={cn("relative", className)}
      ref={containerRef}
      style={{ height: `${100 + steps.length * 100}vh` }}
    >
      <div className="sticky top-0 flex h-screen items-center">
        <div className="mx-auto w-full max-w-7xl px-4">
          <motion.h2
            className="mb-16 text-center font-bold text-4xl lg:text-5xl"
            initial={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            whileInView={{ opacity: 1, y: 0 }}
          >
            {title}
          </motion.h2>

          <div className="grid grid-cols-2 items-center gap-16">
            {/* Steps List */}
            <div className="space-y-8">
              {steps.map((step, index) => {
                const circleClass =
                  index === currentStep
                    ? "border-orange-600 bg-orange-600 text-white shadow-lg shadow-orange-600/25"
                    : index < currentStep
                      ? "border-orange-300 bg-orange-100 text-orange-600"
                      : "border-muted-foreground/30 bg-muted text-muted-foreground";
                return (
                  <motion.div
                    animate={{
                      opacity: index === currentStep ? 1 : 0.4,
                      x: index === currentStep ? 0 : -10,
                      scale: index === currentStep ? 1.02 : 1,
                    }}
                    className="flex items-start gap-6"
                    initial={{ opacity: 0.3, x: -20 }}
                    key={step.title}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                  >
                    <motion.div
                      animate={{
                        scale: index === currentStep ? 1.1 : 1,
                      }}
                      className={cn(
                        "flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full border-2 transition-all duration-500",
                        circleClass
                      )}
                    >
                      {index < currentStep ? (
                        <span className="font-bold text-lg">✓</span>
                      ) : (
                        <step.icon className="h-5 w-5" />
                      )}
                    </motion.div>

                    <div className="min-w-0 flex-1">
                      <motion.div
                        animate={{
                          y: index === currentStep ? 0 : 10,
                        }}
                        transition={{ duration: 0.3 }}
                      >
                        <h3
                          className={cn(
                            "mb-2 font-semibold text-xl transition-colors duration-300 lg:text-2xl",
                            index === currentStep
                              ? "text-foreground"
                              : "text-muted-foreground"
                          )}
                        >
                          {step.title}
                        </h3>
                        <p
                          className={cn(
                            "text-base transition-colors duration-300",
                            index === currentStep
                              ? "text-muted-foreground"
                              : "text-muted-foreground/60"
                          )}
                        >
                          {step.content}
                        </p>
                      </motion.div>
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {/* Image Display */}
            <div className="relative">
              <div className="h-[500px] overflow-hidden rounded-2xl">
                <AnimatePresence mode="wait">
                  <motion.div
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    className="absolute inset-0 overflow-hidden rounded-2xl"
                    exit={{ opacity: 0, y: -20, scale: 1.05 }}
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    key={currentStep}
                    transition={{ duration: 0.6, ease: "easeInOut" }}
                  >
                    <Image
                      alt={steps[currentStep].title}
                      className="object-cover"
                      fill
                      src={steps[currentStep].image || "/placeholder.svg"}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />

                    <div className="absolute bottom-6 left-6 rounded-full bg-white/90 px-4 py-2 backdrop-blur-sm">
                      <span className="font-medium text-gray-900 text-sm">
                        Step {currentStep + 1} of {steps.length}
                      </span>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
