import { supabase } from './supabase'

// Add test data to the database
export async function addTestData() {
  try {
    // First, let's add all categories
    const { data: categories, error: categoryError } = await supabase
      .from('categories')
      .upsert([
        {
          id: 'electronics',
          name_en: 'Electronics',
          name_fr: 'Électronique',
          name_sw: 'Elektroniki',
          slug: 'electronics',
          color: '#3B82F6',
          is_active: true,
          allows_price: true,
          max_images: 10,
          sort_order: 1
        },
        {
          id: 'vehicles',
          name_en: 'Vehicles',
          name_fr: 'Véhicules',
          name_sw: 'Magari',
          slug: 'vehicles',
          color: '#10B981',
          is_active: true,
          allows_price: true,
          max_images: 15,
          sort_order: 2
        },
        {
          id: 'real-estate',
          name_en: 'Real Estate',
          name_fr: 'Immobilier',
          name_sw: 'Mali isiyohamishika',
          slug: 'real-estate',
          color: '#F59E0B',
          is_active: true,
          allows_price: true,
          max_images: 20,
          sort_order: 3
        },
        {
          id: 'fashion-beauty',
          name_en: 'Fashion & Beauty',
          name_fr: 'Mode et Beauté',
          name_sw: 'Mavazi na Urembo',
          slug: 'fashion-beauty',
          color: '#EC4899',
          is_active: true,
          allows_price: true,
          max_images: 8,
          sort_order: 4
        },
        {
          id: 'home-garden',
          name_en: 'Home & Garden',
          name_fr: 'Maison et Jardin',
          name_sw: 'Nyumba na Bustani',
          slug: 'home-garden',
          color: '#8B5CF6',
          is_active: true,
          allows_price: true,
          max_images: 10,
          sort_order: 5
        },
        {
          id: 'jobs',
          name_en: 'Jobs',
          name_fr: 'Emplois',
          name_sw: 'Kazi',
          slug: 'jobs',
          color: '#06B6D4',
          is_active: true,
          allows_price: false,
          max_images: 5,
          sort_order: 6
        },
        {
          id: 'services',
          name_en: 'Services',
          name_fr: 'Services',
          name_sw: 'Huduma',
          slug: 'services',
          color: '#84CC16',
          is_active: true,
          allows_price: true,
          max_images: 5,
          sort_order: 7
        },
        {
          id: 'agriculture',
          name_en: 'Agriculture',
          name_fr: 'Agriculture',
          name_sw: 'Kilimo',
          slug: 'agriculture',
          color: '#22C55E',
          is_active: true,
          allows_price: true,
          max_images: 10,
          sort_order: 8
        },
        {
          id: 'sports-leisure',
          name_en: 'Sports & Leisure',
          name_fr: 'Sports et Loisirs',
          name_sw: 'Michezo na Burudani',
          slug: 'sports-leisure',
          color: '#F97316',
          is_active: true,
          allows_price: true,
          max_images: 8,
          sort_order: 9
        },
        {
          id: 'books-education',
          name_en: 'Books & Education',
          name_fr: 'Livres et Éducation',
          name_sw: 'Vitabu na Elimu',
          slug: 'books-education',
          color: '#6366F1',
          is_active: true,
          allows_price: true,
          max_images: 5,
          sort_order: 10
        },
        {
          id: 'baby-kids',
          name_en: 'Baby & Kids',
          name_fr: 'Bébé et Enfants',
          name_sw: 'Mtoto na Watoto',
          slug: 'baby-kids',
          color: '#F472B6',
          is_active: true,
          allows_price: true,
          max_images: 8,
          sort_order: 11
        },
        {
          id: 'pets-animals',
          name_en: 'Pets & Animals',
          name_fr: 'Animaux',
          name_sw: 'Wanyamapori na Wanyama',
          slug: 'pets-animals',
          color: '#A855F7',
          is_active: true,
          allows_price: true,
          max_images: 8,
          sort_order: 12
        },
        {
          id: 'health-beauty',
          name_en: 'Health & Beauty',
          name_fr: 'Santé et Beauté',
          name_sw: 'Afya na Urembo',
          slug: 'health-beauty',
          color: '#14B8A6',
          is_active: true,
          allows_price: true,
          max_images: 6,
          sort_order: 13
        },
        {
          id: 'arts-crafts',
          name_en: 'Arts & Crafts',
          name_fr: 'Arts et Artisanat',
          name_sw: 'Sanaa na Ufundi',
          slug: 'arts-crafts',
          color: '#EF4444',
          is_active: true,
          allows_price: true,
          max_images: 8,
          sort_order: 14
        },
        {
          id: 'others',
          name_en: 'Others',
          name_fr: 'Autres',
          name_sw: 'Mengineyo',
          slug: 'others',
          color: '#6B7280',
          is_active: true,
          allows_price: true,
          max_images: 10,
          sort_order: 15
        }
      ])
      .select()

    if (categoryError) throw categoryError

    // Add test user
    const { data: testUser, error: userError } = await supabase
      .from('users')
      .upsert([
        {
          id: 'test-user-1',
          username: 'john_doe',
          full_name: 'John Doe',
          email: 'john@example.com',
          country: 'UG',
          city: 'Kampala',
          reputation_score: 85,
          verification_level: 2,
          successful_transactions: 12,
          phone_verified: true,
          email_verified: true
        }
      ])
      .select()

    if (userError) throw userError

    // Add test posts for multiple categories
    const { data: posts, error: postError } = await supabase
      .from('posts')
      .upsert([
        // Electronics
        {
          id: 'badc31c1-647c-4b14-a5bc-a169464bd502',
          user_id: 'test-user-1',
          category_id: 'electronics',
          title: 'iPhone 14 Pro Max - Like New',
          description: 'Excellent condition iPhone 14 Pro Max, 256GB, Deep Purple. Used for only 3 months, comes with original box, charger, and screen protector. No scratches or dents. Battery health at 98%.',
          price: 1200,
          currency: 'USD',
          is_negotiable: true,
          condition: 'like_new',
          images: ['/placeholder-image.jpg'],
          country: 'UG',
          city: 'Kampala',
          area: 'Nakawa',
          contact_method: 'whatsapp',
          contact_phone: '+256701234567',
          contact_whatsapp: '+256701234567',
          status: 'approved',
          views_count: 15,
          favorites_count: 2
        },
        {
          id: 'electronics-2',
          user_id: 'test-user-1',
          category_id: 'electronics',
          title: 'Samsung Galaxy S23 Ultra',
          description: 'Brand new Samsung Galaxy S23 Ultra, 512GB, Phantom Black. Still in original packaging, never opened. Full warranty included.',
          price: 1100,
          currency: 'USD',
          is_negotiable: false,
          condition: 'new',
          images: ['/placeholder-image.jpg'],
          country: 'UG',
          city: 'Entebbe',
          area: 'Central',
          contact_method: 'email',
          contact_email: 'seller@example.com',
          status: 'approved',
          views_count: 23,
          favorites_count: 5
        },
        {
          id: 'electronics-3',
          user_id: 'test-user-1',
          category_id: 'electronics',
          title: 'MacBook Air M2 2022',
          description: 'MacBook Air with M2 chip, 8GB RAM, 256GB SSD. Perfect for students and professionals. Excellent battery life and performance.',
          price: 950,
          currency: 'USD',
          is_negotiable: true,
          condition: 'good',
          images: ['/placeholder-image.jpg'],
          country: 'KE',
          city: 'Nairobi',
          area: 'Westlands',
          contact_method: 'phone',
          contact_phone: '+254701234567',
          status: 'approved',
          views_count: 45,
          favorites_count: 8
        },
        // Vehicles  
        {
          id: 'vehicles-1',
          user_id: 'test-user-1',
          category_id: 'vehicles',
          title: 'Toyota Corolla 2018 - Excellent Condition',
          description: 'Well maintained Toyota Corolla 2018, automatic transmission, low mileage (45,000 km). Perfect for city driving. All documents available, ready for transfer.',
          price: 18500,
          currency: 'USD',
          is_negotiable: true,
          condition: 'good',
          images: ['/placeholder-image.jpg'],
          country: 'UG',
          city: 'Kampala',
          area: 'Ntinda',
          contact_method: 'phone',
          contact_phone: '+256701234567',
          status: 'approved',
          views_count: 87,
          favorites_count: 12
        },
        {
          id: 'vehicles-2',
          user_id: 'test-user-1',
          category_id: 'vehicles',
          title: 'Honda Civic 2020 - Low Mileage',
          description: 'Honda Civic 2020 in excellent condition. Only 25,000 km on the odometer. One owner, non-smoker, garage kept.',
          price: 22000,
          currency: 'USD',
          is_negotiable: true,
          condition: 'like_new',
          images: ['/placeholder-image.jpg'],
          country: 'UG',
          city: 'Jinja',
          area: 'Main Street',
          contact_method: 'phone',
          contact_phone: '+256701234568',
          status: 'approved',
          views_count: 142,
          favorites_count: 18
        },
        // Fashion & Beauty
        {
          id: 'fashion-1',
          user_id: 'test-user-1',
          category_id: 'fashion-beauty',
          title: 'Designer Handbag Collection',
          description: 'Authentic designer handbags in excellent condition. Various brands including Coach, Michael Kors, and Kate Spade. Perfect for professional and casual wear.',
          price: 150,
          currency: 'USD',
          is_negotiable: true,
          condition: 'good',
          images: ['/placeholder-image.jpg'],
          country: 'KE',
          city: 'Nairobi',
          area: 'Karen',
          contact_method: 'whatsapp',
          contact_whatsapp: '+254701234567',
          status: 'approved',
          views_count: 32,
          favorites_count: 6
        },
        // Home & Garden
        {
          id: 'home-1',
          user_id: 'test-user-1',
          category_id: 'home-garden',
          title: 'Modern Sofa Set - 3 Piece',
          description: 'Beautiful modern sofa set in excellent condition. 3-seater, 2-seater, and single chair. Gray fabric, very comfortable and clean.',
          price: 800,
          currency: 'USD',
          is_negotiable: true,
          condition: 'good',
          images: ['/placeholder-image.jpg'],
          country: 'UG',
          city: 'Kampala',
          area: 'Kololo',
          contact_method: 'phone',
          contact_phone: '+256701234569',
          status: 'approved',
          views_count: 76,
          favorites_count: 14
        },
        // Services
        {
          id: 'services-1',
          user_id: 'test-user-1',
          category_id: 'services',
          title: 'Professional Photography Services',
          description: 'Experienced photographer offering wedding, event, and portrait photography. High-quality equipment and professional editing included.',
          price: 200,
          currency: 'USD',
          is_negotiable: true,
          condition: 'new',
          images: ['/placeholder-image.jpg'],
          country: 'KE',
          city: 'Mombasa',
          area: 'City Center',
          contact_method: 'email',
          contact_email: 'photographer@example.com',
          status: 'approved',
          views_count: 28,
          favorites_count: 4
        },
        // Real Estate
        {
          id: 'realestate-1',
          user_id: 'test-user-1',
          category_id: 'real-estate',
          title: '3 Bedroom House for Rent',
          description: 'Spacious 3 bedroom house in quiet neighborhood. Modern amenities, parking space, and garden. Perfect for families.',
          price: 1200,
          currency: 'USD',
          is_negotiable: false,
          condition: 'good',
          images: ['/placeholder-image.jpg'],
          country: 'TZ',
          city: 'Dar es Salaam',
          area: 'Mikocheni',
          contact_method: 'phone',
          contact_phone: '+255701234567',
          status: 'approved',
          views_count: 156,
          favorites_count: 25
        }
      ])
      .select()

    if (postError) throw postError

    console.log('Test data added successfully:', {
      categories: categories?.length,
      users: testUser?.length,
      posts: posts?.length
    })

    return { success: true, posts, categories }
  } catch (error) {
    console.error('Error adding test data:', error)
    return { success: false, error }
  }
}

// Function to get available test posts
export async function getTestPosts() {
  try {
    const { data: posts, error } = await supabase
      .from('posts')
      .select(`
        *,
        user:users(
          id,
          username,
          full_name,
          avatar_url,
          created_at,
          verification_level,
          reputation_score,
          successful_transactions
        )
      `)
      .eq('status', 'approved')
      .limit(20)

    if (error) throw error
    return posts
  } catch (error) {
    console.error('Error fetching test posts:', error)
    return []
  }
} 