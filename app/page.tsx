"use client"

import { useState, useEffect } from "react"
import Header from "@/components/Header"
import ExploreRestaurants from "@/components/ExploreRestaurants"
import RestaurantDisplay from "@/components/RestaurantDisplay"
import AppDownloads from "@/components/AppDownloads"
import { restaurantApi } from "@/lib/api-service"
import { Skeleton } from "@/components/ui/skeleton"
import { categoryImages } from "@/lib/mock-images"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

export default function Home() {
  const [category, setCategory] = useState("All")
  const [restaurants, setRestaurants] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        setLoading(true)
        const data = await restaurantApi.getAll()
        setRestaurants(data)
      } catch (err) {
        console.error("Error fetching restaurants:", err)
        setError("Failed to load restaurants. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchRestaurants()
  }, [])

  if (loading) {
    return (
      <>
        <Header />
        <div className="container mx-auto py-12 px-4">
          <div className="max-w-3xl mx-auto text-center mb-10">
            <Skeleton className="h-10 w-64 mx-auto mb-4" />
            <Skeleton className="h-4 w-full mx-auto mb-2" />
            <Skeleton className="h-4 w-5/6 mx-auto" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, index) => (
              <Skeleton key={index} className="h-[300px] w-full rounded-lg" />
            ))}
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <Header />
      <ExploreRestaurants category={category} setCategory={setCategory} restaurant_types={categoryImages} />

      {error && (
        <div className="container mx-auto px-4 my-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        </div>
      )}

      <RestaurantDisplay category={category} restaurantList={restaurants} />
      <AppDownloads />
    </>
  )
}
