import Link from "next/link"
import { Button } from "@/components/ui/button"
import { SpaceParticles } from "@/components/space-particles"

export default function HomePage() {
  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center gap-16 p-8 bg-gradient-to-br from-background/50 to-background">
      <SpaceParticles />
      {/* Logo and Slogan Section */}
      <section className="text-center space-y-6 relative z-10">
        <div className="relative">
          <h1 className="font-title text-6xl md:text-7xl font-bold tracking-tight">
            <span className="bg-gradient-to-r from-primary-gradient-from to-primary-gradient-to bg-clip-text text-transparent inline-block hover:scale-105 transition-transform duration-300">
              CL
            </span>
            <span className="bg-gradient-to-r from-primary-gradient-from to-primary-gradient-to bg-clip-text text-transparent inline-block hover:scale-105 transition-transform duration-300 ml-2">
              Gen
            </span>
          </h1>
          <div className="absolute -inset-x-8 -inset-y-4 bg-gradient-to-r from-primary-gradient-from/20 to-primary-gradient-to/20 blur-2xl -z-10" />
        </div>
        <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl leading-relaxed">
          Create personalized cover letters in minutes. Stand out from the crowd with AI-powered professional writing.
        </p>
      </section>

      {/* Generator Button Section */}
      <section className="text-center relative z-10">
        <Link href="/generator">
          <Button 
            size="lg" 
            className="text-lg px-8 py-6 transition-all duration-300 hover:scale-105 hover:shadow-lg"
          >
            Create Your Cover Letter
          </Button>
        </Link>
      </section>
    </main>
  )
}
