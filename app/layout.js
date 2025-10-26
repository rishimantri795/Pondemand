
import './styles/globals.css'

export const metadata = {
  title: 'Pondemand',
  description: 'On Demand Conversations with AI',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
