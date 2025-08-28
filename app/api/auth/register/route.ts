import { supabaseAdmin } from '@/lib/supabaseClient'
import dodo from '@/lib/dodoClient'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { email, password, name } = await request.json()

    if (!email || !password || !name) {
      return NextResponse.json(
        { error: 'Email, password, and name are required' },
        { status: 400 }
      )
    }

    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      user_metadata: { name },
      email_confirm: true
    })

    if (authError) {
      console.error('Auth error:', authError)
      return NextResponse.json(
        { error: 'Failed to create user', details: authError.message },
        { status: 400 }
      )
    }

    const user = authData.user

    const { error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .insert([
        {
          id: user.id,
          full_name: name,
          email: user.email
        }
      ])

    if (profileError) {
      console.error('Profile creation error:', profileError)
    }

    // 3. Create customer in Dodo Payments
    let dodoCustomerId = null
    try {
      const dodoResponse = await dodo.post('/customers', {
        email: user.email,
        name: name,
        metadata: { 
          supabase_user_id: user.id,
          created_at: new Date().toISOString()
        }
      })
      
      dodoCustomerId = dodoResponse.data.customer_id  
      console.log('Dodo customer created with ID:', dodoCustomerId)
    } catch (dodoError) {
      console.error('Dodo API error:', (dodoError as any).response?.data || (dodoError as Error).message)
    }

    if (dodoCustomerId) {
      const { error: dbError } = await supabaseAdmin
        .from('customers')
        .insert([
          { 
            id: user.id, 
            dodo_customer_id: dodoCustomerId
          }
        ])

      if (dbError) {
        console.error('Database error:', dbError)
      }
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: name
      },
      dodoCustomerId,
      message: 'User created successfully'
    })

  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: (error as Error).message },
      { status: 500 }
    )
  }
}
