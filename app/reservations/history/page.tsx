"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { format, parseISO } from "date-fns"
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Trash2, Edit, Calendar, Clock, Users, MapPin, Loader2 } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { useToast } from "@/components/ui/use-toast"
import { useAuth } from "@/context/auth-context"
import { reservationApi, restaurantApi } from "@/lib/api-service"

interface Restaurant {
  _id: string
  name: string
  type: string
  address: string
  openTime: string
  closeTime: string
  image?: string
}

interface Reservation {
  _id: string
  restaurantId: string
  userId: string
  seats: number
  startTime: string
  endTime: string
  status?: string
  restaurant?: Restaurant
}

export default function ReservationHistory() {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const router = useRouter()
  const { toast } = useToast()
  const { isAuthenticated, isLoading: authLoading } = useAuth()

  const fetchReservations = async () => {
    setLoading(true)
    setError(null)

    try {
      // Fetch user's reservations
      const reservationsData = await reservationApi.getOwned()

      // Enhance reservations with restaurant data
      const enhancedReservationsPromises = reservationsData.map(async (reservation: Reservation) => {
        try {
          const restaurantData = await restaurantApi.getById(reservation.restaurantId)

          return {
            ...reservation,
            restaurant: restaurantData.restaurant,
          }
        } catch (error) {
          console.error(`Error fetching restaurant ${reservation.restaurantId}:`, error)
          return {
            ...reservation,
            restaurant: null,
          }
        }
      })

      const enhancedReservations = await Promise.all(enhancedReservationsPromises)
      setReservations(enhancedReservations)
    } catch (error) {
      console.error("Error fetching reservations:", error)
      setError("Failed to load your reservations. Please try again later.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      fetchReservations()
    } else if (!authLoading && !isAuthenticated) {
      router.push("/")
      toast({
        variant: "destructive",
        title: "Authentication required",
        description: "Please login to view your reservations",
      })
    }
  }, [isAuthenticated, authLoading, router])

  const handleEdit = (reservationId: string) => {
    router.push(`/reservations/edit/${reservationId}`)
  }

  const handleDelete = async (reservationId: string) => {
    try {
      setIsDeleting(true)
      await reservationApi.delete(reservationId)

      // Refresh the list after deletion
      fetchReservations()

      toast({
        title: "Reservation cancelled",
        description: "Your reservation has been cancelled successfully",
      })
    } catch (error: any) {
      console.error("Error deleting reservation:", error)
      toast({
        variant: "destructive",
        title: "Failed to cancel reservation",
        description: error.response?.data?.message || "Please try again",
      })
    } finally {
      setIsDeleting(false)
      setDeleteId(null)
    }
  }

  const formatDate = (dateString: string) => {
    try {
      return format(parseISO(dateString), "PPP")
    } catch (error) {
      return dateString
    }
  }

  const formatTime = (dateString: string) => {
    try {
      return format(parseISO(dateString), "h:mm a")
    } catch (error) {
      return dateString
    }
  }

  const calculateDuration = (startTime: string, endTime: string) => {
    try {
      const start = parseISO(startTime)
      const end = parseISO(endTime)
      const diffInHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60)

      if (diffInHours < 1) {
        return `${Math.round(diffInHours * 60)} minutes`
      }

      return `${diffInHours.toFixed(1)} hours`
    } catch (error) {
      return "Unknown"
    }
  }

  if (authLoading || loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-full max-w-md" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="flex flex-col space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-primary">Your Reservation History</CardTitle>
          <CardDescription>View and manage all your restaurant reservations</CardDescription>
        </CardHeader>
        <CardContent>
          {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

          {reservations.length === 0 ? (
            <div className="text-center py-12">
              <Calendar className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No reservations found</h3>
              <p className="text-muted-foreground mb-6">You haven't made any reservations yet.</p>
              <Button onClick={() => router.push("/")}>Browse Restaurants</Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableCaption>A list of your recent reservations</TableCaption>
                <TableHeader>
                  <TableRow>
                    <TableHead>Restaurant</TableHead>
                    <TableHead>Date & Time</TableHead>
                    <TableHead>Party Size</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reservations.map((reservation) => (
                    <TableRow key={reservation._id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center space-x-3">
                          <div className="h-10 w-10 rounded-md overflow-hidden bg-muted">
                            {reservation.restaurant?.image ? (
                              <img
                                src={reservation.restaurant.image || "/placeholder.svg"}
                                alt={reservation.restaurant?.name}
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center bg-primary/10">
                                <MapPin className="h-5 w-5 text-primary" />
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="font-medium">{reservation.restaurant?.name || "Unknown Restaurant"}</div>
                            <div className="text-xs text-muted-foreground">{reservation.restaurant?.address}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">{formatDate(reservation.startTime)}</span>
                          <span className="text-sm text-muted-foreground flex items-center">
                            <Clock className="h-3 w-3 mr-1" /> {formatTime(reservation.startTime)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Users className="h-4 w-4 mr-1 text-muted-foreground" />
                          <span>
                            {reservation.seats} {reservation.seats === 1 ? "person" : "people"}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>{calculateDuration(reservation.startTime, reservation.endTime)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() => handleEdit(reservation._id)}
                            title="Edit reservation"
                          >
                            <Edit className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Button>

                          <AlertDialog
                            open={deleteId === reservation._id}
                            onOpenChange={(open) => !open && setDeleteId(null)}
                          >
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="icon"
                                className="text-destructive border-destructive hover:bg-destructive/10"
                                title="Cancel reservation"
                                onClick={() => setDeleteId(reservation._id)}
                              >
                                <Trash2 className="h-4 w-4" />
                                <span className="sr-only">Delete</span>
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Cancel Reservation</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to cancel your reservation at {reservation.restaurant?.name}?
                                  This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Keep Reservation</AlertDialogCancel>
                                <AlertDialogAction
                                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  onClick={() => handleDelete(reservation._id)}
                                  disabled={isDeleting}
                                >
                                  {isDeleting ? (
                                    <>
                                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Cancelling...
                                    </>
                                  ) : (
                                    "Cancel Reservation"
                                  )}
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
