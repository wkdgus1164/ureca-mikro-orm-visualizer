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

/**
 * Normalizes and validates the site URL from environment variable.
 * Ensures the URL has a proper scheme (https://) and is valid.
 * Falls back to a known safe default if normalization fails.
 */
function normalizeSiteUrl(): string {
  const DEFAULT_URL = "https://ureca-mikro-orm-visualizer.vercel.app"
  const envUrl = process.env.NEXT_PUBLIC_SITE_URL

  if (!envUrl) {
    return DEFAULT_URL
  }

  try {
    // Check if the URL already has a scheme
    if (envUrl.startsWith("http://") || envUrl.startsWith("https://")) {
      // Validate the URL by constructing it
      new URL(envUrl)
      return envUrl
    }

    // Add https:// scheme if missing
    const normalizedUrl = `https://${envUrl}`
    // Validate the normalized URL
    new URL(normalizedUrl)
    return normalizedUrl
  } catch {
    // If normalization or validation fails, fall back to default
    return DEFAULT_URL
  }
}

const SITE_URL = normalizeSiteUrl()

export const metadata: Metadata = {
  title: {
    default: "MikroORM Visualizer",
    template: "%s | MikroORM Visualizer",
  },
  description:
    "MikroORM 엔티티 관계를 비주얼 에디터로 설계하고, TypeScript 코드와 이미지로 내보낼 수 있는 도구입니다.",
  keywords: [
    "MikroORM",
    "Entity",
    "ORM",
    "TypeScript",
    "Database",
    "ERD",
    "Diagram",
    "Visualizer",
    "Node.js",
  ],
  authors: [{ name: "Ureca Team" }],
  creator: "Ureca Team",
  icons: {
    icon: "/logo.svg",
    shortcut: "/logo.svg",
    apple: "/logo.svg",
  },
  // Open Graph (카카오톡, 페이스북 등)
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: SITE_URL,
    siteName: "MikroORM Visualizer",
    title: "MikroORM Visualizer - 엔티티 관계 시각화 도구",
    description:
      "MikroORM 엔티티 관계를 비주얼 에디터로 설계하고, TypeScript 코드와 이미지로 내보낼 수 있는 도구입니다.",
  },
  // Twitter Card
  twitter: {
    card: "summary_large_image",
    title: "MikroORM Visualizer - 엔티티 관계 시각화 도구",
    description:
      "MikroORM 엔티티 관계를 비주얼 에디터로 설계하고, TypeScript 코드와 이미지로 내보낼 수 있는 도구입니다.",
  },
  // 기타 메타 정보
  robots: {
    index: true,
    follow: true,
  },
  metadataBase: new URL(SITE_URL),
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