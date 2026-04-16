import { ChefHat, Heart, Leaf } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button.tsx";
import { Footer } from "@/components/ui/footer.tsx";
import { Header } from "@/components/ui/header.tsx";

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-20">
        {/* Hero Section */}
        <section className="px-4 py-16">
          <div className="mx-auto max-w-4xl text-center">
            <h1 className="mb-6 font-bold text-4xl md:text-6xl">Our Story</h1>
            <p className="mx-auto mb-8 max-w-2xl text-muted-foreground text-xl">
              Founded by nutrition experts and passionate chefs, Spruce Kitchen
              Meals was born from a simple belief: everyone deserves access to
              wholesome, delicious meals without the hassle.
            </p>
            <div className="relative h-64 overflow-hidden rounded-2xl bg-muted md:h-96">
              <Image
                alt="Spruce Kitchen team preparing meals"
                className="object-cover"
                fill
                src="/placeholder.svg?height=400&width=800"
              />
            </div>
          </div>
        </section>

        {/* Mission Section */}
        <section className="bg-muted/30 px-4 py-16">
          <div className="mx-auto max-w-6xl">
            <div className="grid items-center gap-12 md:grid-cols-2">
              <div>
                <h2 className="mb-6 font-bold text-3xl md:text-4xl">
                  Our Mission
                </h2>
                <p className="mb-6 text-lg text-muted-foreground">
                  We're on a mission to make nutritious, chef-crafted meals
                  accessible to busy families everywhere. By combining the
                  expertise of registered dietitians with the creativity of
                  professional chefs, we create meals that nourish both body and
                  soul.
                </p>
                <p className="text-lg text-muted-foreground">
                  Every meal is thoughtfully designed with real ingredients,
                  balanced nutrition, and incredible flavor that brings families
                  together around the dinner table.
                </p>
              </div>
              <div className="relative h-80 overflow-hidden rounded-2xl bg-muted">
                <Image
                  alt="Family enjoying Spruce Kitchen meals"
                  className="object-cover"
                  fill
                  src="/placeholder.svg?height=320&width=480"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="px-4 py-16">
          <div className="mx-auto max-w-6xl">
            <h2 className="mb-12 text-center font-bold text-3xl md:text-4xl">
              What We Stand For
            </h2>
            <div className="grid gap-8 md:grid-cols-3">
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-orange-100">
                  <Leaf className="h-8 w-8 text-orange-600" />
                </div>
                <h3 className="mb-3 font-semibold text-xl">Real Ingredients</h3>
                <p className="text-muted-foreground">
                  We source the finest ingredients from trusted suppliers,
                  ensuring every meal is made with wholesome, real food you can
                  feel good about serving your family.
                </p>
              </div>
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-orange-100">
                  <ChefHat className="h-8 w-8 text-orange-600" />
                </div>
                <h3 className="mb-3 font-semibold text-xl">Chef Expertise</h3>
                <p className="text-muted-foreground">
                  Our culinary team brings restaurant-quality techniques to home
                  cooking, creating meals that are both nutritious and
                  incredibly delicious.
                </p>
              </div>
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-orange-100">
                  <Heart className="h-8 w-8 text-orange-600" />
                </div>
                <h3 className="mb-3 font-semibold text-xl">Family First</h3>
                <p className="text-muted-foreground">
                  Every decision we make is guided by what's best for families -
                  from nutrition and taste to convenience and affordability.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="bg-muted/30 px-4 py-16">
          <div className="mx-auto max-w-6xl">
            <h2 className="mb-12 text-center font-bold text-3xl md:text-4xl">
              Meet Our Team
            </h2>
            <div className="grid gap-8 md:grid-cols-3">
              <div className="text-center">
                <div className="mx-auto mb-4 h-32 w-32 overflow-hidden rounded-full bg-muted">
                  <Image
                    alt="Sarah Chen, Head Chef"
                    className="h-full w-full object-cover"
                    height={128}
                    src="/placeholder.svg?height=128&width=128"
                    width={128}
                  />
                </div>
                <h3 className="mb-2 font-semibold text-xl">Sarah Chen</h3>
                <p className="mb-2 font-medium text-orange-600">Head Chef</p>
                <p className="text-muted-foreground text-sm">
                  15+ years in fine dining, passionate about creating healthy
                  comfort food that families love.
                </p>
              </div>
              <div className="text-center">
                <div className="mx-auto mb-4 h-32 w-32 overflow-hidden rounded-full bg-muted">
                  <Image
                    alt="Dr. Michael Rodriguez, Lead Nutritionist"
                    className="h-full w-full object-cover"
                    height={128}
                    src="/placeholder.svg?height=128&width=128"
                    width={128}
                  />
                </div>
                <h3 className="mb-2 font-semibold text-xl">
                  Dr. Michael Rodriguez
                </h3>
                <p className="mb-2 font-medium text-orange-600">
                  Lead Nutritionist
                </p>
                <p className="text-muted-foreground text-sm">
                  Registered dietitian specializing in family nutrition and
                  sustainable eating habits.
                </p>
              </div>
              <div className="text-center">
                <div className="mx-auto mb-4 h-32 w-32 overflow-hidden rounded-full bg-muted">
                  <Image
                    alt="Emma Thompson, Operations Director"
                    className="h-full w-full object-cover"
                    height={128}
                    src="/placeholder.svg?height=128&width=128"
                    width={128}
                  />
                </div>
                <h3 className="mb-2 font-semibold text-xl">Emma Thompson</h3>
                <p className="mb-2 font-medium text-orange-600">
                  Operations Director
                </p>
                <p className="text-muted-foreground text-sm">
                  Ensures every meal meets our quality standards and reaches
                  families fresh and on time.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="px-4 py-16">
          <div className="mx-auto max-w-4xl">
            <h2 className="mb-12 text-center font-bold text-3xl md:text-4xl">
              Our Impact
            </h2>
            <div className="grid gap-8 text-center md:grid-cols-4">
              <div>
                <div className="mb-2 font-bold text-3xl text-orange-600 md:text-4xl">
                  50K+
                </div>
                <p className="text-muted-foreground">Families Served</p>
              </div>
              <div>
                <div className="mb-2 font-bold text-3xl text-orange-600 md:text-4xl">
                  2M+
                </div>
                <p className="text-muted-foreground">Meals Delivered</p>
              </div>
              <div>
                <div className="mb-2 font-bold text-3xl text-orange-600 md:text-4xl">
                  4.8★
                </div>
                <p className="text-muted-foreground">Average Rating</p>
              </div>
              <div>
                <div className="mb-2 font-bold text-3xl text-orange-600 md:text-4xl">
                  98%
                </div>
                <p className="text-muted-foreground">Customer Satisfaction</p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-orange-50 px-4 py-16 dark:bg-orange-950/20">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="mb-6 font-bold text-3xl md:text-4xl">
              Ready to Join Our Family?
            </h2>
            <p className="mb-8 text-muted-foreground text-xl">
              Experience the difference that chef-crafted, nutritionist-approved
              meals can make for your family.
            </p>
            <Link href="/onboarding">
              <Button className="bg-primary hover:bg-primary/90" size="lg">
                Start Your Journey
              </Button>
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
