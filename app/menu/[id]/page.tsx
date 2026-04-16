import { ArrowLeft, ChefHat, Clock, Users } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge.tsx";
import { Button } from "@/components/ui/button.tsx";
import { Header } from "@/components/ui/header.tsx";

const recipes = {
  "burrito-bowls": {
    name: "Burrito Bowls",
    image: "/placeholder.svg?height=400&width=600",
    description:
      "A hearty and nutritious bowl packed with seasoned rice, black beans, grilled vegetables, and fresh toppings.",
    prepTime: "15 minutes",
    servings: 2,
    difficulty: "Easy",
    ingredients: [
      "1 frozen burrito bowl meal",
      "Optional: Fresh cilantro",
      "Optional: Lime wedges",
      "Optional: Hot sauce",
    ],
    instructions: [
      "Remove the burrito bowl from freezer packaging.",
      "Pierce the film covering 3-4 times with a fork.",
      "Microwave on high for 3-4 minutes.",
      "Carefully remove and stir contents.",
      "Microwave for an additional 2-3 minutes until heated through.",
      "Let stand for 1 minute before serving.",
      "Garnish with fresh cilantro and serve with lime wedges if desired.",
    ],
    tips: [
      "For oven heating: Preheat to 375°F, remove film, cover with foil, and heat for 25-30 minutes.",
      "Add fresh avocado slices for extra creaminess.",
      "Customize with your favorite hot sauce or salsa.",
    ],
  },
  "chicken-alfredo": {
    name: "Chicken Alfredo",
    image: "/placeholder.svg?height=400&width=600",
    description:
      "Tender chicken breast in a rich, creamy alfredo sauce served over perfectly cooked fettuccine pasta.",
    prepTime: "12 minutes",
    servings: 1,
    difficulty: "Easy",
    ingredients: [
      "1 frozen chicken alfredo meal",
      "Optional: Fresh parsley",
      "Optional: Grated parmesan cheese",
    ],
    instructions: [
      "Remove meal from freezer packaging.",
      "Pierce film covering several times with a fork.",
      "Microwave on high for 2-3 minutes.",
      "Remove and stir gently, breaking up any ice crystals.",
      "Microwave for another 2-3 minutes until sauce is hot and bubbly.",
      "Let stand for 1 minute to allow sauce to thicken.",
      "Garnish with fresh parsley and extra parmesan if desired.",
    ],
    tips: [
      "Stir halfway through heating for even temperature distribution.",
      "Add a splash of milk if sauce seems too thick after heating.",
      "Serve immediately for best texture.",
    ],
  },
  // Add more recipes as needed...
};

function isRecipeId(id: string): id is keyof typeof recipes {
  return id in recipes;
}

export default async function RecipePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!isRecipeId(id)) {
    notFound();
  }
  const recipe = recipes[id];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="pt-24 pb-12">
        <div className="container mx-auto px-4">
          {/* Back Button */}
          <Link
            className="mb-8 inline-flex items-center gap-2 text-muted-foreground hover:text-foreground"
            href="/menu"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Menu
          </Link>

          <div className="grid grid-cols-1 gap-12 lg:grid-cols-2">
            {/* Recipe Image */}
            <div className="space-y-6">
              <Image
                alt={recipe.name}
                className="w-full rounded-lg shadow-lg"
                height={400}
                src={recipe.image || "/placeholder.svg"}
                width={600}
              />
            </div>

            {/* Recipe Details */}
            <div className="space-y-6">
              <div>
                <h1 className="mb-4 font-bold text-4xl">{recipe.name}</h1>
                <p className="text-lg text-muted-foreground">
                  {recipe.description}
                </p>
              </div>

              {/* Recipe Info */}
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-orange-600" />
                  <span>{recipe.prepTime}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-orange-600" />
                  <span>
                    {recipe.servings} serving{recipe.servings > 1 ? "s" : ""}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <ChefHat className="h-5 w-5 text-orange-600" />
                  <span>{recipe.difficulty}</span>
                </div>
              </div>

              {/* Ingredients */}
              <div>
                <h2 className="mb-4 font-semibold text-2xl">
                  What You'll Need
                </h2>
                <ul className="space-y-2">
                  {recipe.ingredients.map((ingredient) => (
                    <li className="flex items-start gap-2" key={ingredient}>
                      <span className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-orange-600" />
                      <span>{ingredient}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Instructions */}
              <div>
                <h2 className="mb-4 font-semibold text-2xl">
                  Preparation Instructions
                </h2>
                <ol className="space-y-4">
                  {recipe.instructions.map((instruction, index) => (
                    <li className="flex gap-4" key={instruction}>
                      <Badge
                        className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full"
                        variant="outline"
                      >
                        {index + 1}
                      </Badge>
                      <span className="pt-1">{instruction}</span>
                    </li>
                  ))}
                </ol>
              </div>

              {/* Tips */}
              <div className="rounded-lg bg-orange-50 p-6 dark:bg-orange-950/20">
                <h3 className="mb-3 font-semibold text-lg">Chef's Tips</h3>
                <ul className="space-y-2">
                  {recipe.tips.map((tip) => (
                    <li className="text-muted-foreground text-sm" key={tip}>
                      • {tip}
                    </li>
                  ))}
                </ul>
              </div>

              {/* CTA */}
              <div className="pt-6">
                <Link href="/menu">
                  <Button
                    className="w-full bg-primary hover:bg-primary/90"
                    size="lg"
                  >
                    Back to Menu
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
