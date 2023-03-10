'use client'
import { useState, useEffect } from 'react'
import { stripePromise } from '@/utils'
import { Elements } from '@stripe/react-stripe-js'

// Components
import { CheckoutForm, Modal } from '@/components'

export default function Custom () {
  const [clientSecret, setClientSecret] = useState('')
  const [message, setMessage] = useState<any>(null)

  useEffect(() => {
    fetch('/api/create-payment-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: [{ id: 'price_1MgXFJBHJTjXIRco4uJpPAJa' }] })
    })
      .then(res => res.json())
      .then(data => setClientSecret(data.clientSecret))
  }, [])

  const appearance = {
    theme: 'flat'
  }
  const options: any = {
    clientSecret,
    appearance
  }
  return (
    <div>
      {clientSecret && (
        <Elements options={options} stripe={stripePromise}>
          <CheckoutForm setMessage={setMessage} />
          {message && <Modal message={message} setMessage={setMessage} />}
        </Elements>
      )}
    </div>
  )
}
