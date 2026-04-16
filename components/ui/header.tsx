"use client";
import { Equal, X } from "lucide-react";
import Link from "next/link";
import React from "react";
import { Button } from "@/components/ui/liquid-glass-button.tsx";
import { cn } from "@/lib/utils.ts";

const menuItems = [
  { name: "Menu", href: "/menu" },
  { name: "How It Works", href: "/how-it-works" },
  { name: "Pricing", href: "/pricing" },
  { name: "About", href: "/about" },
];

export const Header = () => {
  const [menuState, setMenuState] = React.useState(false);
  const [isScrolled, setIsScrolled] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header>
      <nav
        className="fixed left-0 z-20 w-full px-2"
        data-state={menuState && "active"}
      >
        <div
          className={cn(
            "mx-auto mt-2 max-w-6xl px-6 transition-all duration-300 lg:px-12",
            isScrolled &&
              "max-w-4xl rounded-2xl border bg-background/50 backdrop-blur-lg lg:px-5"
          )}
        >
          <div className="relative flex flex-wrap items-center justify-between gap-6 py-2 lg:gap-0">
            <div className="flex w-full justify-between lg:w-auto">
              <Link
                aria-label="home"
                className="flex items-center gap-2"
                href="/"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-orange-400 to-orange-600">
                  <span className="font-bold text-lg text-white">S</span>
                </div>
                <p className="font-semibold text-xl tracking-tighter">
                  Spruce Kitchen
                </p>
              </Link>

              <button
                aria-label={menuState === true ? "Close Menu" : "Open Menu"}
                className="relative z-20 -m-2.5 -mr-4 block cursor-pointer p-2.5 lg:hidden"
                onClick={() => setMenuState(!menuState)}
                type="button"
              >
                <Equal className="m-auto size-6 in-data-[state=active]:rotate-180 in-data-[state=active]:scale-0 in-data-[state=active]:opacity-0 duration-200" />
                <X className="absolute inset-0 m-auto size-6 -rotate-180 in-data-[state=active]:rotate-0 in-data-[state=active]:scale-100 scale-0 in-data-[state=active]:opacity-100 opacity-0 duration-200" />
              </button>
            </div>

            <div className="absolute inset-0 m-auto hidden size-fit lg:block">
              <ul className="flex gap-8 text-sm">
                {menuItems.map((item) => (
                  <li key={item.name}>
                    <Link
                      className="group relative block text-muted-foreground transition-colors duration-200 hover:text-foreground"
                      href={item.href}
                    >
                      <span>{item.name}</span>
                      <span className="absolute -bottom-1 left-0 h-0.5 w-0 bg-orange-500 transition-all duration-200 group-hover:w-full" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mb-6 in-data-[state=active]:block hidden w-full flex-wrap items-center justify-end space-y-8 rounded-3xl border bg-background p-6 shadow-2xl shadow-zinc-300/20 md:flex-nowrap lg:m-0 lg:flex lg:in-data-[state=active]:flex lg:w-fit lg:gap-6 lg:space-y-0 lg:border-transparent lg:bg-transparent lg:p-0 lg:shadow-none dark:shadow-none dark:lg:bg-transparent">
              <div className="lg:hidden">
                <ul className="space-y-6 text-base">
                  {menuItems.map((item) => (
                    <li key={item.name}>
                      <Link
                        className="block text-muted-foreground transition-colors duration-200 hover:text-foreground"
                        href={item.href}
                      >
                        <span>{item.name}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex w-full flex-col space-y-3 sm:flex-row sm:gap-2 sm:space-y-0 md:w-fit">
                <Button
                  asChild
                  className={cn(isScrolled && "lg:hidden")}
                  size="sm"
                  variant="outline"
                >
                  <Link href="/login">
                    <span>Login</span>
                  </Link>
                </Button>
                <Button
                  asChild
                  className={cn(isScrolled && "lg:hidden")}
                  size="sm"
                >
                  <Link href="/order">
                    <span>Order Now</span>
                  </Link>
                </Button>
                <Button
                  asChild
                  className={cn(isScrolled ? "lg:inline-flex" : "hidden")}
                  size="sm"
                >
                  <Link href="/order">
                    <span>Order Now</span>
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
};
