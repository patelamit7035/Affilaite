import './globals.css'

export const metadata = {
  title: 'FunnelOS Affiliate',
  description: 'Simple affiliate lead tracking portal for FunnelOS'
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
