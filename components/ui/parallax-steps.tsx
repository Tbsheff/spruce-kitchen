"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"

interface Step {
  step: string
  title: string
  content: string
  image: string
  icon: React.ComponentType<{ className?: string }>
}

interface ParallaxStepsProps {
  steps: Step[]
  className?: string
  title?: string
}

export function ParallaxSteps({ steps, className, title = "How It Works" }: ParallaxStepsProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [isMobile, setIsMobile] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return

      const containerRect = containerRef.current.getBoundingClientRect()
      const windowHeight = window.innerHeight

      if (isMobile) {
        const stepElements = containerRef.current.querySelectorAll("[data-step]")
        let activeStep = 0

        stepElements.forEach((element, index) => {
          const rect = element.getBoundingClientRect()
          if (rect.top <= windowHeight / 2 && rect.bottom >= windowHeight / 2) {
            activeStep = index
          }
        })

        setCurrentStep(activeStep)
      } else {
        // Desktop: Original sticky parallax logic
        if (containerRect.top <= 0 && containerRect.bottom > windowHeight) {
          const totalScrollDistance = containerRect.height - windowHeight
          const scrolledDistance = Math.abs(containerRect.top)
          const progress = Math.min(1, scrolledDistance / totalScrollDistance)

          const stepIndex = Math.floor(progress * steps.length)
          const clampedIndex = Math.max(0, Math.min(steps.length - 1, stepIndex))

          setCurrentStep(clampedIndex)
        } else if (containerRect.top > 0) {
          setCurrentStep(0)
        } else {
          setCurrentStep(steps.length - 1)
        }
      }
    }

    window.addEventListener("scroll", handleScroll, { passive: true })
    handleScroll()

    return () => window.removeEventListener("scroll", handleScroll)
  }, [steps.length, isMobile])

  if (isMobile) {
    return (
      <div ref={containerRef} className={cn("py-16", className)}>
        <div className="max-w-4xl mx-auto px-4">
          <motion.h2
            className="text-3xl font-bold mb-12 text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            {title}
          </motion.h2>

          <div className="space-y-16">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                data-step={index}
                className="space-y-6"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true, margin: "-100px" }}
              >
                {/* Step header */}
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-orange-600 text-white flex items-center justify-center flex-shrink-0">
                    <step.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold">{step.title}</h3>
                    <p className="text-sm text-muted-foreground">Step {index + 1}</p>
                  </div>
                </div>

                {/* Image */}
                <div className="h-48 rounded-xl overflow-hidden">
                  <img src={step.image || "/placeholder.svg"} alt={step.title} className="w-full h-full object-cover" />
                </div>

                {/* Content */}
                <p className="text-muted-foreground leading-relaxed">{step.content}</p>

                {/* Divider (except for last item) */}
                {index < steps.length - 1 && (
                  <div className="flex items-center gap-4 pt-8">
                    <div className="flex-1 h-px bg-border"></div>
                    <div className="w-2 h-2 rounded-full bg-orange-600"></div>
                    <div className="flex-1 h-px bg-border"></div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Desktop: Original sticky parallax layout
  return (
    <div ref={containerRef} className={cn("relative", className)} style={{ height: `${100 + steps.length * 100}vh` }}>
      <div className="h-screen flex items-center sticky top-0">
        <div className="max-w-7xl mx-auto px-4 w-full">
          <motion.h2
            className="text-4xl lg:text-5xl font-bold mb-16 text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            {title}
          </motion.h2>

          <div className="grid grid-cols-2 gap-16 items-center">
            {/* Steps List */}
            <div className="space-y-8">
              {steps.map((step, index) => (
                <motion.div
                  key={index}
                  className="flex items-start gap-6"
                  initial={{ opacity: 0.3, x: -20 }}
                  animate={{
                    opacity: index === currentStep ? 1 : 0.4,
                    x: index === currentStep ? 0 : -10,
                    scale: index === currentStep ? 1.02 : 1,
                  }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                >
                  <motion.div
                    className={cn(
                      "w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-500 flex-shrink-0",
                      index === currentStep
                        ? "bg-orange-600 border-orange-600 text-white shadow-lg shadow-orange-600/25"
                        : index < currentStep
                          ? "bg-orange-100 border-orange-300 text-orange-600"
                          : "bg-muted border-muted-foreground/30 text-muted-foreground",
                    )}
                    animate={{
                      scale: index === currentStep ? 1.1 : 1,
                    }}
                  >
                    {index < currentStep ? (
                      <span className="text-lg font-bold">✓</span>
                    ) : (
                      <step.icon className="h-5 w-5" />
                    )}
                  </motion.div>

                  <div className="flex-1 min-w-0">
                    <motion.div
                      animate={{
                        y: index === currentStep ? 0 : 10,
                      }}
                      transition={{ duration: 0.3 }}
                    >
                      <h3
                        className={cn(
                          "text-xl lg:text-2xl font-semibold mb-2 transition-colors duration-300",
                          index === currentStep ? "text-foreground" : "text-muted-foreground",
                        )}
                      >
                        {step.title}
                      </h3>
                      <p
                        className={cn(
                          "text-base transition-colors duration-300",
                          index === currentStep ? "text-muted-foreground" : "text-muted-foreground/60",
                        )}
                      >
                        {step.content}
                      </p>
                    </motion.div>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Image Display */}
            <div className="relative">
              <div className="h-[500px] rounded-2xl overflow-hidden">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentStep}
                    className="absolute inset-0 rounded-2xl overflow-hidden"
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -20, scale: 1.05 }}
                    transition={{ duration: 0.6, ease: "easeInOut" }}
                  >
                    <img
                      src={steps[currentStep].image || "/placeholder.svg"}
                      alt={steps[currentStep].title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />

                    <div className="absolute bottom-6 left-6 bg-white/90 backdrop-blur-sm rounded-full px-4 py-2">
                      <span className="text-sm font-medium text-gray-900">
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
  )
}
