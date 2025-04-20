"use client"

import { useState } from "react"
import Header from "@/components/Header"
import ExploreMenu from "@/components/ExploreMenu"
import RestaurantDisplay from "@/components/RestaurantDisplay"
import AppDownloads from "@/components/AppDownloads"

// Sample data - in a real app, this would come from an API
const menu_list = [
  { menu_name: "All", menu_image: "/placeholder.svg?height=112&width=112" },
  { menu_name: "Pizza", menu_image: "/placeholder.svg?height=112&width=112" },
  { menu_name: "Burger", menu_image: "/placeholder.svg?height=112&width=112" },
  { menu_name: "Sushi", menu_image: "/placeholder.svg?height=112&width=112" },
  { menu_name: "Pasta", menu_image: "/placeholder.svg?height=112&width=112" },
  { menu_name: "Salad", menu_image: "/placeholder.svg?height=112&width=112" },
  { menu_name: "Dessert", menu_image: "/placeholder.svg?height=112&width=112" },
  { menu_name: "Drinks", menu_image: "/placeholder.svg?height=112&width=112" },
]

const restaurantList = [
  {
    _id: "1",
    name: "Pizza Palace",
    type: "Pizza",
    address: "123 Main St, New York, NY",
    openTime: "9:00 AM",
    closeTime: "10:00 PM",
  },
  {
    _id: "2",
    name: "Burger Barn",
    type: "Burger",
    address: "456 Oak Ave, Los Angeles, CA",
    openTime: "10:00 AM",
    closeTime: "11:00 PM",
  },
  {
    _id: "3",
    name: "Sushi Spot",
    type: "Sushi",
    address: "789 Pine Rd, Chicago, IL",
    openTime: "11:00 AM",
    closeTime: "9:00 PM",
  },
  {
    _id: "4",
    name: "Pasta Paradise",
    type: "Pasta",
    address: "101 Elm Blvd, Miami, FL",
    openTime: "11:30 AM",
    closeTime: "10:30 PM",
  },
  {
    _id: "5",
    name: "Salad Station",
    type: "Salad",
    address: "202 Maple Dr, Seattle, WA",
    openTime: "8:00 AM",
    closeTime: "8:00 PM",
  },
  {
    _id: "6",
    name: "Sweet Treats",
    type: "Dessert",
    address: "303 Cherry Ln, Boston, MA",
    openTime: "10:00 AM",
    closeTime: "9:00 PM",
  },
]

const foodImages = [
  "/placeholder.svg?height=200&width=300",
  "/placeholder.svg?height=200&width=300",
  "/placeholder.svg?height=200&width=300",
  "/placeholder.svg?height=200&width=300",
]

export default function Home() {
  const [category, setCategory] = useState("All")

  return (
    <>
      <Header />
      <ExploreMenu category={category} setCategory={setCategory} menu_list={menu_list} />
      <RestaurantDisplay category={category} restaurantList={restaurantList} foodImages={foodImages} />
      <AppDownloads />
    </>
  )
}
