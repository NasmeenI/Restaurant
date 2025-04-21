import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { heroImage } from "@/lib/mock-images"

export default function Header() {
  return (
    <section className="relative h-[500px] md:h-[600px] lg:h-[700px] w-full overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url('${heroImage}')` }}
      >
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Content */}
      <div className="relative h-full container mx-auto px-4 flex flex-col justify-end pb-16 md:pb-24">
        <div className="max-w-xl space-y-5 animate-fadeIn">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white">
            Find and reserve your favorite restaurants
          </h1>
          <p className="text-base md:text-lg text-white/90">
            Discover the best dining experiences in your area. Browse top-rated restaurants, view their menus, and make
            reservations with just a few clicks.
          </p>
          <div className="flex flex-wrap gap-4">
            <Button asChild size="lg" className="rounded-full">
              <Link href="#explore-restaurants">
                Explore Restaurants <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="rounded-full bg-white/10 backdrop-blur-sm text-white border-white hover:bg-white/20 hover:text-white"
            >
              <Link href="#restaurant-display">Browse All</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
