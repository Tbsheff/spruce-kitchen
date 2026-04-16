import Image from "next/image"
import { cn } from "@/lib/utils"

/**
 * Brand logo — spruce branch + "SPRUCE KITCHEN MEALS" wordmark
 * loaded from /public/logo.png (793×221, landscape ~3.6:1).
 *
 * `size` controls the rendered height; width scales proportionally.
 *   - "sm"      → 24px  (compact headers, sidebar)
 *   - "default" → 32px  (standard headers, onboarding shell)
 *   - "lg"      → 40px  (marketing header)
 */

const heights = {
  sm: 24,
  default: 32,
  lg: 40,
} as const

const ASPECT = 793 / 221 // ~3.59

interface LogoProps {
  size?: keyof typeof heights
  className?: string
}

function Logo({ size = "default", className }: LogoProps) {
  const h = heights[size]
  const w = Math.round(h * ASPECT)

  return (
    <Image
      src="/logo.png"
      alt="Spruce Kitchen Meals"
      width={w}
      height={h}
      className={cn("object-contain", className)}
      priority
    />
  )
}

export { Logo }
