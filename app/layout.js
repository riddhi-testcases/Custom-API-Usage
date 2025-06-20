export const metadata = {
  title: "Task Management System",
  description: "Professional Task Management System with Custom API",
    generator: 'v0.dev'
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}


import './globals.css'