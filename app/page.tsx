import { CtaSection } from "@/components/ui/cta-section"
import { EditorialHero } from "@/components/ui/editorial-hero"
import { FaqSection } from "@/components/ui/faq-section"
import { FeatureSection } from "@/components/ui/feature-section"
import { Footer } from "@/components/ui/footer"
import { Header } from "@/components/ui/header"
import { HowItWorks } from "@/components/ui/how-it-works"

const faqItems = [
  {
    question: "Do I need a specific kind of slow cooker?",
    answer:
      "Any standard slow cooker works — 4 to 8 quart, any brand. Our kits are sized for a 6-quart cooker by default, which is the most common, but each recipe card shows how to adjust for smaller or larger models.",
  },
  {
    question: "What if I don't have a slow cooker?",
    answer:
      "Every kit can also be cooked in a Dutch oven on the stovetop (2–3 hours on low) or in an Instant Pot on the slow-cook setting. Cooking instructions for all three methods come with each kit.",
  },
  {
    question: "Can the kit sit on warm if I'm home late?",
    answer:
      "Yes. Every recipe is written to hold on the warm setting for up to two hours after cooking without overcooking or drying out. You don't have to sprint home.",
  },
  {
    question: "How long do the kits stay fresh?",
    answer:
      "Flash-frozen kits keep for up to 6 months in your freezer. Each kit is flash-frozen within hours of being prepped, which locks in quality and is your food-safety guarantee for the raw ingredients inside.",
  },
  {
    question: "Can I customize my kits?",
    answer:
      "Choose from our weekly rotating menu, skip weeks when needed, and adjust delivery frequency. We offer vegetarian, gluten-free, dairy-free, and low-sodium options on every menu.",
  },
  {
    question: "What's your delivery area?",
    answer:
      "We deliver nationwide across the United States. Orders placed by Tuesday are delivered the following week. Free delivery on orders over $50.",
  },
  {
    question: "Can I cancel or pause my subscription?",
    answer:
      "Yes — pause, skip, or cancel anytime through your account dashboard. No contracts, no commitments.",
  },
]

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />

      <main className="flex-1">
        <EditorialHero />
        <HowItWorks />
        <FeatureSection />
        <FaqSection
          title="Frequently asked questions"
          description="Everything you need to know about Spruce Kitchen Meals."
          items={faqItems}
        />
        <CtaSection />
      </main>

      <Footer />
    </div>
  )
}
