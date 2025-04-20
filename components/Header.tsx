import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

export default function Header() {
  return (
    <section className="relative h-[500px] md:h-[600px] lg:h-[700px] w-full overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: "url('/placeholder.svg?height=700&width=1400')" }}
      >
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Content */}
      <div className="relative h-full container mx-auto px-4 flex flex-col justify-end pb-16 md:pb-24">
        <div className="max-w-xl space-y-5 animate-fadeIn">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white">Order your favourite food here</h1>
          <p className="text-base md:text-lg text-white/90">
            Choose from a diverse menu featuring a delectable array of dishes crafted with the finest ingredients and
            culinary expertise. Our mission is to satisfy your cravings and elevate your dining experience.
          </p>
          <div className="flex flex-wrap gap-4">
            <Button asChild size="lg" className="rounded-full">
              <Link href="#explore-menu">
                View Menu <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="rounded-full bg-white/10 backdrop-blur-sm">
              <Link href="#restaurant-display">Browse Restaurants</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
