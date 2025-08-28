'use client'

import { useState } from 'react'

interface ProductForm {
  name: string
  price: number
  currency: string
  discount: number
  tax_category: string
}

interface ProductCreationProps {
  onProductCreated?: (productId: string) => void
}

export default function ProductCreation({ onProductCreated }: ProductCreationProps) {
  const [formData, setFormData] = useState<ProductForm>({
    name: '',
    price: 0,
    currency: 'USD',
    discount: 0,
    tax_category: 'digital_products'
  })
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [createdProduct, setCreatedProduct] = useState<{
    id: string
    name: string
    brand_id: string
    price: {
      currency: string
      price: number
      discount: number
      type: string
    }
    tax_category: string
  } | null>(null)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' || name === 'discount' ? Number(value) : value
    }))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')
    setCreatedProduct(null)

    try {
      const response = await fetch('/api/products/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (data.success) {
        setMessage('Product created successfully!')
        setCreatedProduct(data.product)
        if (onProductCreated) {
          onProductCreated(data.product.id)
        }
        // Reset form
        setFormData({
          name: '',
          price: 0,
          currency: 'USD',
          discount: 0,
          tax_category: 'digital_products'
        })
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

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-xl font-semibold mb-4">Create New Product</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Product Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            required
            placeholder="Enter product name"
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-black"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Price</label>
            <input
              type="number"
              name="price"
              min="0"
              step="0.01"
              value={formData.price}
              onChange={handleInputChange}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-black"
            />
            <p className="mt-1 text-xs text-gray-500">Enter price in major units (e.g., 10.99 for $10.99)</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Currency</label>
            <select
              name="currency"
              value={formData.currency}
              onChange={handleInputChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white text-black"
            >
              <option value="USD">USD</option>
              <option value="INR">INR</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Discount (%)</label>
            <input
              type="number"
              name="discount"
              min="0"
              max="100"
              step="0.01"
              value={formData.discount}
              onChange={handleInputChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-black"
            />
            <p className="mt-1 text-xs text-gray-500">Enter discount as percentage (e.g., 10 for 10% off)</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Tax Category</label>
                          <select
                name="tax_category"
                value={formData.tax_category}
                onChange={handleInputChange}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white text-black"
              >
                <option value="digital_products">Digital Products</option>
                <option value="saas">SaaS</option>
                <option value="e_book">E-Book</option>
                <option value="edtech">EdTech</option>
              </select>
          </div>
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white font-medium py-2 px-4 rounded-md transition-colors duration-200"
        >
          {loading ? 'Creating Product...' : 'Create Product'}
        </button>
      </form>

      {message && (
        <div className={`mt-4 p-4 rounded-md ${
          message.includes('Error') 
            ? 'bg-red-50 border border-red-200 text-red-800' 
            : 'bg-green-50 border border-green-200 text-green-800'
        }`}>
          <p className="text-sm">{message}</p>
        </div>
      )}

      {createdProduct && (
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
          <h3 className="text-sm font-medium text-blue-800 mb-2">Product Created Successfully!</h3>
                      <div className="text-xs text-blue-700 space-y-1">
              <p><strong>Product Name:</strong> {createdProduct.name}</p>
              <p><strong>Product ID:</strong> {createdProduct.id}</p>
              <p><strong>Brand ID:</strong> {createdProduct.brand_id}</p>
              <p><strong>Price:</strong> {createdProduct.price.currency} {(createdProduct.price.price / 100).toFixed(2)}</p>
              {createdProduct.price.discount > 0 && (
                <p><strong>Discount:</strong> {createdProduct.price.discount}%</p>
              )}
              <p><strong>Tax Category:</strong> {createdProduct.tax_category}</p>
              <p><strong>Type:</strong> {createdProduct.price.type === 'recurring_price' ? 'Recurring (Monthly)' : 'One-time'}</p>
            </div>
        </div>
      )}
    </div>
  )
}
