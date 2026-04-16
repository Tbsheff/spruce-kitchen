"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, Mail } from "lucide-react";
import * as React from "react";
import { Button } from "@/components/ui/button.tsx";
import { Faq } from "@/components/ui/faq.tsx";
import { cn } from "@/lib/utils.ts";

interface FaqSectionProps extends React.HTMLAttributes<HTMLElement> {
  contactInfo?: {
    title: string;
    description: string;
    buttonText: string;
    onContact?: () => void;
  };
  description?: string;
  items: {
    question: string;
    answer: string;
  }[];
  title: string;
}

const FaqSection = React.forwardRef<HTMLElement, FaqSectionProps>(
  ({ className, title, description, items, contactInfo, ...props }, ref) => {
    return (
      <section
        className={cn(
          "w-full bg-gradient-to-b from-transparent via-muted/50 to-transparent py-16",
          className
        )}
        ref={ref}
        {...props}
      >
        <div className="container">
          {/* Header */}
          <motion.div
            animate={{ opacity: 1, y: 0 }}
            className="mx-auto mb-12 max-w-2xl text-center"
            initial={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="mb-3 bg-gradient-to-r from-foreground via-foreground/80 to-foreground bg-clip-text font-semibold text-3xl text-transparent">
              {title}
            </h2>
            {description && (
              <p className="text-muted-foreground text-sm">{description}</p>
            )}
          </motion.div>

          {/* FAQ Items */}
          <div className="mx-auto max-w-2xl">
            <Faq items={items} />
          </div>

          {/* Contact Section */}
          {contactInfo && (
            <motion.div
              animate={{ opacity: 1, y: 0 }}
              className="mx-auto mt-12 max-w-md rounded-lg p-6 text-center"
              initial={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              <div className="mb-4 inline-flex items-center justify-center rounded-full p-1.5">
                <Mail className="h-4 w-4" />
              </div>
              <p className="mb-1 font-medium text-foreground text-sm">
                {contactInfo.title}
              </p>
              <p className="mb-4 text-muted-foreground text-xs">
                {contactInfo.description}
              </p>
              <Button onClick={contactInfo.onContact} size="sm">
                {contactInfo.buttonText}
              </Button>
            </motion.div>
          )}
        </div>
      </section>
    );
  }
);
FaqSection.displayName = "FaqSection";

// Internal FaqItem component
const FaqItem = React.forwardRef<
  HTMLDivElement,
  {
    question: string;
    answer: string;
    index: number;
  }
>((props, ref) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const { question, answer, index } = props;

  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        "group rounded-lg",
        "transition-all duration-200 ease-in-out",
        "border border-border/50",
        isOpen
          ? "bg-gradient-to-br from-background via-muted/50 to-background"
          : "hover:bg-muted/50"
      )}
      initial={{ opacity: 0, y: 10 }}
      ref={ref}
      transition={{ duration: 0.2, delay: index * 0.1 }}
    >
      <Button
        className="h-auto w-full justify-between px-6 py-4 hover:bg-transparent"
        onClick={() => setIsOpen(!isOpen)}
        variant="ghost"
      >
        <h3
          className={cn(
            "text-left font-medium text-base transition-colors duration-200",
            "text-foreground/70",
            isOpen && "text-foreground"
          )}
        >
          {question}
        </h3>
        <motion.div
          animate={{
            rotate: isOpen ? 180 : 0,
            scale: isOpen ? 1.1 : 1,
          }}
          className={cn(
            "flex-shrink-0 rounded-full p-0.5",
            "transition-colors duration-200",
            isOpen ? "text-primary" : "text-muted-foreground"
          )}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="h-4 w-4" />
        </motion.div>
      </Button>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            animate={{
              height: "auto",
              opacity: 1,
              transition: { duration: 0.2, ease: "easeOut" },
            }}
            exit={{
              height: 0,
              opacity: 0,
              transition: { duration: 0.2, ease: "easeIn" },
            }}
            initial={{ height: 0, opacity: 0 }}
          >
            <div className="px-6 pt-2 pb-4">
              <motion.p
                animate={{ y: 0, opacity: 1 }}
                className="text-muted-foreground text-sm leading-relaxed"
                exit={{ y: -10, opacity: 0 }}
                initial={{ y: -10, opacity: 0 }}
              >
                {answer}
              </motion.p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
});
FaqItem.displayName = "FaqItem";

export { FaqSection };
