import { createFileRoute } from '@tanstack/react-router'
import { useState } from 'react'

export const Route = createFileRoute('/')({
  component: App,
})

export default function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <h1>INDEX</h1>
    </>
  )
}
