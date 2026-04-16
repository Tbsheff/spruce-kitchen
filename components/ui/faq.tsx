"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import * as React from "react";
import { Button } from "@/components/ui/button.tsx";
import { cn } from "@/lib/utils.ts";

interface FaqProps extends React.HTMLAttributes<HTMLDivElement> {
  items: {
    question: string;
    answer: string;
  }[];
}

const Faq = React.forwardRef<HTMLDivElement, FaqProps>(
  ({ className, items, ...props }, ref) => {
    return (
      <div className={cn("space-y-2", className)} ref={ref} {...props}>
        {items.map((item, index) => (
          <FaqItem
            answer={item.answer}
            index={index}
            key={item.question}
            question={item.question}
          />
        ))}
      </div>
    );
  }
);
Faq.displayName = "Faq";

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

export { Faq };
