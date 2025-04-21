// Restaurant images
export const restaurantImages = [
    "/one.jpg?height=300&width=500&text=Italian+Restaurant",
    "/two.jpg?height=300&width=500&text=Sushi+Bar",
    "/three.jpg?height=300&width=500&text=Steakhouse",
    "/four.jpg?height=300&width=500&text=Cafe",
    "/five.jpg?height=300&width=500&text=Pizzeria",
    "/one.jpg?height=300&width=500&text=Burger+Joint",
    "/two.jpg?height=300&width=500&text=Thai+Restaurant",
    "/three.jpg?height=300&width=500&text=Mexican+Grill",
  ]
  
  // Food category images
  export const categoryImages = [
    { type: "All", image: "/all_food.jpg?height=112&width=112&text=All" },
    { type: "Fast Food", image: "/fast_food.webp?height=112&width=112&text=Fast+Food" },
    { type: "Italian", image: "/italian_food.jpeg?height=112&width=112&text=Italian" },
    { type: "Japanese", image: "/japanese_food.jpg?height=112&width=112&text=Japanese" },
    { type: "Thai", image: "/thai_food.jpg?height=112&width=112&text=Thai" },
    { type: "Mexican", image: "/mexican_food.jpeg?height=112&width=112&text=Mexican" },
    { type: "Indian", image: "/indian_food.jpg?height=112&width=112&text=Indian" },
    { type: "Vegetarian", image: "/vegetarian_food.jpg?height=112&width=112&text=Vegetarian" },
  ]
  
  // Food dish images
  export const foodImages = [
    "/placeholder.svg?height=200&width=300&text=Pizza",
    "/placeholder.svg?height=200&width=300&text=Burger",
    "/placeholder.svg?height=200&width=300&text=Pasta",
    "/placeholder.svg?height=200&width=300&text=Sushi",
    "/placeholder.svg?height=200&width=300&text=Salad",
    "/placeholder.svg?height=200&width=300&text=Steak",
    "/placeholder.svg?height=200&width=300&text=Curry",
    "/placeholder.svg?height=200&width=300&text=Tacos",
  ]
  
  // Hero image
  export const heroImage = "/hero.jpg?height=700&width=1400&text=Restaurant+Banner"
  
  // Get a restaurant image based on restaurant type
  export const getRestaurantImage = (type: string) => {
    const typeToImageMap: Record<string, string> = {
      Italian: restaurantImages[0],
      Japanese: restaurantImages[1],
      Steakhouse: restaurantImages[2],
      Cafe: restaurantImages[3],
      Pizza: restaurantImages[4],
      "Fast Food": restaurantImages[5],
      Thai: restaurantImages[6],
      Mexican: restaurantImages[7],
    }
  
    return typeToImageMap[type] || restaurantImages[Math.floor(Math.random() * restaurantImages.length)]
  }
  
  // Get a category image by type
  export const getCategoryImage = (type: string) => {
    const category = categoryImages.find((cat) => cat.type === type)
    return category ? category.image : categoryImages[0].image
  }
  
  // Get a random food image
  export const getRandomFoodImage = () => {
    return foodImages[Math.floor(Math.random() * foodImages.length)]
  }
  