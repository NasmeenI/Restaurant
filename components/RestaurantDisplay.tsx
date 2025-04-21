"use client"

import { useState } from "react"
import RestaurantItem from "./RestaurantItem"
import { Button } from "@/components/ui/button"
import { Search } from "lucide-react"
import { getRestaurantImage } from "@/lib/mock-images"

interface Restaurant {
  _id: string
  name: string
  type: string
  address: string
  openTime: string
  closeTime: string
}

interface RestaurantDisplayProps {
  category: string
  restaurantList: Restaurant[]
  foodImages?: string[]
}

export default function RestaurantDisplay({ category, restaurantList, foodImages }: RestaurantDisplayProps) {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredRestaurants = restaurantList.filter(
    (restaurant) =>
      (category === "All" || category === restaurant.type) &&
      (searchQuery === "" ||
        restaurant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        restaurant.address.toLowerCase().includes(searchQuery.toLowerCase())),
  )

  return (
    <section className="py-12" id="restaurant-display">
      <div className="container px-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <h2 className="text-3xl font-bold">Top restaurants near you</h2>

          <div className="relative max-w-md w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search restaurants or locations..."
              className="w-full pl-10 pr-4 py-2 rounded-full border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {filteredRestaurants.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredRestaurants.map((restaurant, index) => (
              <RestaurantItem
                key={restaurant._id || index}
                restaurant={restaurant}
                image={getRestaurantImage(restaurant.type)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <h3 className="text-xl font-medium mb-2">No restaurants found</h3>
            <p className="text-muted-foreground mb-6">Try changing your search or category filter</p>
            <Button
              onClick={() => {
                setSearchQuery("")
              }}
            >
              Clear Search
            </Button>
          </div>
        )}
      </div>
    </section>
  )
}
