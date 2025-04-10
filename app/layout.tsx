import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { SoundProvider } from "@/components/sound-provider"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Chat with Coding Mentors",
  description: "Chat with Hitesh Choudhary and Piyush Garg for coding guidance and advice",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} disableTransitionOnChange>
          <SoundProvider>
            {children}
            <Toaster />
          </SoundProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}


import './globals.css'