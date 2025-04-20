"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface MenuItem {
  menu_name: string
  menu_image: string
}

interface ExploreMenuProps {
  category: string
  setCategory: React.Dispatch<React.SetStateAction<string>>
  menu_list: MenuItem[]
}

export default function ExploreMenu({ category, setCategory, menu_list }: ExploreMenuProps) {
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
    <section className="py-12" id="explore-menu">
      <div className="container px-4">
        <div className="max-w-3xl mx-auto text-center mb-10">
          <h2 className="text-3xl font-bold mb-4">Explore our menu</h2>
          <p className="text-muted-foreground">
            Choose from a diverse menu featuring a delectable array of dishes. Our mission is to satisfy your craving
            and elevate your dining experience, one delicious meal at a time.
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

          {/* Menu Categories */}
          <div
            ref={scrollContainerRef}
            className="flex space-x-6 md:space-x-8 overflow-x-auto pb-4 scrollbar-hide"
            onScroll={checkScrollability}
          >
            {menu_list.map((item, index) => (
              <div key={index} className="flex flex-col items-center flex-shrink-0">
                <button
                  onClick={() => setCategory((prev) => (prev === item.menu_name ? "All" : item.menu_name))}
                  className="group relative"
                >
                  <div
                    className={cn(
                      "w-24 h-24 md:w-28 md:h-28 rounded-full overflow-hidden transition-all duration-300",
                      category === item.menu_name
                        ? "ring-4 ring-primary ring-offset-2 dark:ring-offset-gray-900"
                        : "ring-2 ring-transparent hover:ring-primary/50 hover:ring-offset-2 dark:hover:ring-offset-gray-900",
                    )}
                  >
                    <img
                      src={item.menu_image || "/placeholder.svg?height=112&width=112"}
                      alt={item.menu_name}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                  </div>
                  <p className="mt-3 text-sm font-medium text-center">{item.menu_name}</p>
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
