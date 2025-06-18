import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"

export default function Home() {
  return (
    <main className="min-h-screen bg-background p-8">
      <div className="container mx-auto">
        <div className="flex justify-end mb-8">
          <ThemeToggle />
        </div>
        <div className="max-w-2xl mx-auto space-y-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
            Welcome to Your Modern Purple App
          </h1>
          <p className="text-lg text-muted-foreground">
            This is a beautiful app with a gradient purple theme that supports both light and dark modes.
          </p>
          <div className="flex gap-4">
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
              Primary Button
            </Button>
            <Button 
              variant="secondary"
              className="bg-secondary text-secondary-foreground hover:bg-secondary/80"
            >
              Secondary Button
            </Button>
          </div>
        </div>
      </div>
    </main>
  )
}
