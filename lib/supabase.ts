import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types pour TypeScript
export interface Profile {
  id: string
  email: string
  full_name: string
  role: 'client' | 'restaurant'
  phone?: string
  avatar_url?: string
  created_at: string
}

export interface Restaurant {
  id: string
  user_id: string
  name: string
  slug: string
  description: string
  address: string
  city: string
  phone: string
  email: string
  category: string
  rating: number
  total_reviews: number
  delivery_time: string
  delivery_fee: number
  minimum_order: number
  image_url?: string
  logo_url?: string
  cover_url?: string
  is_active: boolean
  created_at: string
}

// Fonctions utilitaires
export async function getCurrentUser() {
  const { data: { user } } = await supabase.auth.getUser()
  return user
}

export async function getRestaurants(filters: any = {}) {
  try {
    let query = supabase
      .from('restaurants')
      .select('*')
      .eq('is_active', true)

    if (filters.category) {
      query = query.eq('category', filters.category)
    }
    if (filters.search) {
      query = query.ilike('name', `%${filters.search}%`)
    }

    const { data, error } = await query.order('rating', { ascending: false })
    
    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching restaurants:', error)
    return []
  }
}

export async function getRestaurantBySlug(slug: string) {
  try {
    const { data, error } = await supabase
      .from('restaurants')
      .select('*')
      .eq('slug', slug)
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error fetching restaurant:', error)
    return null
  }
}

export async function getMenuItems(restaurantId: string) {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('restaurant_id', restaurantId)
      .eq('is_available', true)
      .order('sort_order')

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching menu items:', error)
    return []
  }
}

export async function createOrder(orderData: any) {
  try {
    const { data, error } = await supabase
      .from('orders')
      .insert([orderData])
      .select()
      .single()

    if (error) throw error
    return data
  } catch (error) {
    console.error('Error creating order:', error)
    throw error
  }
}

export async function getUserOrders(userId: string) {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        restaurant:restaurants(name, address, image_url, phone)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching user orders:', error)
    return []
  }
}
