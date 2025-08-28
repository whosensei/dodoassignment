'use client'

import { useState } from 'react'

interface AuthFormData {
  email: string
  password: string
  name: string
}

interface AuthFormProps {
  onSubmit: (formData: AuthFormData, isLogin: boolean) => Promise<void>
  loading: boolean
}

export default function AuthForm({ onSubmit, loading }: AuthFormProps) {
  const [isLogin, setIsLogin] = useState(false)
  const [formData, setFormData] = useState<AuthFormData>({
    email: '',
    password: '',
    name: ''
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    await onSubmit(formData, isLogin)
    
    if (isLogin) {
      // Clear form for login
      setFormData({ email: '', password: '', name: '' })
    }
  }

  const toggleMode = () => {
    setIsLogin(!isLogin)
    setFormData({ email: '', password: '', name: '' })
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        {!isLogin && (
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
              Full Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-black"
            />
          </div>
        )}
        
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-black"
          />
        </div>
        
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700">
            Password
          </label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            required
            minLength={6}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-black"
          />
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
        >
          {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
        </button>
      </form>
      
      <div className="mt-4 text-center">
        <button
          onClick={toggleMode}
          className="text-sm text-blue-600 hover:text-blue-500"
        >
          {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
        </button>
      </div>
    </div>
  )
}
