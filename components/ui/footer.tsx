"use client";

import {
  Facebook,
  Instagram,
  Linkedin,
  Moon,
  Send,
  Sun,
  Twitter,
} from "lucide-react";
import Link from "next/link";
import * as React from "react";
import { Button } from "@/components/ui/button.tsx";
import { Input } from "@/components/ui/input.tsx";
import { Label } from "@/components/ui/label.tsx";
import { Switch } from "@/components/ui/switch.tsx";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip.tsx";

function Footer() {
  const [isDarkMode, setIsDarkMode] = React.useState(false);

  React.useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="relative border-t bg-background text-foreground transition-colors duration-300">
      <div className="container mx-auto px-4 py-12 md:px-6 lg:px-8">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
          <div className="relative">
            <h2 className="mb-4 font-bold text-3xl tracking-tight">
              Stay Connected
            </h2>
            <p className="mb-6 text-muted-foreground">
              Get weekly menu updates and exclusive offers delivered to your
              inbox.
            </p>
            <form className="relative">
              <Input
                className="pr-12 backdrop-blur-sm"
                placeholder="Enter your email"
                type="email"
              />
              <Button
                className="absolute top-1 right-1 h-8 w-8 rounded-full bg-primary text-primary-foreground transition-transform hover:scale-105"
                size="icon"
                type="submit"
              >
                <Send className="h-4 w-4" />
                <span className="sr-only">Subscribe</span>
              </Button>
            </form>
            <div className="absolute top-0 -right-4 h-24 w-24 rounded-full bg-primary/10 blur-2xl" />
          </div>
          <div>
            <h3 className="mb-4 font-semibold text-lg">Quick Links</h3>
            <nav className="space-y-2 text-sm">
              <Link
                className="block transition-colors hover:text-primary"
                href="/menu"
                onClick={scrollToTop}
              >
                Menu
              </Link>
              <Link
                className="block transition-colors hover:text-primary"
                href="/how-it-works"
                onClick={scrollToTop}
              >
                How It Works
              </Link>
              <Link
                className="block transition-colors hover:text-primary"
                href="/pricing"
                onClick={scrollToTop}
              >
                Pricing
              </Link>
              <Link
                className="block transition-colors hover:text-primary"
                href="/about"
                onClick={scrollToTop}
              >
                About
              </Link>
              <Link
                className="block transition-colors hover:text-primary"
                href="/contact"
                onClick={scrollToTop}
              >
                Contact
              </Link>
            </nav>
          </div>
          <div>
            <h3 className="mb-4 font-semibold text-lg">Contact Us</h3>
            <address className="space-y-2 text-sm not-italic">
              <p>456 Kitchen Lane</p>
              <p>Culinary City, CC 54321</p>
              <p>Phone: (555) 123-MEAL</p>
              <p>Email: hello@sprucekitchen.com</p>
            </address>
          </div>
          <div className="relative">
            <h3 className="mb-4 font-semibold text-lg">Follow Us</h3>
            <div className="mb-6 flex space-x-4">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      className="rounded-full bg-transparent"
                      size="icon"
                      variant="outline"
                    >
                      <Facebook className="h-4 w-4" />
                      <span className="sr-only">Facebook</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Follow us on Facebook</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      className="rounded-full bg-transparent"
                      size="icon"
                      variant="outline"
                    >
                      <Twitter className="h-4 w-4" />
                      <span className="sr-only">Twitter</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Follow us on Twitter</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      className="rounded-full bg-transparent"
                      size="icon"
                      variant="outline"
                    >
                      <Instagram className="h-4 w-4" />
                      <span className="sr-only">Instagram</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Follow us on Instagram</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      className="rounded-full bg-transparent"
                      size="icon"
                      variant="outline"
                    >
                      <Linkedin className="h-4 w-4" />
                      <span className="sr-only">LinkedIn</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Connect with us on LinkedIn</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className="flex items-center space-x-2">
              <Sun className="h-4 w-4" />
              <Switch
                checked={isDarkMode}
                id="dark-mode"
                onCheckedChange={setIsDarkMode}
              />
              <Moon className="h-4 w-4" />
              <Label className="sr-only" htmlFor="dark-mode">
                Toggle dark mode
              </Label>
            </div>
          </div>
        </div>
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t pt-8 text-center md:flex-row">
          <p className="text-muted-foreground text-sm">
            © 2024 Spruce Kitchen Meals. All rights reserved.
          </p>
          <nav className="flex gap-4 text-sm">
            <Link
              className="transition-colors hover:text-primary"
              href="/privacy-policy"
              onClick={scrollToTop}
            >
              Privacy Policy
            </Link>
            <Link
              className="transition-colors hover:text-primary"
              href="/terms-of-service"
              onClick={scrollToTop}
            >
              Terms of Service
            </Link>
            <button
              className="transition-colors hover:text-primary"
              type="button"
            >
              Cookie Settings
            </button>
          </nav>
        </div>
      </div>
    </footer>
  );
}

export { Footer };
export default Footer;
