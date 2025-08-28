import dodo from '@/lib/dodoClient'
import { supabase } from '@/lib/supabaseClient'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { user } = await request.json()

    // Create customer in Dodo
    const response = await dodo.post('/customers', {
      email: user.email,
      name: user.name,
      metadata: { supabase_user_id: user.id }
    })

    const dodoCustomerId = response.data.id

    await supabase.from('customers').insert([
      { id: user.id, dodo_customer_id: dodoCustomerId }
    ])

    return NextResponse.json({ dodoCustomerId })
  } catch (err) {
    console.error((err as any).response?.data || (err as Error).message)
    return NextResponse.json(
      { error: 'Failed to create customer' },
      { status: 500 }
    )
  }
}
