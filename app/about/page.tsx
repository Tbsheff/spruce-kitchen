import { Header } from "@/components/ui/header"
import { Footer } from "@/components/ui/footer"
import { Button } from "@/components/ui/button"
import { ChefHat, Heart, Leaf } from "lucide-react"
import Link from "next/link"

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-20">
        {/* Hero Section */}
        <section className="py-16 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">Our Story</h1>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Founded by nutrition experts and passionate chefs, Spruce Kitchen Meals was born from a simple belief:
              everyone deserves access to wholesome, delicious meals without the hassle.
            </p>
            <div className="relative h-64 md:h-96 rounded-2xl overflow-hidden bg-muted">
              <img
                src="/placeholder.svg?height=400&width=800"
                alt="Spruce Kitchen team preparing meals"
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="py-16 px-4 bg-muted/30">
          <div className="max-w-6xl mx-auto">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold mb-6">Our Mission</h2>
                <p className="text-lg text-muted-foreground mb-6">
                  We're on a mission to make nutritious, chef-crafted meals accessible to busy families everywhere. By
                  combining the expertise of registered dietitians with the creativity of professional chefs, we create
                  meals that nourish both body and soul.
                </p>
                <p className="text-lg text-muted-foreground">
                  Every meal is thoughtfully designed with real ingredients, balanced nutrition, and incredible flavor
                  that brings families together around the dinner table.
                </p>
              </div>
              <div className="relative h-80 rounded-2xl overflow-hidden bg-muted">
                <img
                  src="/placeholder.svg?height=320&width=480"
                  alt="Family enjoying Spruce Kitchen meals"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">What We Stand For</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Leaf className="h-8 w-8 text-orange-600" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Real Ingredients</h3>
                <p className="text-muted-foreground">
                  We source the finest ingredients from trusted suppliers, ensuring every meal is made with wholesome,
                  real food you can feel good about serving your family.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ChefHat className="h-8 w-8 text-orange-600" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Chef Expertise</h3>
                <p className="text-muted-foreground">
                  Our culinary team brings restaurant-quality techniques to home cooking, creating meals that are both
                  nutritious and incredibly delicious.
                </p>
              </div>
              <div className="text-center">
                <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Heart className="h-8 w-8 text-orange-600" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Family First</h3>
                <p className="text-muted-foreground">
                  Every decision we make is guided by what's best for families - from nutrition and taste to convenience
                  and affordability.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-16 px-4 bg-muted/30">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Meet Our Team</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-32 h-32 bg-muted rounded-full mx-auto mb-4 overflow-hidden">
                  <img
                    src="/placeholder.svg?height=128&width=128"
                    alt="Sarah Chen, Head Chef"
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="text-xl font-semibold mb-2">Sarah Chen</h3>
                <p className="text-orange-600 font-medium mb-2">Head Chef</p>
                <p className="text-sm text-muted-foreground">
                  15+ years in fine dining, passionate about creating healthy comfort food that families love.
                </p>
              </div>
              <div className="text-center">
                <div className="w-32 h-32 bg-muted rounded-full mx-auto mb-4 overflow-hidden">
                  <img
                    src="/placeholder.svg?height=128&width=128"
                    alt="Dr. Michael Rodriguez, Lead Nutritionist"
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="text-xl font-semibold mb-2">Dr. Michael Rodriguez</h3>
                <p className="text-orange-600 font-medium mb-2">Lead Nutritionist</p>
                <p className="text-sm text-muted-foreground">
                  Registered dietitian specializing in family nutrition and sustainable eating habits.
                </p>
              </div>
              <div className="text-center">
                <div className="w-32 h-32 bg-muted rounded-full mx-auto mb-4 overflow-hidden">
                  <img
                    src="/placeholder.svg?height=128&width=128"
                    alt="Emma Thompson, Operations Director"
                    className="w-full h-full object-cover"
                  />
                </div>
                <h3 className="text-xl font-semibold mb-2">Emma Thompson</h3>
                <p className="text-orange-600 font-medium mb-2">Operations Director</p>
                <p className="text-sm text-muted-foreground">
                  Ensures every meal meets our quality standards and reaches families fresh and on time.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">Our Impact</h2>
            <div className="grid md:grid-cols-4 gap-8 text-center">
              <div>
                <div className="text-3xl md:text-4xl font-bold text-orange-600 mb-2">50K+</div>
                <p className="text-muted-foreground">Families Served</p>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold text-orange-600 mb-2">2M+</div>
                <p className="text-muted-foreground">Meals Delivered</p>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold text-orange-600 mb-2">4.8★</div>
                <p className="text-muted-foreground">Average Rating</p>
              </div>
              <div>
                <div className="text-3xl md:text-4xl font-bold text-orange-600 mb-2">98%</div>
                <p className="text-muted-foreground">Customer Satisfaction</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 px-4 bg-orange-50 dark:bg-orange-950/20">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Join Our Family?</h2>
            <p className="text-xl text-muted-foreground mb-8">
              Experience the difference that chef-crafted, nutritionist-approved meals can make for your family.
            </p>
            <Link href="/onboarding">
              <Button size="lg" className="bg-primary hover:bg-primary/90">
                Start Your Journey
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
