import { Clock, Mail, MapPin, Phone } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button.tsx";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx";
import Footer from "@/components/ui/footer.tsx";
import { Header } from "@/components/ui/header.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Textarea } from "@/components/ui/textarea.tsx";

export const metadata: Metadata = {
  title: "Contact Us - Spruce Kitchen Meals",
  description:
    "Get in touch with Spruce Kitchen Meals. We're here to help with your meal delivery questions and support.",
};

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="pt-20">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-primary/5 to-background py-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="mb-4 font-bold text-4xl text-foreground md:text-5xl">
              Contact Us
            </h1>
            <p className="mx-auto max-w-2xl text-muted-foreground text-xl">
              Have questions about our meals or need support? We're here to help
              you every step of the way.
            </p>
          </div>
        </section>

        {/* Contact Content */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid gap-12 md:grid-cols-2">
              {/* Contact Form */}
              <div>
                <Card>
                  <CardHeader>
                    <CardTitle className="text-2xl">
                      Send us a message
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <label
                          className="mb-2 block font-medium text-sm"
                          htmlFor="firstName"
                        >
                          First Name
                        </label>
                        <Input id="firstName" placeholder="John" />
                      </div>
                      <div>
                        <label
                          className="mb-2 block font-medium text-sm"
                          htmlFor="lastName"
                        >
                          Last Name
                        </label>
                        <Input id="lastName" placeholder="Doe" />
                      </div>
                    </div>

                    <div>
                      <label
                        className="mb-2 block font-medium text-sm"
                        htmlFor="email"
                      >
                        Email Address
                      </label>
                      <Input
                        id="email"
                        placeholder="john@example.com"
                        type="email"
                      />
                    </div>

                    <div>
                      <label
                        className="mb-2 block font-medium text-sm"
                        htmlFor="subject"
                      >
                        Subject
                      </label>
                      <Input id="subject" placeholder="How can we help you?" />
                    </div>

                    <div>
                      <label
                        className="mb-2 block font-medium text-sm"
                        htmlFor="message"
                      >
                        Message
                      </label>
                      <Textarea
                        id="message"
                        placeholder="Tell us more about your question or concern..."
                        rows={6}
                      />
                    </div>

                    <Button className="w-full bg-primary hover:bg-primary/90">
                      Send Message
                    </Button>
                  </CardContent>
                </Card>
              </div>

              {/* Contact Information */}
              <div className="space-y-8">
                <div>
                  <h2 className="mb-6 font-bold text-2xl">Get in touch</h2>
                  <p className="mb-8 text-muted-foreground">
                    We'd love to hear from you. Choose the best way to reach us
                    and we'll respond as soon as possible.
                  </p>
                </div>

                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="rounded-lg bg-primary/10 p-3">
                      <MapPin className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="mb-1 font-semibold">Address</h3>
                      <p className="text-muted-foreground">
                        123 Kitchen Street
                        <br />
                        Culinary District, CD 12345
                        <br />
                        United States
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="rounded-lg bg-primary/10 p-3">
                      <Phone className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="mb-1 font-semibold">Phone</h3>
                      <p className="text-muted-foreground">+1 (555) 123-4567</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="rounded-lg bg-primary/10 p-3">
                      <Mail className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="mb-1 font-semibold">Email</h3>
                      <p className="text-muted-foreground">
                        hello@sprucekitchen.com
                        <br />
                        support@sprucekitchen.com
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-4">
                    <div className="rounded-lg bg-primary/10 p-3">
                      <Clock className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="mb-1 font-semibold">Business Hours</h3>
                      <p className="text-muted-foreground">
                        Monday - Friday: 9:00 AM - 6:00 PM
                        <br />
                        Saturday: 10:00 AM - 4:00 PM
                        <br />
                        Sunday: Closed
                      </p>
                    </div>
                  </div>
                </div>

                {/* FAQ Link */}
                <Card className="border-primary/20 bg-primary/5">
                  <CardContent className="p-6">
                    <h3 className="mb-2 font-semibold">Need quick answers?</h3>
                    <p className="mb-4 text-muted-foreground">
                      Check out our frequently asked questions for instant help
                      with common inquiries.
                    </p>
                    <Button
                      asChild
                      className="border-primary bg-transparent text-primary hover:bg-primary hover:text-primary-foreground"
                      variant="outline"
                    >
                      <Link href="/#faq">View FAQ</Link>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
