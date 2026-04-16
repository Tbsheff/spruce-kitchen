import Image from "next/image";
import { Badge } from "@/components/ui/badge.tsx";

function FeatureSection() {
  return (
    <div className="w-full py-20 lg:py-40">
      <div className="container mx-auto">
        <div className="flex flex-col-reverse gap-10 lg:flex-row lg:items-center">
          <div className="relative aspect-video h-full w-full flex-1 overflow-hidden rounded-md">
            <Image
              alt="Family enjoying Spruce Kitchen meals"
              className="object-cover"
              fill
              src="/placeholder.svg?height=400&width=600"
            />
          </div>
          <div className="flex flex-1 flex-col gap-4 pl-0 lg:pl-20">
            <div>
              <Badge>Why Families Choose Us</Badge>
            </div>
            <div className="flex flex-col gap-2">
              <h2 className="text-left font-regular text-xl tracking-tighter md:text-3xl lg:max-w-xl lg:text-5xl">
                Why Families Choose Spruce Kitchen Meals
              </h2>
              <p className="max-w-xl text-left text-lg text-muted-foreground leading-relaxed tracking-tight lg:max-w-sm">
                Enjoy meals crafted with guidance from experienced chefs and
                nutrition-minded experts—made with real ingredients you can feel
                good about serving. From freezer to table in as little as 15
                minutes.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export { FeatureSection };
