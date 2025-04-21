"use client"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { CalendarIcon, Clock, MapPin, Phone, Users, Timer, Loader2, ArrowLeft, AlertCircle, Info } from "lucide-react"
import { format, addHours, parseISO } from "date-fns"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { useAuth } from "@/context/auth-context"
import { restaurantApi, reservationApi } from "@/lib/api-service"
import { Skeleton } from "@/components/ui/skeleton"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { getRestaurantImage } from "@/lib/mock-images"

// Generate time slots based on open and close times
const generateTimeSlots = (openTime: string, closeTime: string) => {
  const slots = []

  // Parse times like "10.00" or "10:00 AM"
  const parseTime = (timeStr: string) => {
    if (timeStr.includes(".")) {
      const [hours, minutes] = timeStr.split(".")
      return { hours: Number.parseInt(hours), minutes: Number.parseInt(minutes) }
    } else if (timeStr.includes(":")) {
      const [time, period] = timeStr.split(" ")
      const [hours, minutes] = time.split(":")
      let hoursInt = Number.parseInt(hours)

      if (period && period.toUpperCase() === "PM" && hoursInt < 12) {
        hoursInt += 12
      } else if (period && period.toUpperCase() === "AM" && hoursInt === 12) {
        hoursInt = 0
      }

      return { hours: hoursInt, minutes: Number.parseInt(minutes) }
    }

    // Default fallback
    return { hours: 9, minutes: 0 }
  }

  const open = parseTime(openTime)
  const close = parseTime(closeTime)

  // Generate slots every 30 minutes
  for (let hour = open.hours; hour < close.hours; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      // Skip the first iteration if open time has minutes > 0
      if (hour === open.hours && minute < open.minutes) continue

      // Format the time
      const hourFormatted = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour
      const period = hour >= 12 ? "PM" : "AM"
      const minuteFormatted = minute === 0 ? "00" : minute

      slots.push(`${hourFormatted}:${minuteFormatted} ${period}`)
    }
  }

  return slots
}

// Convert ISO date to time string format (e.g., "7:30 PM")
const isoToTimeString = (isoString: string) => {
  try {
    const date = parseISO(isoString)
    return format(date, "h:mm a")
  } catch (error) {
    console.error("Error parsing date:", error)
    return "12:00 PM" // Default fallback
  }
}

// Calculate duration in hours between two ISO dates
const calculateDuration = (startTime: string, endTime: string) => {
  try {
    const start = parseISO(startTime)
    const end = parseISO(endTime)
    const diffInHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60)

    // Round to nearest supported duration
    if (diffInHours <= 1.25) return "1 hour"
    if (diffInHours <= 1.75) return "1.5 hours"
    if (diffInHours <= 2.25) return "2 hours"
    if (diffInHours <= 2.75) return "2.5 hours"
    return "3 hours"
  } catch (error) {
    console.error("Error calculating duration:", error)
    return "2 hours" // Default fallback
  }
}

const formSchema = z.object({
  date: z.date({ required_error: "Please select a date for your reservation" }),
  time: z.string({ required_error: "Please select a time for your reservation" }),
  duration: z.string({ required_error: "Please select how long you'll need the table" }),
  seats: z.string().refine(
    (val) => {
      const num = Number.parseInt(val)
      return !isNaN(num) && num > 0
    },
    { message: "Please select a valid number of seats" },
  ),
  specialRequests: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

export default function EditReservationPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [restaurant, setRestaurant] = useState<any>(null)
  const [reservation, setReservation] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [timeSlots, setTimeSlots] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const [apiError, setApiError] = useState<string | null>(null)

  const router = useRouter()
  const params = useParams()
  const reservationId = params.reservationId as string

  const { isAuthenticated, isLoading: authLoading } = useAuth()

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      date: new Date(),
      time: "6:00 PM",
      duration: "2 hours",
      seats: "2",
      specialRequests: "",
    },
  })

  useEffect(() => {
    const fetchReservationAndRestaurant = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Fetch all reservations
        const reservations = await reservationApi.getOwned()

        // Find the specific reservation
        const currentReservation = reservations.find((res: any) => res._id === reservationId)

        if (!currentReservation) {
          setError("The reservation you're trying to edit could not be found.")
          toast({
            variant: "destructive",
            title: "Reservation not found",
            description: "The reservation you're trying to edit could not be found.",
          })
          router.push("/reservations/history")
          return
        }

        setReservation(currentReservation)

        // Fetch restaurant details
        const restaurantData = await restaurantApi.getById(currentReservation.restaurantId)
        setRestaurant(restaurantData.restaurant)

        // Generate time slots based on restaurant hours
        if (restaurantData.restaurant) {
          const slots = generateTimeSlots(restaurantData.restaurant.openTime, restaurantData.restaurant.closeTime)
          setTimeSlots(slots)
        }

        // Set form default values based on the reservation
        const startDate = parseISO(currentReservation.startTime)

        form.reset({
          date: startDate,
          time: isoToTimeString(currentReservation.startTime),
          duration: calculateDuration(currentReservation.startTime, currentReservation.endTime),
          seats: currentReservation.seats.toString(),
          specialRequests: currentReservation.specialRequests || "",
        })
      } catch (error: any) {
        console.error("Error fetching data:", error)
        setError(error.response?.data?.message || "Failed to load reservation information. Please try again later.")
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load reservation information",
        })
      } finally {
        setIsLoading(false)
      }
    }

    if (reservationId && isAuthenticated && !authLoading) {
      fetchReservationAndRestaurant()
    } else if (!authLoading && !isAuthenticated) {
      router.push("/")
      toast({
        variant: "destructive",
        title: "Authentication required",
        description: "Please login to edit reservations",
      })
    }
  }, [reservationId, isAuthenticated, authLoading, router, form])

  const handleUpdateReservation = async (values: FormValues) => {
    if (!isAuthenticated) {
      toast({
        variant: "destructive",
        title: "Authentication required",
        description: "Please login to update a reservation",
      })
      return
    }

    setIsSubmitting(true)
    setApiError(null)

    try {
      // Validate reservation date is in the future
      const now = new Date()
      const reservationDate = new Date(values.date)
      const [time, period] = values.time.split(" ")
      const [hours, minutes] = time.split(":")

      let hour = Number.parseInt(hours)
      if (period === "PM" && hour < 12) hour += 12
      if (period === "AM" && hour === 12) hour = 0

      reservationDate.setHours(hour, Number.parseInt(minutes), 0, 0)

      if (reservationDate < now) {
        setApiError("Reservation time must be in the future. Please select a later date or time.")
        setIsSubmitting(false)
        return
      }

      // Create start time
      const startTime = new Date(values.date)
      startTime.setHours(hour, Number.parseInt(minutes), 0, 0)

      // Create end time based on duration
      const durationHours = Number.parseFloat(values.duration.split(" ")[0])
      const endTime = addHours(startTime, durationHours)

      // Create reservation data
      const reservationData = {
        seats: Number.parseInt(values.seats),
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        specialRequests: values.specialRequests,
      }

      // Validate seats against restaurant capacity
      if (restaurant.maxSeats && Number.parseInt(values.seats) > restaurant.maxSeats) {
        setApiError(`This restaurant can only accommodate up to ${restaurant.maxSeats} guests per reservation.`)
        setIsSubmitting(false)
        return
      }

      // Send update request
      await reservationApi.update(reservationId, reservationData)

      toast({
        title: "Reservation Updated!",
        description: `Your reservation at ${restaurant.name} has been updated for ${format(values.date, "PPP")} at ${values.time}.`,
      })

      // Redirect to reservations history page
      router.push("/reservations/history")
    } catch (error: any) {
      console.error("Update failed:", error)
      setApiError(
        error.response?.data?.message ||
          "There was a problem updating your reservation. Please check your details and try again.",
      )

      toast({
        variant: "destructive",
        title: "Update Failed",
        description:
          error.response?.data?.message || "There was a problem updating your reservation. Please try again.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="max-w-6xl mx-auto">
          <Skeleton className="h-12 w-64 mx-auto mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Skeleton className="h-[600px] w-full rounded-lg" />
            <Skeleton className="h-[600px] w-full rounded-lg" />
          </div>
        </div>
      </div>
    )
  }

  if (!restaurant || !reservation) {
    return (
      <div className="container mx-auto py-8 px-4 text-center">
        <h1 className="text-2xl font-bold mb-4">Reservation Not Found</h1>
        <p className="mb-6">The reservation you're looking for doesn't exist or has been removed.</p>
        <Button onClick={() => router.push("/reservations/history")}>Return to Reservations</Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <Button variant="ghost" onClick={() => router.push("/reservations/history")} className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Reservations
          </Button>
          <h1 className="text-3xl font-bold text-primary">Edit Reservation</h1>
          <p className="text-muted-foreground">Update the details of your reservation at {restaurant.name}</p>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Restaurant Information Card */}
          <Card>
            <CardHeader className="border-b">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-2xl text-primary">{restaurant.name}</CardTitle>
                  <CardDescription className="mt-1">{restaurant.type}</CardDescription>
                </div>
                <Badge variant="outline" className="font-medium">
                  {restaurant.maxSeats} max seats
                </Badge>
              </div>
            </CardHeader>

            <div className="aspect-video w-full overflow-hidden">
              <img
                src={restaurant.image || getRestaurantImage(restaurant.type)}
                alt={restaurant.name}
                className="w-full h-full object-cover"
              />
            </div>

            <CardContent className="space-y-4 pt-6">
              <div className="space-y-3">
                <div className="flex items-start">
                  <MapPin className="h-5 w-5 text-primary mr-2 mt-0.5" />
                  <span>{restaurant.address}</span>
                </div>

                <div className="flex items-center">
                  <Phone className="h-5 w-5 text-primary mr-2" />
                  <span>{restaurant.phone}</span>
                </div>

                <div className="flex items-center">
                  <Clock className="h-5 w-5 text-primary mr-2" />
                  <span>
                    {restaurant.openTime} - {restaurant.closeTime}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Reservation Form Card */}
          <Card>
            <CardHeader className="border-b">
              <CardTitle className="text-2xl text-primary">Reservation Details</CardTitle>
              <CardDescription>Update your reservation details below</CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              {apiError && (
                <Alert variant="destructive" className="mb-6">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Update Error</AlertTitle>
                  <AlertDescription>{apiError}</AlertDescription>
                </Alert>
              )}

              {!isAuthenticated && (
                <Alert className="mb-6">
                  <Info className="h-4 w-4" />
                  <AlertTitle>Authentication Required</AlertTitle>
                  <AlertDescription>
                    You need to be logged in to update a reservation. Please log in first.
                  </AlertDescription>
                </Alert>
              )}

              <Form {...form}>
                <form onSubmit={form.handleSubmit(handleUpdateReservation)} className="space-y-6">
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
                              {Array.from({ length: Math.min(10, restaurant.maxSeats) }, (_, i) => (
                                <SelectItem key={i + 1} value={(i + 1).toString()}>
                                  {i + 1} {i === 0 ? "person" : "people"}
                                </SelectItem>
                              ))}
                              {restaurant.maxSeats > 10 && <SelectItem value="11+">11+ people</SelectItem>}
                            </SelectContent>
                          </Select>
                          <FormDescription>Maximum {restaurant.maxSeats} guests per reservation</FormDescription>
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

                  <div className="pt-4 flex gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1"
                      onClick={() => router.push("/reservations/history")}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" className="flex-1" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Updating...
                        </>
                      ) : (
                        "Update Reservation"
                      )}
                    </Button>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
