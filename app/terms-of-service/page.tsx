import { Footer } from "@/components/ui/footer.tsx";
import { Header } from "@/components/ui/header.tsx";

export const metadata = {
  title: "Terms of Service | Spruce Kitchen Meals",
  description:
    "Read the terms and conditions for using Spruce Kitchen Meals services.",
};

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto max-w-4xl px-4 py-16">
        <div className="prose prose-lg max-w-none">
          <h1 className="mb-8 font-bold text-4xl text-foreground">
            Terms of Service
          </h1>

          <p className="mb-8 text-muted-foreground">
            <strong>Last updated:</strong> {new Date().toLocaleDateString()}
          </p>

          <section className="mb-8">
            <h2 className="mb-4 font-semibold text-2xl text-foreground">
              1. Acceptance of Terms
            </h2>
            <p className="text-muted-foreground">
              By accessing and using Spruce Kitchen Meals services, you accept
              and agree to be bound by the terms and provision of this
              agreement. If you do not agree to abide by the above, please do
              not use this service.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="mb-4 font-semibold text-2xl text-foreground">
              2. Service Description
            </h2>
            <p className="mb-4 text-muted-foreground">
              Spruce Kitchen Meals provides meal delivery services including:
            </p>
            <ul className="list-disc space-y-2 pl-6 text-muted-foreground">
              <li>Chef-crafted frozen meals delivered to your door</li>
              <li>Subscription and one-time purchase options</li>
              <li>Meal customization based on dietary preferences</li>
              <li>Customer support and account management</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="mb-4 font-semibold text-2xl text-foreground">
              3. Account Registration
            </h2>
            <p className="mb-4 text-muted-foreground">
              To use our services, you must:
            </p>
            <ul className="list-disc space-y-2 pl-6 text-muted-foreground">
              <li>Provide accurate and complete information</li>
              <li>Maintain the security of your account credentials</li>
              <li>Be at least 18 years old or have parental consent</li>
              <li>Notify us of any unauthorized use of your account</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="mb-4 font-semibold text-2xl text-foreground">
              4. Orders and Payment
            </h2>
            <p className="mb-4 text-muted-foreground">
              By placing an order, you agree to:
            </p>
            <ul className="list-disc space-y-2 pl-6 text-muted-foreground">
              <li>Pay all charges associated with your order</li>
              <li>Provide accurate billing and shipping information</li>
              <li>Accept delivery at the specified address</li>
              <li>Report any issues within 24 hours of delivery</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="mb-4 font-semibold text-2xl text-foreground">
              5. Subscription Services
            </h2>
            <p className="mb-4 text-muted-foreground">
              For subscription services:
            </p>
            <ul className="list-disc space-y-2 pl-6 text-muted-foreground">
              <li>Billing occurs automatically on your selected schedule</li>
              <li>You can modify or cancel your subscription at any time</li>
              <li>Changes must be made before the next billing cycle</li>
              <li>Refunds are subject to our refund policy</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="mb-4 font-semibold text-2xl text-foreground">
              6. Delivery and Returns
            </h2>
            <p className="mb-4 text-muted-foreground">
              We strive to deliver fresh, high-quality meals. Our policy
              includes:
            </p>
            <ul className="list-disc space-y-2 pl-6 text-muted-foreground">
              <li>Delivery within specified timeframes</li>
              <li>Replacement or refund for damaged or unsatisfactory items</li>
              <li>Customer responsibility for refrigeration upon delivery</li>
              <li>No returns on consumed products</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="mb-4 font-semibold text-2xl text-foreground">
              7. Limitation of Liability
            </h2>
            <p className="text-muted-foreground">
              Spruce Kitchen Meals shall not be liable for any indirect,
              incidental, special, consequential, or punitive damages resulting
              from your use of our services.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="mb-4 font-semibold text-2xl text-foreground">
              8. Modifications
            </h2>
            <p className="text-muted-foreground">
              We reserve the right to modify these terms at any time. Changes
              will be effective immediately upon posting. Your continued use of
              the service constitutes acceptance of the modified terms.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="mb-4 font-semibold text-2xl text-foreground">
              9. Contact Information
            </h2>
            <p className="text-muted-foreground">
              For questions about these Terms of Service, contact us at:
            </p>
            <div className="mt-4 rounded-lg bg-muted p-4">
              <p className="font-medium text-foreground">
                Spruce Kitchen Meals
              </p>
              <p className="text-muted-foreground">
                Email: legal@sprucekitchen.com
              </p>
              <p className="text-muted-foreground">Phone: (555) 123-4567</p>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
