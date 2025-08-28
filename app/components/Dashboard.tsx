'use client'

import { useState } from 'react'
import UserProfile from './UserProfile'
import ProductCreation from './ProductCreation'
import SubscriptionCreation from './SubscriptionCreation'

interface SubscriptionForm {
  product_id: string
  quantity: number
  billing_city: string
  billing_country: string
  billing_state: string
  billing_street: string
  billing_zipcode: string
}

interface User {
  id: string
  email: string
  name: string
  created_at: string
  dodo_customer_id: string | null
  has_dodo_account: boolean
}

interface DashboardProps {
  user: User
  onLogout: () => void
}

export default function Dashboard({ user, onLogout }: DashboardProps) {
  const [subMessage, setSubMessage] = useState('')
  const [subLink, setSubLink] = useState<string | null>(null)

  const handleProductCreated = (productId: string) => {
    // Product created successfully - could be used for other purposes if needed
    console.log('Product created:', productId)
  }

  const handleSubscriptionSubmit = async (formData: SubscriptionForm) => {
    try {
      const payload: {
        billing: {
          city: string
          country: string
          state: string
          street: string
          zipcode: string
        }
        product_id: string
        quantity: number
        dodo_customer_id?: string
        supabase_user_id?: string
      } = {
        billing: {
          city: formData.billing_city,
          country: formData.billing_country,
          state: formData.billing_state,
          street: formData.billing_street,
          zipcode: formData.billing_zipcode
        },
        product_id: formData.product_id,
        quantity: formData.quantity || 1
      }

      if (user.dodo_customer_id) {
        payload.dodo_customer_id = user.dodo_customer_id
      } else {
        payload.supabase_user_id = user.id
      }

      const res = await fetch('/api/subscriptions/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data?.error || 'Subscription creation failed')
      
      setSubMessage('Subscription created successfully')
      setSubLink(data?.link || null)
      
      // Auto-redirect after 3 seconds
      if (data?.link) {
        setTimeout(() => {
          window.location.href = data.link
        }, 3000)
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Unknown error'
      throw new Error(msg)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            Welcome, {user.name}!
          </h1>
          <p className="text-gray-600 mb-8">
            Your account is successfully linked with Dodo Payments
          </p>
        </div>
        
        <UserProfile user={user} onLogout={onLogout} />

        <ProductCreation onProductCreated={handleProductCreated} />

        <SubscriptionCreation 
          onSubmit={handleSubscriptionSubmit}
        />

        {subMessage && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-sm text-blue-800">{subMessage}</p>
          </div>
        )}
        
        {subLink && (
          <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
            <p className="text-sm text-green-800">
              Payment link: <a href={subLink} target="_blank" rel="noopener noreferrer" className="underline break-all">{subLink}</a>
            </p>
            <p className="text-xs text-green-700 mt-1">Redirecting in 3 seconds…</p>
          </div>
        )}
      </div>
    </div>
  )
}
