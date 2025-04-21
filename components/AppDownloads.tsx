import { Button } from "@/components/ui/button"
import { Apple, Smartphone } from "lucide-react"

export default function AppDownloads() {
  return (
    <section className="py-16 bg-muted/50" id="app-download">
      <div className="container px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-6">
            For Better Experience Download <br /> Tomato App
          </h2>
          <p className="text-muted-foreground mb-8">
            Get the full experience with our mobile app. Find restaurants, make reservations, and get exclusive offers
            on the go.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button variant="outline" size="lg" className="flex items-center gap-2 px-6">
              <Smartphone className="h-5 w-5" />
              <div className="flex flex-col items-start">
                <span className="text-xs">Get it on</span>
                <span className="font-medium">Google Play</span>
              </div>
            </Button>
            <Button variant="outline" size="lg" className="flex items-center gap-2 px-6">
              <Apple className="h-5 w-5" />
              <div className="flex flex-col items-start">
                <span className="text-xs">Download on the</span>
                <span className="font-medium">App Store</span>
              </div>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
