import Link from "next/link"
import { Logo } from "@/components/ui/logo"

const navigation = {
  product: [
    { name: "Weekly Menu", href: "/menu" },
    { name: "Process", href: "/how-it-works" },
    { name: "Pricing", href: "/pricing" },
  ],
  company: [
    { name: "Our Story", href: "/about" },
    { name: "Get in Touch", href: "/contact" },
  ],
  legal: [
    { name: "Privacy", href: "/privacy-policy" },
    { name: "Terms", href: "/terms-of-service" },
  ],
}

const columns = [
  { heading: "Explore", items: navigation.product },
  { heading: "Company", items: navigation.company },
  { heading: "Legal", items: navigation.legal },
]

const CURRENT_YEAR = new Date().getFullYear()

function Footer() {
  return (
    <footer className="border-t border-border/60 bg-background pt-24 pb-16 lg:pt-32 lg:pb-20">
      <div className="container mx-auto px-6 lg:px-12">
        <div className="grid gap-16 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-5 flex flex-col gap-10">
            <Logo size="default" className="opacity-90" />
            <p className="font-display max-w-[34ch] text-2xl italic leading-snug text-foreground/70">
              Fine dining, paused. Real food, ready for whenever you are.
            </p>
          </div>

          <nav
            aria-label="Footer"
            className="lg:col-span-7 grid grid-cols-2 gap-12 sm:grid-cols-3"
          >
            {columns.map((col) => (
              <div key={col.heading}>
                <h2 className="text-[10px] font-semibold uppercase tracking-[0.35em] text-accent">
                  {col.heading}
                </h2>
                <ul className="mt-6 space-y-3.5">
                  {col.items.map((item) => (
                    <li key={item.name}>
                      <Link
                        href={item.href}
                        className="text-sm text-muted-foreground transition-colors duration-200 hover:text-foreground"
                      >
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        <div className="mt-24 flex flex-col gap-4 border-t border-border/40 pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground">
            &copy; {CURRENT_YEAR} Spruce Kitchen Meals
          </p>
          <p className="text-xs text-muted-foreground">
            Made in small batches.
          </p>
        </div>
      </div>
    </footer>
  )
}

export { Footer }
