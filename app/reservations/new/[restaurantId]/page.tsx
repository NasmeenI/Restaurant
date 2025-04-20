"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { CalendarIcon, Clock, MapPin, Phone, Mail, User, Users, Timer } from "lucide-react"
import { format } from "date-fns"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { ToastAction } from "@/components/ui/toast"

// This would come from your API or props in a real app
const restaurantData = {
  _id: "123",
  name: "Bella Italia",
  type: "Italian Restaurant",
  address: "123 Main Street, Cityville",
  phone: "(555) 123-4567",
  email: "info@bellaitalia.com",
  website: "www.bellaitalia.com",
  openTime: "11:00 AM",
  closeTime: "10:00 PM",
  maxSeats: 50,
  description:
    "Authentic Italian cuisine in a cozy atmosphere. Our chefs prepare traditional dishes with the finest ingredients imported directly from Italy.",
  image: "/placeholder.svg?height=300&width=500",
  rating: 4.7,
  priceRange: "$$",
}

// Generate time slots based on open and close times
const generateTimeSlots = () => {
  const slots = []
  for (let hour = 11; hour < 22; hour++) {
    const hourFormatted = hour > 12 ? hour - 12 : hour
    const period = hour >= 12 ? "PM" : "AM"

    slots.push(`${hourFormatted}:00 ${period}`)
    slots.push(`${hourFormatted}:30 ${period}`)
  }
  return slots
}

const timeSlots = generateTimeSlots()

const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  phone: z.string().min(10, { message: "Please enter a valid phone number" }),
  date: z.date({ required_error: "Please select a date" }),
  time: z.string({ required_error: "Please select a time" }),
  duration: z.string({ required_error: "Please select a duration" }),
  seats: z.string().refine(
    (val) => {
      const num = Number.parseInt(val)
      return !isNaN(num) && num > 0 && num <= restaurantData.maxSeats
    },
    { message: `Seats must be between 1 and ${restaurantData.maxSeats}` },
  ),
  specialRequests: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

export default function RestaurantReservationPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const router = useRouter()

  // In a real app, these would come from your auth context or environment variables
  const url = process.env.NEXT_PUBLIC_API_URL || "https://api.example.com"
  const token = "your-auth-token" // This would come from your auth context

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      name: "",
      phone: "",
      date: new Date(),
      time: "6:00 PM",
      duration: "2 hours",
      seats: "2",
      specialRequests: "",
    },
  })

  const handleReservation = async (values: FormValues) => {
    setIsSubmitting(true)

    try {
      // In a real app, you would send this to your API
      // const response = await axios.post(`${url}/reservation`, {
      //   restaurantId: restaurantData._id,
      //   ...values,
      // }, {
      //   headers: {
      //     Authorization: `Bearer ${token}`,
      //   },
      // })

      // Simulate API call
      console.log("Reservation data:", values)
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Show success message
      toast({
        title: "Reservation Confirmed!",
        description: `Your table at ${restaurantData.name} has been reserved for ${format(values.date, "PPP")} at ${values.time}.`,
        action: (
          <ToastAction altText="View Reservations" onClick={() => router.push("/reservations/history")}>
            View Reservations
          </ToastAction>
        ),
      })

      // Redirect to reservations history page
      router.push("/reservations/history")
    } catch (error) {
      console.error("Reservation failed:", error)
      toast({
        variant: "destructive",
        title: "Reservation Failed",
        description: "There was a problem making your reservation. Please try again.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 text-primary">Make a Reservation</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Restaurant Information Card */}
          <Card>
            <CardHeader className="border-b">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl text-primary">{restaurantData.name}</CardTitle>
                  <CardDescription className="mt-1">{restaurantData.type}</CardDescription>
                </div>
                <div className="flex items-center space-x-1">
                  <Badge variant="outline" className="font-medium">
                    {restaurantData.priceRange}
                  </Badge>
                  <Badge className="bg-yellow-500 text-white">{restaurantData.rating} ★</Badge>
                </div>
              </div>
            </CardHeader>

            <div className="aspect-video w-full overflow-hidden">
              <img
                src={restaurantData.image || "/placeholder.svg"}
                alt={restaurantData.name}
                className="w-full h-full object-cover"
              />
            </div>

            <CardContent className="space-y-4 pt-6">
              <p className="text-muted-foreground">{restaurantData.description}</p>

              <Separator />

              <div className="space-y-3">
                <div className="flex items-start">
                  <MapPin className="h-5 w-5 text-primary mr-2 mt-0.5" />
                  <span>{restaurantData.address}</span>
                </div>

                <div className="flex items-center">
                  <Phone className="h-5 w-5 text-primary mr-2" />
                  <span>{restaurantData.phone}</span>
                </div>

                <div className="flex items-center">
                  <Mail className="h-5 w-5 text-primary mr-2" />
                  <span>{restaurantData.email}</span>
                </div>

                <div className="flex items-center">
                  <Clock className="h-5 w-5 text-primary mr-2" />
                  <span>
                    {restaurantData.openTime} - {restaurantData.closeTime}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Reservation Form Card */}
          <Card>
            <CardHeader className="border-b">
              <CardTitle className="text-2xl text-primary">Reservation Details</CardTitle>
              <CardDescription>Fill in your details to reserve a table</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleReservation)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center">
                            <User className="h-4 w-4 mr-1" /> Name
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="Your name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center">
                            <Mail className="h-4 w-4 mr-1" /> Email
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="your@email.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center">
                          <Phone className="h-4 w-4 mr-1" /> Phone
                        </FormLabel>
                        <FormControl>
                          <Input placeholder="(555) 123-4567" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="date"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel className="flex items-center">
                            <CalendarIcon className="h-4 w-4 mr-1" /> Date
                          </FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  className={cn("pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                                >
                                  {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={(date) => date < new Date()}
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="time"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center">
                            <Clock className="h-4 w-4 mr-1" /> Time
                          </FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select a time" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {timeSlots.map((time) => (
                                <SelectItem key={time} value={time}>
                                  {time}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="duration"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center">
                            <Timer className="h-4 w-4 mr-1" /> Duration
                          </FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select duration" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="1 hour">1 hour</SelectItem>
                              <SelectItem value="1.5 hours">1.5 hours</SelectItem>
                              <SelectItem value="2 hours">2 hours</SelectItem>
                              <SelectItem value="2.5 hours">2.5 hours</SelectItem>
                              <SelectItem value="3 hours">3 hours</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="seats"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center">
                            <Users className="h-4 w-4 mr-1" /> Party Size
                          </FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select number of guests" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {Array.from({ length: 10 }, (_, i) => (
                                <SelectItem key={i + 1} value={(i + 1).toString()}>
                                  {i + 1} {i === 0 ? "person" : "people"}
                                </SelectItem>
                              ))}
                              <SelectItem value="11+">11+ people</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>Maximum {restaurantData.maxSeats} guests per reservation</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="specialRequests"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Special Requests</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Any dietary restrictions, allergies, or special occasions?"
                            className="resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Optional: Let the restaurant know about any special requirements
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="pt-4">
                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                      {isSubmitting ? "Processing..." : "Confirm Reservation"}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4 border-t pt-6">
              <div className="text-sm text-muted-foreground">
                <p className="font-medium mb-1">Reservation Policy:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Reservations can be cancelled up to 2 hours before the scheduled time</li>
                  <li>Please arrive within 15 minutes of your reservation time</li>
                  <li>For parties larger than 8, please contact the restaurant directly</li>
                </ul>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  )
}
