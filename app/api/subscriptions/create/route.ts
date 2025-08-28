import { NextResponse } from 'next/server'
import dodo from '@/lib/dodoClient'
import { supabaseAdmin } from '@/lib/supabaseClient'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const {
      billing,                
      dodo_customer_id,        
      supabase_user_id,        
      product_id,             
      quantity                 
    } = body

    if (!billing || !product_id) {
      return NextResponse.json({ error: 'billing and product_id are required' }, { status: 400 })
    }

    let customer_id = dodo_customer_id

    if (!customer_id && supabase_user_id) {
      const { data: customerMap, error } = await supabaseAdmin
        .from('customers')
        .select('dodo_customer_id')
        .eq('id', supabase_user_id)
        .single()

      if (error || !customerMap?.dodo_customer_id) {
        return NextResponse.json({ error: 'Customer mapping not found' }, { status: 404 })
      }
      customer_id = customerMap.dodo_customer_id
    }

    if (!customer_id) {
      return NextResponse.json({ error: 'dodo_customer_id or supabase_user_id is required' }, { status: 400 })
    }

    const payload = {
      payment_link : true,
      billing,
      customer: { customer_id },
      product_id,
      quantity: typeof quantity === 'number' ? quantity : 1
    }

    const resp = await dodo.post('/subscriptions', payload)
    console.log(resp.data.payment_link)
    const sub = resp.data

    await supabaseAdmin
      .from('subscriptions')
      .upsert({
        dodo_subscription_id: sub.subscription_id || sub.id,
        dodo_customer_id: customer_id,
        product_id: sub.product_id || product_id,
        status: sub.status || 'active',
        billing_currency: sub.billing_currency || null,
        current_period_start: sub.current_period_start ? new Date(sub.current_period_start).toISOString() : null,
        current_period_end: sub.current_period_end ? new Date(sub.current_period_end).toISOString() : null,
        next_billing_date: sub.next_billing_date ? new Date(sub.next_billing_date).toISOString() : null
      }, { onConflict: 'dodo_subscription_id' })

    return NextResponse.json({ success: true, link: sub?.payment_link || null })
  } catch (err) {
    console.error('Create subscription error:', (err as any).response?.data || (err as Error).message)
    return NextResponse.json(
      { error: 'Failed to create subscription', details: (err as any).response?.data || (err as Error).message },
      { status: 500 }
    )
  }
}


