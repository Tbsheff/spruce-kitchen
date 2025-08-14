import { Badge } from "@/components/ui/badge"

function FeatureSection() {
  return (
    <div className="w-full py-20 lg:py-40">
      <div className="container mx-auto">
        <div className="flex flex-col-reverse lg:flex-row gap-10 lg:items-center">
          <div className="w-full aspect-video h-full flex-1 rounded-md overflow-hidden">
            <img
              src="/placeholder.svg?height=400&width=600"
              alt="Family enjoying Spruce Kitchen meals"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex gap-4 pl-0 lg:pl-20 flex-col flex-1">
            <div>
              <Badge>Why Families Choose Us</Badge>
            </div>
            <div className="flex gap-2 flex-col">
              <h2 className="text-xl md:text-3xl lg:text-5xl tracking-tighter lg:max-w-xl font-regular text-left">
                Why Families Choose Spruce Kitchen Meals
              </h2>
              <p className="text-lg max-w-xl lg:max-w-sm leading-relaxed tracking-tight text-muted-foreground text-left">
                Enjoy meals crafted with guidance from experienced chefs and nutrition-minded experts—made with real
                ingredients you can feel good about serving. From freezer to table in as little as 15 minutes.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export { FeatureSection }
