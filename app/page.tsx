import { Header } from "@/components/ui/header"
import { Hero } from "@/components/ui/animated-hero"
import { FeatureSection } from "@/components/ui/feature-section"
import { FaqSection } from "@/components/ui/faq-section"
import { Footer } from "@/components/ui/footer"

export default function Home() {
  const faqItems = [
    {
      question: "How long do the meals stay fresh?",
      answer:
        "Our frozen meals stay fresh for up to 6 months in your freezer. Each meal is flash-frozen to lock in nutrients and flavor, and comes with clear expiration dates for your peace of mind.",
    },
    {
      question: "How do I heat up the meals?",
      answer:
        "Simply remove from freezer and heat in the microwave for 3-4 minutes or in the oven for 15-20 minutes. Each meal comes with detailed heating instructions for best results.",
    },
    {
      question: "Can I customize my meal plan?",
      answer:
        "You can choose from our weekly rotating menu, skip weeks when needed, and adjust your delivery frequency. We also offer vegetarian, gluten-free, and other dietary options.",
    },
    {
      question: "What's your delivery area?",
      answer:
        "We currently deliver nationwide across the United States. Orders placed by Tuesday are delivered the following week. Free delivery on orders over $50.",
    },
    {
      question: "Can I cancel or pause my subscription?",
      answer:
        "Yes, you have complete flexibility. You can pause, skip, or cancel your subscription anytime through your account dashboard or by contacting our customer service team.",
    },
  ]

  return (
    <>
      <Header />
      <main>
        <Hero />
        <FeatureSection />
        <FaqSection
          title="Frequently Asked Questions"
          description="Everything you need to know about Spruce Kitchen Meals"
          items={faqItems}
          contactInfo={{
            title: "Still have questions?",
            description: "Our customer service team is here to help",
            buttonText: "Contact Support",
            onContact: () => console.log("Contact support clicked"),
          }}
        />
      </main>
      <Footer />
    </>
  )
}
