import { Footer } from "@/components/ui/footer.tsx";
import { Header } from "@/components/ui/header.tsx";

export const metadata = {
  title: "Privacy Policy | Spruce Kitchen Meals",
  description:
    "Learn how Spruce Kitchen Meals collects, uses, and protects your personal information.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="container mx-auto max-w-4xl px-4 py-16">
        <div className="prose prose-lg max-w-none">
          <h1 className="mb-8 font-bold text-4xl text-foreground">
            Privacy Policy
          </h1>

          <p className="mb-8 text-muted-foreground">
            <strong>Last updated:</strong> {new Date().toLocaleDateString()}
          </p>

          <section className="mb-8">
            <h2 className="mb-4 font-semibold text-2xl text-foreground">
              1. Information We Collect
            </h2>
            <p className="mb-4 text-muted-foreground">
              We collect information you provide directly to us, such as when
              you create an account, place an order, or contact us for support.
            </p>
            <ul className="list-disc space-y-2 pl-6 text-muted-foreground">
              <li>Personal information (name, email address, phone number)</li>
              <li>Billing and shipping addresses</li>
              <li>
                Payment information (processed securely through our payment
                providers)
              </li>
              <li>Dietary preferences and restrictions</li>
              <li>Order history and preferences</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="mb-4 font-semibold text-2xl text-foreground">
              2. How We Use Your Information
            </h2>
            <p className="mb-4 text-muted-foreground">
              We use the information we collect to:
            </p>
            <ul className="list-disc space-y-2 pl-6 text-muted-foreground">
              <li>Process and fulfill your meal orders</li>
              <li>Communicate with you about your orders and account</li>
              <li>Provide customer support</li>
              <li>Improve our products and services</li>
              <li>Send you marketing communications (with your consent)</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="mb-4 font-semibold text-2xl text-foreground">
              3. Information Sharing
            </h2>
            <p className="mb-4 text-muted-foreground">
              We do not sell, trade, or otherwise transfer your personal
              information to third parties except as described in this policy:
            </p>
            <ul className="list-disc space-y-2 pl-6 text-muted-foreground">
              <li>Service providers who assist in our operations</li>
              <li>Payment processors for transaction processing</li>
              <li>Delivery partners for order fulfillment</li>
              <li>Legal compliance when required by law</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="mb-4 font-semibold text-2xl text-foreground">
              4. Data Security
            </h2>
            <p className="text-muted-foreground">
              We implement appropriate security measures to protect your
              personal information against unauthorized access, alteration,
              disclosure, or destruction. However, no method of transmission
              over the internet is 100% secure.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="mb-4 font-semibold text-2xl text-foreground">
              5. Your Rights
            </h2>
            <p className="mb-4 text-muted-foreground">You have the right to:</p>
            <ul className="list-disc space-y-2 pl-6 text-muted-foreground">
              <li>Access and update your personal information</li>
              <li>Delete your account and personal data</li>
              <li>Opt out of marketing communications</li>
              <li>Request a copy of your data</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="mb-4 font-semibold text-2xl text-foreground">
              6. Cookies
            </h2>
            <p className="text-muted-foreground">
              We use cookies and similar technologies to enhance your
              experience, analyze usage, and provide personalized content. You
              can control cookie settings through your browser.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="mb-4 font-semibold text-2xl text-foreground">
              7. Contact Us
            </h2>
            <p className="text-muted-foreground">
              If you have questions about this Privacy Policy, please contact us
              at:
            </p>
            <div className="mt-4 rounded-lg bg-muted p-4">
              <p className="font-medium text-foreground">
                Spruce Kitchen Meals
              </p>
              <p className="text-muted-foreground">
                Email: privacy@sprucekitchen.com
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
