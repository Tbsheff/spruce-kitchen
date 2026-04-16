"use client"
import Link from "next/link"
import { Equal, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Logo } from "@/components/ui/logo"
import React from "react"
import { cn } from "@/lib/utils"

const menuItems = [
  { name: "Menu", href: "/menu" },
  { name: "How It Works", href: "/how-it-works" },
  { name: "Pricing", href: "/pricing" },
  { name: "About", href: "/about" },
]

export const Header = () => {
  const [menuState, setMenuState] = React.useState(false)
  const [isScrolled, setIsScrolled] = React.useState(false)

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <header>
      <nav data-state={menuState && "active"} className="fixed left-0 w-full z-50 px-2">
        <div
          className={cn(
            "mx-auto mt-2 max-w-6xl px-6 transition-all duration-300",
            isScrolled && "bg-background/50 max-w-4xl rounded-2xl border backdrop-blur-lg",
          )}
        >
          <div className="flex items-center justify-between py-3">
            {/* Logo */}
            <Link href="/" aria-label="Homepage" className="shrink-0">
              <Logo size="lg" />
            </Link>

            {/* Desktop nav — centered via flex-1 + justify-center */}
            <div className="hidden flex-1 justify-center lg:flex">
              <ul className="flex items-center gap-6 text-sm">
                {menuItems.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className="text-muted-foreground hover:text-foreground transition-colors duration-150"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Desktop actions */}
            <div className="hidden shrink-0 items-center gap-2 lg:flex">
              <Button asChild variant="ghost" size="sm">
                <Link href="/login">Login</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/onboarding">Order Now</Link>
              </Button>
            </div>

            {/* Mobile hamburger */}
            <button
              onClick={() => setMenuState(!menuState)}
              aria-label={menuState ? "Close Menu" : "Open Menu"}
              className="relative z-20 -m-2.5 -mr-4 cursor-pointer p-2.5 lg:hidden"
            >
              <Equal className="in-data-[state=active]:rotate-180 in-data-[state=active]:scale-0 in-data-[state=active]:opacity-0 m-auto size-6 duration-200" />
              <X className="in-data-[state=active]:rotate-0 in-data-[state=active]:scale-100 in-data-[state=active]:opacity-100 absolute inset-0 m-auto size-6 -rotate-180 scale-0 opacity-0 duration-200" />
            </button>
          </div>

          {/* Mobile menu panel */}
          <div
            className={cn(
              "overflow-hidden transition-all duration-300 lg:hidden",
              menuState ? "max-h-96 border-t pb-6 pt-4" : "max-h-0",
            )}
          >
            <ul className="space-y-4 text-base">
              {menuItems.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-muted-foreground hover:text-foreground transition-colors duration-150 block"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-6 flex flex-col gap-2">
              <Button asChild variant="outline" size="sm">
                <Link href="/login">Login</Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/onboarding">Order Now</Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>
    </header>
  )
}
