"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

type Size = "small" | "medium"

interface BoxSizeSelectionProps {
  size?: Size
  onSizeChange: (size: Size) => void
}

export function BoxSizeSelection({ size, onSizeChange }: BoxSizeSelectionProps) {
  return (
    <section aria-label="Choose size" className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Choose Your Box Size</CardTitle>
          <CardDescription>Select the option that best fits your household needs.</CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup value={size} onValueChange={(v: Size) => onSizeChange(v)} className="space-y-4">
            <div className="flex items-start gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
              <RadioGroupItem id="small" value="small" className="mt-1" />
              <Label htmlFor="small" className="flex-1 space-y-1 cursor-pointer">
                <div className="font-semibold">Small Box</div>
                <p className="text-sm text-muted-foreground">Perfect for 2–3 adults</p>
                <p className="text-xs text-muted-foreground">Ideal for couples or small households</p>
              </Label>
            </div>
            <div className="flex items-start gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
              <RadioGroupItem id="medium" value="medium" className="mt-1" />
              <Label htmlFor="medium" className="flex-1 space-y-1 cursor-pointer">
                <div className="font-semibold">Medium Box</div>
                <p className="text-sm text-muted-foreground">Perfect for 4–6 adults</p>
                <p className="text-xs text-muted-foreground">Great for families or larger households</p>
              </Label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>
    </section>
  )
}
