import { supabaseAdmin } from '@/lib/supabaseClient'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    const { data: profileData, error: profileError } = await supabaseAdmin
      .from('user_profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (profileError) {
      console.error('Profile lookup error:', profileError)
      return NextResponse.json(
        { error: 'Failed to fetch profile data' },
        { status: 500 }
      )
    }

    const { data: customerData, error: customerError } = await supabaseAdmin
      .from('customers')
      .select('*')
      .eq('id', userId)
      .single()

    if (customerError) {
      console.error('Customer lookup error:', customerError)
    }

    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.getUserById(userId)
    
    if (userError) {
      console.error('User lookup error:', userError)
      return NextResponse.json(
        { error: 'Failed to fetch user data' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      user: {
        id: userData.user.id,
        email: profileData?.email || userData.user.email,
        name: profileData?.full_name || userData.user.user_metadata?.name || 'Unknown',
        created_at: userData.user.created_at,
        dodo_customer_id: customerData?.dodo_customer_id || null,
        has_dodo_account: !!customerData?.dodo_customer_id
      }
    })

  } catch (error) {
    console.error('Profile fetch error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: (error as Error).message },
      { status: 500 }
    )
  }
}
