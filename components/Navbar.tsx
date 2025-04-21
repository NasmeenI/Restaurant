"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Menu, X, ShoppingBag, User, Home, CalendarClock, LogIn, LogOut } from "lucide-react"
import { ThemeToggle } from "./theme-toggle"
import { Button } from "./ui/button"
import { cn } from "@/lib/utils"
import { LoginModal } from "./auth/login-modal"
import { SignupModal } from "./auth/signup-modal"
import { useAuth } from "@/context/auth-context"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export default function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false)
  const [showSignupModal, setShowSignupModal] = useState(false)

  const { user, isAuthenticated, logout } = useAuth()

  // Add scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const openLoginModal = () => {
    setShowLoginModal(true)
    setIsMenuOpen(false)
  }

  const openSignupModal = () => {
    setShowSignupModal(true)
    setIsMenuOpen(false)
  }

  const handleLogout = () => {
    logout()
    setIsMenuOpen(false)
  }

  return (
    <>
      <header
        className={cn(
          "sticky top-0 z-50 w-full transition-all duration-300",
          scrolled
            ? "bg-background/95 backdrop-blur-md shadow-sm supports-[backdrop-filter]:bg-background/60"
            : "bg-background",
        )}
      >
        <div className="container flex h-16 items-center justify-between px-4">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold text-primary">Tomato</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/" className="text-sm font-medium transition-colors hover:text-primary flex items-center">
              <Home className="h-4 w-4 mr-1" />
              Home
            </Link>
            <Link
              href="/reservations/history"
              className="text-sm font-medium transition-colors hover:text-primary flex items-center"
            >
              <CalendarClock className="h-4 w-4 mr-1" />
              Reservation History
            </Link>
          </nav>

          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <Button variant="ghost" size="icon" className="relative">
              <ShoppingBag className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-[10px] font-medium text-primary-foreground flex items-center justify-center">
                0
              </span>
            </Button>

            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>{user?.username || "My Account"}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/reservations/history">My Reservations</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/profile">Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive">
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button className="hidden md:flex items-center" onClick={openLoginModal}>
                <LogIn className="h-4 w-4 mr-2" />
                Login
              </Button>
            )}

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle Menu"
            >
              {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Navigation - Improved Design */}
        <div
          className={cn(
            "fixed inset-x-0 top-16 z-50 overflow-hidden bg-background/95 backdrop-blur-md md:hidden transition-all duration-300 ease-in-out border-t",
            isMenuOpen ? "max-h-[300px] opacity-100" : "max-h-0 opacity-0",
          )}
        >
          <div className="container px-4 py-6">
            <div className="grid gap-6">
              <Link
                href="/"
                className="flex items-center space-x-2 rounded-md p-2 hover:bg-muted transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                <Home className="h-5 w-5 text-primary" />
                <span className="font-medium">Home</span>
              </Link>
              <Link
                href="/reservations/history"
                className="flex items-center space-x-2 rounded-md p-2 hover:bg-muted transition-colors"
                onClick={() => setIsMenuOpen(false)}
              >
                <CalendarClock className="h-5 w-5 text-primary" />
                <span className="font-medium">Reservation History</span>
              </Link>

              <div className="border-t pt-4 mt-2 grid gap-2">
                {isAuthenticated ? (
                  <Button className="w-full" variant="destructive" size="lg" onClick={handleLogout}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </Button>
                ) : (
                  <>
                    <Button className="w-full" size="lg" onClick={openLoginModal}>
                      <LogIn className="h-4 w-4 mr-2" />
                      Login
                    </Button>
                    <Button className="w-full" variant="outline" size="lg" onClick={openSignupModal}>
                      <User className="h-4 w-4 mr-2" />
                      Sign Up
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Backdrop for mobile menu */}
        {isMenuOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/20 md:hidden"
            onClick={() => setIsMenuOpen(false)}
            aria-hidden="true"
          />
        )}
      </header>

      {/* Auth Modals */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onOpenSignup={() => {
          setShowLoginModal(false)
          setShowSignupModal(true)
        }}
      />

      <SignupModal
        isOpen={showSignupModal}
        onClose={() => setShowSignupModal(false)}
        onOpenLogin={() => {
          setShowSignupModal(false)
          setShowLoginModal(true)
        }}
      />
    </>
  )
}
