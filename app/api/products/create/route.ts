import { NextResponse } from 'next/server'
import dodo from '@/lib/dodoClient'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, price, currency = 'USD', discount, tax_category = 'digital_products' } = body

    if (!['USD', 'INR'].includes(currency)) {
      return NextResponse.json(
        { error: 'Only USD and INR currencies are supported' },
        { status: 400 }
      )
    }

    if (!name || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'Product name is required' },
        { status: 400 }
      )
    }

    if (!price || price < 0) {
      return NextResponse.json(
        { error: 'Price is required and must be non-negative' },
        { status: 400 }
      )
    }

    if (discount < 0 || discount > 100) {
      return NextResponse.json(
        { error: 'Discount must be between 0 and 100 (percentage)' },
        { status: 400 }
      )
    }

    const payload = {
      name: name.trim(),
      price: { 
        currency, 
        discount: discount, 
        price: Math.round(price * 100),
        purchasing_power_parity: true, 
        payment_frequency_count: 1, 
        payment_frequency_interval: "Month",
        subscription_period_count: 1,
        subscription_period_interval: "Month",
        type: 'recurring_price' 
      },
      tax_category,
    }

    const resp = await dodo.post('/products', payload)
    const product = resp.data
    


    return NextResponse.json({
      success: true,
      product: {
        id: product.id || product.product_id,
        name: product.name,
        brand_id: product.brand_id,
        price: product.price,
        tax_category: product.tax_category,
        created_at: product.created_at
      }
    })

  } catch (err) {
    console.error('Create product error:', (err as any).response?.data || (err as Error).message)
    return NextResponse.json(
      { error: 'Failed to create product', details: (err as any).response?.data || (err as Error).message },
      { status: 500 }
    )
  }
}
