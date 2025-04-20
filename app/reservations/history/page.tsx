"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import axios from "axios"
import { format } from "date-fns"
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Trash2, Edit, Calendar, Clock, Users, MapPin } from "lucide-react"
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
  date: string
  time: string
  duration: string
  seats: number
  status: "confirmed" | "pending" | "cancelled"
  createdAt: string
  restaurant?: Restaurant
}

export default function ReservationHistory() {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const router = useRouter()

  // In a real app, these would come from your auth context or environment variables
  const url = process.env.NEXT_PUBLIC_API_URL || "https://api.example.com"
  const token = "your-auth-token" // This would come from your auth context

  const fetchReservations = async () => {
    setLoading(true)
    setError(null)

    try {
      // Fetch user's reservations
      const response = await axios.get(`${url}/reservation`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const reservationsData = response.data

      // Enhance reservations with restaurant data
      const enhancedReservationsPromises = reservationsData.map(async (reservation: Reservation) => {
        try {
          const restaurantResponse = await axios.get(`${url}/restaurants/${reservation.restaurantId}`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })

          return {
            ...reservation,
            restaurant: restaurantResponse.data.restaurant,
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
    fetchReservations()
  }, [])

  const handleEdit = (reservationId: string) => {
    router.push(`/reservations/edit/${reservationId}`)
  }

  const handleDelete = async (reservationId: string) => {
    try {
      await axios.delete(`${url}/reservation/${reservationId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      // Refresh the list after deletion
      fetchReservations()
    } catch (error) {
      console.error("Error deleting reservation:", error)
      setError("Failed to delete reservation. Please try again.")
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return <Badge className="bg-green-500">Confirmed</Badge>
      case "pending":
        return (
          <Badge variant="outline" className="text-yellow-600 border-yellow-600">
            Pending
          </Badge>
        )
      case "cancelled":
        return <Badge variant="destructive">Cancelled</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "PPP")
    } catch (error) {
      return dateString
    }
  }

  if (loading) {
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
              <Button onClick={() => router.push("/restaurants")}>Browse Restaurants</Button>
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
                    <TableHead>Status</TableHead>
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
                          <span className="font-medium">{formatDate(reservation.date)}</span>
                          <span className="text-sm text-muted-foreground flex items-center">
                            <Clock className="h-3 w-3 mr-1" /> {reservation.time}
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
                      <TableCell>{reservation.duration}</TableCell>
                      <TableCell>{getStatusBadge(reservation.status)}</TableCell>
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

                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="icon"
                                className="text-destructive border-destructive hover:bg-destructive/10"
                                title="Cancel reservation"
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
                                >
                                  Cancel Reservation
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
