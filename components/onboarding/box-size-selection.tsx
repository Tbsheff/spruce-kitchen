"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx";
import { Label } from "@/components/ui/label.tsx";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group.tsx";

type Size = "small" | "medium";

interface BoxSizeSelectionProps {
  onSizeChange: (size: Size) => void;
  size?: Size;
}

export function BoxSizeSelection({
  size,
  onSizeChange,
}: BoxSizeSelectionProps) {
  return (
    <section aria-label="Choose size" className="mx-auto max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle>Choose Your Box Size</CardTitle>
          <CardDescription>
            Select the option that best fits your household needs.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup
            className="space-y-4"
            onValueChange={(v: Size) => onSizeChange(v)}
            value={size}
          >
            <div className="flex items-start gap-4 rounded-lg border p-4 transition-colors hover:bg-muted/50">
              <RadioGroupItem className="mt-1" id="small" value="small" />
              <Label
                className="flex-1 cursor-pointer space-y-1"
                htmlFor="small"
              >
                <div className="font-semibold">Small Box</div>
                <p className="text-muted-foreground text-sm">
                  Perfect for 2–3 adults
                </p>
                <p className="text-muted-foreground text-xs">
                  Ideal for couples or small households
                </p>
              </Label>
            </div>
            <div className="flex items-start gap-4 rounded-lg border p-4 transition-colors hover:bg-muted/50">
              <RadioGroupItem className="mt-1" id="medium" value="medium" />
              <Label
                className="flex-1 cursor-pointer space-y-1"
                htmlFor="medium"
              >
                <div className="font-semibold">Medium Box</div>
                <p className="text-muted-foreground text-sm">
                  Perfect for 4–6 adults
                </p>
                <p className="text-muted-foreground text-xs">
                  Great for families or larger households
                </p>
              </Label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>
    </section>
  );
}
