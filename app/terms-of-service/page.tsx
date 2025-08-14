import { Header } from "@/components/ui/header"
import Footer from "@/components/ui/footer"

export const metadata = {
  title: "Terms of Service | Spruce Kitchen Meals",
  description: "Read the terms and conditions for using Spruce Kitchen Meals services.",
}

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="prose prose-lg max-w-none">
          <h1 className="text-4xl font-bold text-foreground mb-8">Terms of Service</h1>

          <p className="text-muted-foreground mb-8">
            <strong>Last updated:</strong> {new Date().toLocaleDateString()}
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">1. Acceptance of Terms</h2>
            <p className="text-muted-foreground">
              By accessing and using Spruce Kitchen Meals services, you accept and agree to be bound by the terms and
              provision of this agreement. If you do not agree to abide by the above, please do not use this service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">2. Service Description</h2>
            <p className="text-muted-foreground mb-4">
              Spruce Kitchen Meals provides meal delivery services including:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Chef-crafted frozen meals delivered to your door</li>
              <li>Subscription and one-time purchase options</li>
              <li>Meal customization based on dietary preferences</li>
              <li>Customer support and account management</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">3. Account Registration</h2>
            <p className="text-muted-foreground mb-4">To use our services, you must:</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Provide accurate and complete information</li>
              <li>Maintain the security of your account credentials</li>
              <li>Be at least 18 years old or have parental consent</li>
              <li>Notify us of any unauthorized use of your account</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">4. Orders and Payment</h2>
            <p className="text-muted-foreground mb-4">By placing an order, you agree to:</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Pay all charges associated with your order</li>
              <li>Provide accurate billing and shipping information</li>
              <li>Accept delivery at the specified address</li>
              <li>Report any issues within 24 hours of delivery</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">5. Subscription Services</h2>
            <p className="text-muted-foreground mb-4">For subscription services:</p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Billing occurs automatically on your selected schedule</li>
              <li>You can modify or cancel your subscription at any time</li>
              <li>Changes must be made before the next billing cycle</li>
              <li>Refunds are subject to our refund policy</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">6. Delivery and Returns</h2>
            <p className="text-muted-foreground mb-4">
              We strive to deliver fresh, high-quality meals. Our policy includes:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground space-y-2">
              <li>Delivery within specified timeframes</li>
              <li>Replacement or refund for damaged or unsatisfactory items</li>
              <li>Customer responsibility for refrigeration upon delivery</li>
              <li>No returns on consumed products</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">7. Limitation of Liability</h2>
            <p className="text-muted-foreground">
              Spruce Kitchen Meals shall not be liable for any indirect, incidental, special, consequential, or punitive
              damages resulting from your use of our services.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">8. Modifications</h2>
            <p className="text-muted-foreground">
              We reserve the right to modify these terms at any time. Changes will be effective immediately upon
              posting. Your continued use of the service constitutes acceptance of the modified terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-semibold text-foreground mb-4">9. Contact Information</h2>
            <p className="text-muted-foreground">For questions about these Terms of Service, contact us at:</p>
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <p className="text-foreground font-medium">Spruce Kitchen Meals</p>
              <p className="text-muted-foreground">Email: legal@sprucekitchen.com</p>
              <p className="text-muted-foreground">Phone: (555) 123-4567</p>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  )
}
