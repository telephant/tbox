import { ThemeProvider } from "@/components/theme-provider"
import "./globals.css"
import type { Metadata } from "next"
import { Inter, Cormorant_Garamond } from "next/font/google"

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
})

const cg = Cormorant_Garamond({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-cg",
  weight: ["300", "400", "500", "600", "700"],
})

export const metadata: Metadata = {
  title: "Modern Gradient Purple App",
  description: "A beautiful app with shadcn/ui and tailwind",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <html lang="en" suppressHydrationWarning>
        <head />
        <body className={`${inter.variable} ${cg.variable} font-sans antialiased`}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
        </body>
      </html>
    </>
  )
}
