import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { ThemeProvider } from "@/components/providers/theme-provider"
import { Toaster } from "@/components/ui/sonner"
import "./globals.css"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
})

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: "MikroORM Visualizer",
  description: "Visualize and explore MikroORM entity relationships",
  icons: {
    icon: "/logo.svg",
    shortcut: "/logo.svg",
  },
}

/**
 * Root layout component that provides global fonts, theme handling, and a toast container for the app.
 *
 * @param children - The page content to render inside the layout
 * @returns The top-level HTML structure (`<html>` and `<body>`) containing a ThemeProvider that applies global theming and fonts, renders `children`, and mounts a bottom-right rich-colored Toaster
 */
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster position="bottom-right" richColors />
        </ThemeProvider>
      </body>
    </html>
  )
}