export const metadata = {
  title: 'Click To Earn',
  description: 'Advanced High-CPM Monetization Suite',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" style={{ backgroundColor: '#0b0f19', margin: 0, padding: 0 }}>
      <body style={{ backgroundColor: '#0b0f19', margin: 0, padding: 0, overflowX: 'hidden' }}>
        {children}
      </body>
    </html>
  );
}
