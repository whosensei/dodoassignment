'use client'

import { useState, useEffect } from 'react'
import Dashboard from './components/Dashboard'
import AuthForm from './components/AuthForm'

interface User {
  id: string
  email: string
  name: string
  created_at: string
  dodo_customer_id: string | null
  has_dodo_account: boolean
}

export default function Home() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  // Check if user is already logged in
  useEffect(() => {
    const checkUser = async () => {
      const token = localStorage.getItem('supabase.auth.token')
      if (token) {
        try {
          const parsed = JSON.parse(token)
          if (parsed.currentSession?.user) {
            await fetchUserProfile(parsed.currentSession.user.id)
          }
        } catch (error) {
          console.error('Error parsing stored token:', error)
          localStorage.removeItem('supabase.auth.token')
        }
      }
    }
    checkUser()
  }, [])

  const fetchUserProfile = async (userId: string) => {
    try {
      const response = await fetch(`/api/user/profile?userId=${userId}`)
      const data = await response.json()
      if (data.success) {
        setUser(data.user)
      }
    } catch (error) {
      console.error('Error fetching user profile:', error)
    }
  }

  const handleAuthSubmit = async (formData: { email: string; password: string; name: string }, isLogin: boolean) => {
    setLoading(true)
    setMessage('')

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register'
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (data.success) {
        if (isLogin) {
          // Store session for login
          localStorage.setItem('supabase.auth.token', JSON.stringify({
            currentSession: data.session
          }))
          setUser(data.user)
          setMessage('Login successful!')
        } else {
          // For registration, also fetch the full profile
          await fetchUserProfile(data.user.id)
          setMessage(`Registration successful! Customer ID: ${data.dodoCustomerId || 'Not created'}`)
        }
      } else {
        setMessage(`Error: ${data.error}`)
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      setMessage(`Error: ${errorMessage}`)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('supabase.auth.token')
    setUser(null)
    setMessage('Logged out successfully')
  }

  if (user) {
    return <Dashboard user={user} onLogout={handleLogout} />
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            Dodo Payments + Supabase
          </h1>
          <p className="text-gray-600 mb-8">
            Create a new account with automatic Dodo customer creation
          </p>
        </div>
        
        <AuthForm 
          onSubmit={handleAuthSubmit}
          loading={loading}
        />
        
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>This demo automatically creates Dodo customers for new users</p>
        </div>
      </div>
    </div>
  )
}
