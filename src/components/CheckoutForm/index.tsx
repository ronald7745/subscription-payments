'use client'
import { useState, useEffect } from 'react'
import { PaymentElement, LinkAuthenticationElement, useStripe, useElements } from '@stripe/react-stripe-js'
import Image from 'next/image'
import style from './checkoutForm.module.scss'

export default function CheckoutForm ({ setMessage }: { setMessage: Function }) {
  const stripe = useStripe()
  const elements = useElements()
  // const [email, setEmail] = useState<any>('')
  const [isLoading, setIsLoading] = useState<any>(false)

  useEffect(() => {
    if (!stripe) {
      return
    }

    const clientSecret = new URLSearchParams(window.location.search).get('payment_intent_client_secret')

    if (!clientSecret) {
      return
    }

    stripe.retrievePaymentIntent(clientSecret).then(({ paymentIntent }: any) => {
      switch (paymentIntent.status) {
        case 'succeeded':
          setMessage('Payment succeeded!')
          break
        case 'processing':
          setMessage('Your payment is processing.')
          break
        case 'requires_payment_method':
          setMessage('Your payment was not successful, please try again.')
          break
        default:
          setMessage('Something went wrong.')
          break
      }
    })
  }, [stripe])

  const handleSubmit = async (e: any) => {
    e.preventDefault()

    if (!stripe || !elements) {
      // Stripe.js has not yet loaded.
      // Make sure to disable form submission until Stripe.js has loaded.
      return
    }

    setIsLoading(true)
    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        // Make sure to change this to your payment completion page
        return_url: 'https://subscription-payments-ronald7745.vercel.app/custom'
      }
    })

    // This point will only be reached if there is an immediate error when
    // confirming the payment. Otherwise, your customer will be redirected to
    // your `return_url`. For some payment methods like iDEAL, your customer will
    // be redirected to an intermediate site first to authorize the payment, then
    // redirected to the `return_url`.
    if (error.type === 'card_error' || error.type === 'validation_error') {
      setMessage(error.message)
    } else {
      setMessage('An unexpected error occurred.')
    }

    setIsLoading(false)
  }

  const paymentElementOptions: any = {
    layout: 'tabs'
  }

  return (
    <form className={style.form} onSubmit={handleSubmit}>
      <Image width='300' height='200' src='https://i.imgur.com/J4MY1D7.png' alt='31 Image' priority />
      <div>
        <p className={style.priceTag}>$10.00 | per month</p>
        <p className={style.description}>Lorem, ipsum dolor sit amet consectetur adipisicing elit. Eos consequatur excepturi deserunt quos deleniti provident explicabo animi eius eligendi veniam totam ipsam dolore, ea nulla iure expedita! Aspernatur, delectus incidunt?</p>
      </div>
      <div>
        <LinkAuthenticationElement />
        <PaymentElement options={paymentElementOptions} />
        <button disabled={isLoading || !stripe || !elements} className={style.button}>
          <span>
            {isLoading ? 'Loading...' : 'Pay now'}
          </span>
        </button>
      </div>
    </form>
  )
}
