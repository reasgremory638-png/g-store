import { useEffect } from 'react'
import './Toast.css'

export default function Toast({ message, onHide }) {
  useEffect(() => {
    if (!message) return
    const timer = setTimeout(onHide, 3000)
    return () => clearTimeout(timer)
  }, [message, onHide])

  if (!message) return null

  return (
    <div className="toast">
      <i className="fa-solid fa-circle-check" />
      {message}
    </div>
  )
}
