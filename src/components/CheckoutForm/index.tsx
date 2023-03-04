'use client'
import { useState, useEffect } from 'react'
import { PaymentElement, LinkAuthenticationElement, useStripe, useElements } from '@stripe/react-stripe-js'

export default function CheckoutForm () {
  const stripe = useStripe()
  const elements = useElements()

  const [email, setEmail] = useState<any>('')
  const [message, setMessage] = useState<any>(null)
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

  const handleSubmit = async (e:any) => {
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
        return_url: 'http://localhost:3000'
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
    <form id='payment-form' onSubmit={handleSubmit}>
      <LinkAuthenticationElement
        id='link-authentication-element'
        onChange={(e:any) => setEmail(e.target.value)}
      />
      <PaymentElement id='payment-element' options={paymentElementOptions} />
      <button disabled={isLoading || !stripe || !elements} id='submit'>
        <span id='button-text'>
          {isLoading ? <div className='spinner' id='spinner'>{}</div> : 'Pay now'}
        </span>
      </button>
      {/* Show any error or success messages */}
      {message && <div id='payment-message'>{message}</div>}
    </form>
  )
}

// 'use client'
// import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js'
// import Image from 'next/image'
// import style from './checkoutForm.module.scss'

// export default function CheckoutForm () {
//   const stripe = useStripe()
//   const elements: any = useElements()
//   const price = 100

//   const handleSubmit = async (e: any) => {
//     e.preventDefault()
//     const { error, paymentMethod: { id } }: any = await stripe?.createPaymentMethod({
//       type: 'card',
//       card: elements.getElement(CardElement)
//     })

//     if (!error) {
//       console.log(id)
//     }
//   }

//   return (
//     <form onSubmit={handleSubmit} className={style.form}>
//       <Image width='350' height='350' src='https://i.imgur.com/HdhgbOk.png' alt='31 Image' priority />
//       <p className={style.priceTag}>${price}</p>
//       <CardElement className={style.cardElement} />
//       <button className={style.button}>Buy</button>
//     </form>

//   )
// }