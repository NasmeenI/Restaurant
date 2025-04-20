"use client"

import { useState } from "react"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Star, Clock, MapPin, Heart } from "lucide-react"

interface Restaurant {
  _id: string
  name: string
  type: string
  address: string
  openTime: string
  closeTime: string
}

interface RestaurantItemProps {
  restaurant: Restaurant
  image: string
}

export default function RestaurantItem({ restaurant, image }: RestaurantItemProps) {
  const [isFavorite, setIsFavorite] = useState(false)

  const handleClick = () => {
    // In a real app, this would navigate to the restaurant detail page
    console.log(`Navigating to restaurant: ${restaurant._id}`)
  }

  return (
    <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg group">
      <div className="relative aspect-video overflow-hidden">
        <img
          src={image || "/placeholder.svg?height=200&width=300"}
          alt={restaurant.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <button
          className="absolute top-3 right-3 p-2 rounded-full bg-white/80 dark:bg-black/50 backdrop-blur-sm shadow-sm transition-all duration-300 hover:bg-white dark:hover:bg-black"
          onClick={(e) => {
            e.stopPropagation()
            setIsFavorite(!isFavorite)
          }}
        >
          <Heart
            className={`h-5 w-5 ${isFavorite ? "fill-primary text-primary" : "text-gray-600 dark:text-gray-400"}`}
          />
        </button>
        <Badge
          variant="secondary"
          className="absolute bottom-3 left-3 bg-black/60 text-white dark:bg-white/80 dark:text-black"
        >
          {restaurant.type}
        </Badge>
      </div>
      <CardContent className="p-4" onClick={handleClick}>
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-bold text-lg line-clamp-1">{restaurant.name}</h3>
          <div className="flex items-center">
            <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
            <span className="text-sm font-medium">4.5</span>
          </div>
        </div>
        <div className="flex items-center text-sm text-muted-foreground mb-2">
          <MapPin className="h-3.5 w-3.5 mr-1 flex-shrink-0" />
          <span className="line-clamp-1">{restaurant.address}</span>
        </div>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex items-center text-sm">
        <Clock className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
        <span>
          {restaurant.openTime} - {restaurant.closeTime}
        </span>
      </CardFooter>
    </Card>
  )
}
