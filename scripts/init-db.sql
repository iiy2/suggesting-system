-- Initialize Recommendation Platform Database
-- PostgreSQL 15+

-- Create extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    role VARCHAR(50) DEFAULT 'user' CHECK (role IN ('user', 'admin', 'moderator')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP WITH TIME ZONE
);

-- Content table
CREATE TABLE IF NOT EXISTS content (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(500) NOT NULL,
    description TEXT,
    content_type VARCHAR(50) NOT NULL CHECK (content_type IN ('course', 'article', 'video', 'news')),
    category VARCHAR(100),
    tags TEXT[], -- Array of tags
    author_id UUID REFERENCES users(id) ON DELETE SET NULL,
    difficulty_level VARCHAR(20) CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
    duration_minutes INTEGER, -- For courses/videos
    language VARCHAR(10) DEFAULT 'uk',
    is_published BOOLEAN DEFAULT false,
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    view_count INTEGER DEFAULT 0,
    rating DECIMAL(3,2) DEFAULT 0.0 CHECK (rating >= 0 AND rating <= 5)
);

-- User interactions with content
CREATE TABLE IF NOT EXISTS user_interactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content_id UUID NOT NULL REFERENCES content(id) ON DELETE CASCADE,
    interaction_type VARCHAR(50) NOT NULL CHECK (interaction_type IN ('view', 'like', 'favorite', 'complete', 'rate', 'share')),
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage >= 0 AND progress_percentage <= 100),
    time_spent_seconds INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, content_id, interaction_type)
);

-- User preferences
CREATE TABLE IF NOT EXISTS user_preferences (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    preferred_categories TEXT[],
    preferred_difficulty VARCHAR(20),
    preferred_language VARCHAR(10) DEFAULT 'uk',
    interests TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Recommendations cache table
CREATE TABLE IF NOT EXISTS recommendations_cache (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content_id UUID NOT NULL REFERENCES content(id) ON DELETE CASCADE,
    score DECIMAL(5,4) NOT NULL,
    algorithm_type VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(user_id, content_id, algorithm_type)
);

-- Create indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_content_type ON content(content_type);
CREATE INDEX idx_content_category ON content(category);
CREATE INDEX idx_content_published ON content(is_published);
CREATE INDEX idx_content_tags ON content USING GIN(tags);
CREATE INDEX idx_interactions_user ON user_interactions(user_id);
CREATE INDEX idx_interactions_content ON user_interactions(content_id);
CREATE INDEX idx_interactions_type ON user_interactions(interaction_type);
CREATE INDEX idx_interactions_created ON user_interactions(created_at);
CREATE INDEX idx_recommendations_user ON recommendations_cache(user_id);
CREATE INDEX idx_recommendations_expires ON recommendations_cache(expires_at);

-- Create trigger function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers to tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_content_updated_at BEFORE UPDATE ON content
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_interactions_updated_at BEFORE UPDATE ON user_interactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_preferences_updated_at BEFORE UPDATE ON user_preferences
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Insert sample admin user (password: Admin123!)
INSERT INTO users (email, password_hash, first_name, last_name, role)
VALUES (
    'admin@example.com',
    '$2b$10$YourHashedPasswordHere', -- Replace with actual bcrypt hash
    'Admin',
    'User',
    'admin'
) ON CONFLICT (email) DO NOTHING;

-- Insert sample content categories
INSERT INTO content (title, description, content_type, category, tags, difficulty_level, is_published, published_at)
VALUES
    ('Introduction to Docker', 'Learn the basics of containerization with Docker', 'course', 'DevOps', ARRAY['docker', 'containers', 'devops'], 'beginner', true, CURRENT_TIMESTAMP),
    ('Kubernetes Fundamentals', 'Master container orchestration with Kubernetes', 'course', 'DevOps', ARRAY['kubernetes', 'k8s', 'orchestration'], 'intermediate', true, CURRENT_TIMESTAMP),
    ('Microservices Architecture', 'Design scalable microservices systems', 'course', 'Architecture', ARRAY['microservices', 'architecture', 'scalability'], 'advanced', true, CURRENT_TIMESTAMP),
    ('Go Programming Basics', 'Start your journey with Go programming language', 'course', 'Programming', ARRAY['golang', 'programming', 'backend'], 'beginner', true, CURRENT_TIMESTAMP),
    ('Node.js Best Practices', 'Build efficient Node.js applications', 'course', 'Programming', ARRAY['nodejs', 'javascript', 'backend'], 'intermediate', true, CURRENT_TIMESTAMP),
    ('Tech News: Cloud Computing Trends 2025', 'Latest trends in cloud computing', 'news', 'Technology', ARRAY['cloud', 'trends', 'news'], NULL, true, CURRENT_TIMESTAMP)
ON CONFLICT DO NOTHING;

-- Grant permissions
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO admin;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO admin;
