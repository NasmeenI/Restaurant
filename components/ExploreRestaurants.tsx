"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { getCategoryImage } from "@/lib/mock-images"

interface RestaurantType {
  type: string
  image?: string
}

interface ExploreRestaurantsProps {
  category: string
  setCategory: React.Dispatch<React.SetStateAction<string>>
  restaurant_types: RestaurantType[]
}

export default function ExploreRestaurants({ category, setCategory, restaurant_types }: ExploreRestaurantsProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  const checkScrollability = () => {
    const container = scrollContainerRef.current
    if (container) {
      setCanScrollLeft(container.scrollLeft > 0)
      setCanScrollRight(container.scrollLeft < container.scrollWidth - container.clientWidth)
    }
  }

  useEffect(() => {
    checkScrollability()
    window.addEventListener("resize", checkScrollability)
    return () => window.removeEventListener("resize", checkScrollability)
  }, [])

  const scroll = (direction: "left" | "right") => {
    const container = scrollContainerRef.current
    if (container) {
      const scrollAmount = 300
      const newScrollLeft =
        direction === "left" ? container.scrollLeft - scrollAmount : container.scrollLeft + scrollAmount
      container.scrollTo({
        left: newScrollLeft,
        behavior: "smooth",
      })
      setTimeout(checkScrollability, 300)
    }
  }

  return (
    <section className="py-12" id="explore-restaurants">
      <div className="container px-4">
        <div className="max-w-3xl mx-auto text-center mb-10">
          <h2 className="text-3xl font-bold mb-4">Explore our restaurants</h2>
          <p className="text-muted-foreground">
            Discover a variety of restaurants offering delicious cuisines from around the world. From fast food to fine
            dining, we have options to satisfy every craving and occasion.
          </p>
        </div>

        <div className="relative">
          {/* Scroll Buttons */}
          <div className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 hidden md:block">
            <Button
              variant="outline"
              size="icon"
              className={cn(
                "rounded-full bg-background/80 backdrop-blur-sm shadow-md",
                !canScrollLeft && "opacity-50 cursor-not-allowed",
              )}
              onClick={() => scroll("left")}
              disabled={!canScrollLeft}
            >
              <ChevronLeft className="h-5 w-5" />
              <span className="sr-only">Scroll left</span>
            </Button>
          </div>
          <div className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 hidden md:block">
            <Button
              variant="outline"
              size="icon"
              className={cn(
                "rounded-full bg-background/80 backdrop-blur-sm shadow-md",
                !canScrollRight && "opacity-50 cursor-not-allowed",
              )}
              onClick={() => scroll("right")}
              disabled={!canScrollRight}
            >
              <ChevronRight className="h-5 w-5" />
              <span className="sr-only">Scroll right</span>
            </Button>
          </div>

          {/* Restaurant Categories */}
          <div
            ref={scrollContainerRef}
            className="flex space-x-6 md:space-x-8 overflow-x-auto pb-4 scrollbar-hide"
            onScroll={checkScrollability}
          >
            {restaurant_types.map((item, index) => (
              <div key={index} className="flex flex-col items-center flex-shrink-0">
                <button
                  onClick={() => setCategory((prev) => (prev === item.type ? "All" : item.type))}
                  className="group relative"
                >
                  <div
                    className={cn(
                      "w-24 h-24 md:w-28 md:h-28 rounded-full overflow-hidden transition-all duration-300",
                      category === item.type
                        ? "ring-4 ring-primary ring-offset-2 dark:ring-offset-gray-900"
                        : "ring-2 ring-transparent hover:ring-primary/50 hover:ring-offset-2 dark:hover:ring-offset-gray-900",
                    )}
                  >
                    <img
                      src={item.image || getCategoryImage(item.type)}
                      alt={item.type}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                  </div>
                  <p className="mt-3 text-sm font-medium text-center">{item.type}</p>
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 border-t border-border" />
      </div>
    </section>
  )
}
