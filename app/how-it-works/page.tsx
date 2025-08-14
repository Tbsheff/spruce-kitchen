"use client"

import { motion } from "framer-motion"
import { ChefHat, ShoppingCart, Truck, Clock, Thermometer, Utensils } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Header } from "@/components/ui/header"
import { Footer } from "@/components/ui/footer"
import { ParallaxSteps } from "@/components/ui/parallax-steps"

const steps = [
  {
    step: "01",
    title: "Choose Your Meals",
    content:
      "Browse our weekly menu of chef-crafted frozen meals. Select from comfort classics and exciting new dishes that your whole family will love.",
    image: "/placeholder.svg?height=500&width=600",
    icon: ShoppingCart,
  },
  {
    step: "02",
    title: "We Prepare Fresh",
    content:
      "Our experienced chefs prepare your meals using real, high-quality ingredients. Each dish is crafted with nutrition and flavor in mind.",
    image: "/placeholder.svg?height=500&width=600",
    icon: ChefHat,
  },
  {
    step: "03",
    title: "Delivered to Your Door",
    content:
      "Your meals arrive frozen and ready to store. Free delivery on orders over $50, with flexible scheduling that works for you.",
    image: "/placeholder.svg?height=500&width=600",
    icon: Truck,
  },
  {
    step: "04",
    title: "Ready in Minutes",
    content:
      "From freezer to table in as little as 15 minutes. Just heat, serve, and savor—no grocery lines, no meal prep stress.",
    image: "/placeholder.svg?height=500&width=600",
    icon: Clock,
  },
]

const heatingMethods = [
  {
    icon: Thermometer,
    title: "Microwave",
    time: "3-5 minutes",
    description: "Remove from packaging, pierce film, and microwave on high. Let stand 1 minute before serving.",
  },
  {
    icon: Utensils,
    title: "Oven",
    time: "15-20 minutes",
    description: "Preheat oven to 375°F. Remove film, cover with foil, and bake. Remove foil for last 5 minutes.",
  },
]

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="inline-flex items-center gap-2 bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 px-4 py-2 rounded-full text-sm font-medium mb-6">
              <ChefHat className="h-4 w-4" />
              Simple Process
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-6">How It Works</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              From selection to your table, we've made getting delicious, nutritious meals as simple as possible.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Steps Section */}
      <ParallaxSteps steps={steps} title="Your Journey to Better Meals" />

      {/* Heating Instructions */}
      <section className="py-16 px-4 bg-muted/50">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-foreground mb-4">Simple Heating Instructions</h2>
            <p className="text-lg text-muted-foreground">
              Choose your preferred heating method for perfectly prepared meals every time.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 gap-8">
            {heatingMethods.map((method, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-background rounded-xl p-6 border"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="flex items-center justify-center w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-full">
                    <method.icon className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-foreground">{method.title}</h3>
                    <p className="text-orange-600 dark:text-orange-400 font-medium">{method.time}</p>
                  </div>
                </div>
                <p className="text-muted-foreground">{method.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl font-bold text-foreground mb-4">Ready to Get Started?</h2>
            <p className="text-lg text-muted-foreground mb-8">
              Join thousands of families who have simplified their dinner routine with Spruce Kitchen Meals.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-primary hover:bg-primary/90">
                View Weekly Menu
              </Button>
              <Button size="lg" variant="outline">
                Build Your Box
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  )
}
