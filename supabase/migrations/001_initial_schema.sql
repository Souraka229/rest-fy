-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enable PostGIS for geolocation
CREATE EXTENSION IF NOT EXISTS postgis;

-- Profiles table (extends auth.users)
CREATE TABLE profiles (
    id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    full_name TEXT,
    phone TEXT,
    avatar_url TEXT,
    role TEXT CHECK (role IN ('client', 'restaurant')) DEFAULT 'client',
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Restaurants table
CREATE TABLE restaurants (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    logo_url TEXT,
    cover_url TEXT,
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    phone TEXT NOT NULL,
    email TEXT NOT NULL,
    category TEXT NOT NULL,
    rating DECIMAL(2,1) DEFAULT 0,
    total_reviews INTEGER DEFAULT 0,
    delivery_time TEXT DEFAULT '30-45 min',
    delivery_fee DECIMAL(10,2) DEFAULT 0,
    minimum_order DECIMAL(10,2) DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    subscription_plan TEXT DEFAULT 'free',
    location GEOGRAPHY(POINT),
    opening_hours JSONB DEFAULT '{}',
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Menu categories
CREATE TABLE menu_categories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Products/Menu items
CREATE TABLE products (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE NOT NULL,
    category_id UUID REFERENCES menu_categories(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    image_url TEXT,
    is_available BOOLEAN DEFAULT true,
    preparation_time INTEGER DEFAULT 15,
    allergens TEXT[],
    nutritional_info JSONB DEFAULT '{}',
    customizations JSONB DEFAULT '[]',
    sort_order INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Orders table
CREATE TABLE orders (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    order_number TEXT UNIQUE NOT NULL,
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE NOT NULL,
    status TEXT CHECK (status IN ('pending', 'confirmed', 'preparing', 'ready', 'delivering', 'completed', 'cancelled')) DEFAULT 'pending',
    service_type TEXT CHECK (service_type IN ('delivery', 'pickup', 'dine_in')) DEFAULT 'delivery',
    
    -- Customer information
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_email TEXT,
    delivery_address TEXT,
    delivery_coordinates GEOGRAPHY(POINT),
    special_instructions TEXT,
    
    -- Order details
    items_total DECIMAL(10,2) NOT NULL,
    delivery_fee DECIMAL(10,2) DEFAULT 0,
    tax_amount DECIMAL(10,2) DEFAULT 0,
    discount_amount DECIMAL(10,2) DEFAULT 0,
    total_amount DECIMAL(10,2) NOT NULL,
    
    -- Payment information
    payment_method TEXT CHECK (payment_method IN ('card', 'mobile_money', 'cash')),
    payment_status TEXT CHECK (payment_status IN ('pending', 'paid', 'failed', 'refunded')) DEFAULT 'pending',
    payment_transaction_id TEXT,
    
    -- Timestamps
    estimated_delivery_time TIMESTAMPTZ,
    accepted_at TIMESTAMPTZ,
    prepared_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Order items
CREATE TABLE order_items (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    order_id UUID REFERENCES orders(id) ON DELETE CASCADE NOT NULL,
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    product_name TEXT NOT NULL,
    product_price DECIMAL(10,2) NOT NULL,
    quantity INTEGER NOT NULL,
    customizations JSONB DEFAULT '{}',
    special_notes TEXT,
    total_price DECIMAL(10,2) NOT NULL
);

-- Reviews table
CREATE TABLE reviews (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE NOT NULL,
    order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
    
    -- Ratings
    rating INTEGER CHECK (rating >= 1 AND rating <= 5) NOT NULL,
    quality_rating INTEGER CHECK (quality_rating >= 1 AND quality_rating <= 5),
    speed_rating INTEGER CHECK (speed_rating >= 1 AND speed_rating <= 5),
    service_rating INTEGER CHECK (service_rating >= 1 AND service_rating <= 5),
    
    -- Review content
    comment TEXT,
    images TEXT[],
    
    -- Verification
    is_verified BOOLEAN DEFAULT false,
    restaurant_reply TEXT,
    reply_created_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Favorites table
CREATE TABLE favorites (
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (user_id, restaurant_id)
);

-- Reservations table
CREATE TABLE reservations (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE NOT NULL,
    
    -- Reservation details
    date DATE NOT NULL,
    time TIME NOT NULL,
    guests_count INTEGER NOT NULL,
    special_requests TEXT,
    
    -- Status
    status TEXT CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')) DEFAULT 'pending',
    
    -- Customer information
    customer_name TEXT NOT NULL,
    customer_phone TEXT NOT NULL,
    customer_email TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Restaurant settings
CREATE TABLE restaurant_settings (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE NOT NULL,
    
    -- Delivery settings
    delivery_zones JSONB DEFAULT '[]',
    delivery_fee_type TEXT CHECK (delivery_fee_type IN ('fixed', 'distance_based', 'free_above')) DEFAULT 'fixed',
    delivery_fee DECIMAL(10,2) DEFAULT 0,
    free_delivery_above DECIMAL(10,2),
    maximum_delivery_distance INTEGER DEFAULT 10,
    
    -- Order settings
    minimum_order_amount DECIMAL(10,2) DEFAULT 0,
    preparation_time INTEGER DEFAULT 30,
    is_accepting_orders BOOLEAN DEFAULT true,
    
    -- Payment settings
    accepted_payment_methods TEXT[] DEFAULT '{"card", "mobile_money", "cash"}',
    
    -- Notification settings
    notify_new_orders BOOLEAN DEFAULT true,
    notify_reviews BOOLEAN DEFAULT true,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications table
CREATE TABLE notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    restaurant_id UUID REFERENCES restaurants(id) ON DELETE CASCADE,
    
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT CHECK (type IN ('order', 'review', 'system', 'promotion')) DEFAULT 'system',
    is_read BOOLEAN DEFAULT false,
    related_id UUID, -- order_id, review_id, etc.
    
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_role ON profiles(role);

CREATE INDEX idx_restaurants_user_id ON restaurants(user_id);
CREATE INDEX idx_restaurants_city ON restaurants(city);
CREATE INDEX idx_restaurants_category ON restaurants(category);
CREATE INDEX idx_restaurants_rating ON restaurants(rating DESC);
CREATE INDEX idx_restaurants_location ON restaurants USING GIST(location);
CREATE INDEX idx_restaurants_active ON restaurants(is_active) WHERE is_active = true;

CREATE INDEX idx_products_restaurant_id ON products(restaurant_id);
CREATE INDEX idx_products_category_id ON products(category_id);
CREATE INDEX idx_products_available ON products(is_available) WHERE is_available = true;

CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_restaurant_id ON orders(restaurant_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX idx_orders_payment_status ON orders(payment_status);

CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);

CREATE INDEX idx_reviews_restaurant_id ON reviews(restaurant_id);
CREATE INDEX idx_reviews_user_id ON reviews(user_id);
CREATE INDEX idx_reviews_rating ON reviews(rating);
CREATE INDEX idx_reviews_created_at ON reviews(created_at DESC);

CREATE INDEX idx_favorites_user_id ON favorites(user_id);
CREATE INDEX idx_favorites_restaurant_id ON favorites(restaurant_id);

CREATE INDEX idx_reservations_restaurant_id ON reservations(restaurant_id);
CREATE INDEX idx_reservations_date ON reservations(date);
CREATE INDEX idx_reservations_status ON reservations(status);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_restaurant_id ON notifications(restaurant_id);
CREATE INDEX idx_notifications_read ON notifications(is_read) WHERE is_read = false;

-- RLS (Row Level Security) Policies
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurants ENABLE ROW LEVEL SECURITY;
ALTER TABLE menu_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE restaurant_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

-- Restaurants policies
CREATE POLICY "Restaurants are viewable by everyone" ON restaurants
    FOR SELECT USING (is_active = true);

CREATE POLICY "Restaurant owners can manage their restaurant" ON restaurants
    FOR ALL USING (auth.uid() = user_id);

-- Products policies
CREATE POLICY "Products are viewable by everyone" ON products
    FOR SELECT USING (is_available = true);

CREATE POLICY "Restaurant owners can manage their products" ON products
    FOR ALL USING (EXISTS (
        SELECT 1 FROM restaurants 
        WHERE restaurants.id = products.restaurant_id 
        AND restaurants.user_id = auth.uid()
    ));

-- Orders policies
CREATE POLICY "Users can view their own orders" ON orders
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create orders" ON orders
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Restaurant owners can view their restaurant orders" ON orders
    FOR SELECT USING (EXISTS (
        SELECT 1 FROM restaurants 
        WHERE restaurants.id = orders.restaurant_id 
        AND restaurants.user_id = auth.uid()
    ));

CREATE POLICY "Restaurant owners can update their restaurant orders" ON orders
    FOR UPDATE USING (EXISTS (
        SELECT 1 FROM restaurants 
        WHERE restaurants.id = orders.restaurant_id 
        AND restaurants.user_id = auth.uid()
    ));

-- Reviews policies
CREATE POLICY "Reviews are viewable by everyone" ON reviews
    FOR SELECT USING (true);

CREATE POLICY "Users can create reviews for their orders" ON reviews
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reviews" ON reviews
    FOR UPDATE USING (auth.uid() = user_id);

-- Favorites policies
CREATE POLICY "Users can manage their favorites" ON favorites
    FOR ALL USING (auth.uid() = user_id);

-- Reservations policies
CREATE POLICY "Users can manage their reservations" ON reservations
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Restaurant owners can view their restaurant reservations" ON reservations
    FOR SELECT USING (EXISTS (
        SELECT 1 FROM restaurants 
        WHERE restaurants.id = reservations.restaurant_id 
        AND restaurants.user_id = auth.uid()
    ));

-- Notifications policies
CREATE POLICY "Users can view their notifications" ON notifications
    FOR SELECT USING (auth.uid() = user_id);

-- Functions and Triggers

-- Function to update restaurant rating
CREATE OR REPLACE FUNCTION update_restaurant_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE restaurants 
    SET 
        rating = (
            SELECT AVG(rating) 
            FROM reviews 
            WHERE restaurant_id = NEW.restaurant_id
            AND is_verified = true
        ),
        total_reviews = (
            SELECT COUNT(*) 
            FROM reviews 
            WHERE restaurant_id = NEW.restaurant_id
            AND is_verified = true
        ),
        updated_at = NOW()
    WHERE id = NEW.restaurant_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update restaurant rating on review changes
CREATE TRIGGER trigger_update_restaurant_rating
    AFTER INSERT OR UPDATE OR DELETE ON reviews
    FOR EACH ROW
    EXECUTE FUNCTION update_restaurant_rating();

-- Function to generate order number
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TRIGGER AS $$
BEGIN
    NEW.order_number := 'CMD' || to_char(NEW.created_at, 'YYMMDD') || 
                       LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to generate order number
CREATE TRIGGER trigger_generate_order_number
    BEFORE INSERT ON orders
    FOR EACH ROW
    EXECUTE FUNCTION generate_order_number();

-- Function to update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers for updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_restaurants_updated_at BEFORE UPDATE ON restaurants FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reservations_updated_at BEFORE UPDATE ON reservations FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_restaurant_settings_updated_at BEFORE UPDATE ON restaurant_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample data
INSERT INTO profiles (id, email, full_name, role) 
VALUES 
    ('00000000-0000-0000-0000-000000000001', 'client@example.com', 'Jean Client', 'client'),
    ('00000000-0000-0000-0000-000000000002', 'restaurant@example.com', 'Paul Restaurant', 'restaurant');

INSERT INTO restaurants (id, user_id, name, slug, description, address, city, phone, email, category, is_verified) 
VALUES 
    (uuid_generate_v4(), '00000000-0000-0000-0000-000000000002', 'Chez Simon', 'chez-simon', 'Cuisine locale authentique', '123 Avenue de la Gastronomie', 'Abidjan', '+225 07 12 34 56 78', 'contact@chezsimon.ci', 'Africaine', true),
    (uuid_generate_v4(), '00000000-0000-0000-0000-000000000002', 'Villa Bambou', 'villa-bambou', 'Restaurant gastronomique français', '456 Boulevard des Chefs', 'Abidjan', '+225 05 98 76 54 32', 'info@villabambou.ci', 'Gastronomique', true);

-- Create admin user (run this separately after setting up auth)
-- INSERT INTO auth.users (id, email, encrypted_password, email_confirmed_at, created_at, updated_at) 
-- VALUES (
--     '00000000-0000-0000-0000-000000000001',
--     'admin@restafy.com',
--     crypt('admin123', gen_salt('bf')),
--     NOW(),
--     NOW(),
--     NOW()
-- );
