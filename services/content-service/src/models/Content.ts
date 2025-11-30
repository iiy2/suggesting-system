import { DataTypes, Model } from 'sequelize';
import { sequelize } from '../config/database.js';
import type { ContentAttributes, ContentCreationAttributes } from '../types/index.js';

class Content extends Model<ContentAttributes, ContentCreationAttributes> implements ContentAttributes {
  declare id: string;
  declare title: string;
  declare description?: string;
  declare contentType: 'course' | 'article' | 'video' | 'news';
  declare category?: string;
  declare tags: string[];
  declare authorId?: string;
  declare difficultyLevel?: 'beginner' | 'intermediate' | 'advanced';
  declare durationMinutes?: number;
  declare language: string;
  declare isPublished: boolean;
  declare publishedAt?: Date;
  declare viewCount: number;
  declare rating: number;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;
}

Content.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  title: {
    type: DataTypes.STRING(500),
    allowNull: false,
    validate: {
      len: {
        args: [3, 500],
        msg: 'Title must be between 3 and 500 characters'
      }
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  contentType: {
    type: DataTypes.ENUM('course', 'article', 'video', 'news'),
    allowNull: false,
    field: 'content_type'
  },
  category: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  tags: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    allowNull: false,
    defaultValue: []
  },
  authorId: {
    type: DataTypes.UUID,
    allowNull: true,
    field: 'author_id'
  },
  difficultyLevel: {
    type: DataTypes.ENUM('beginner', 'intermediate', 'advanced'),
    allowNull: true,
    field: 'difficulty_level'
  },
  durationMinutes: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'duration_minutes',
    validate: {
      min: {
        args: [0],
        msg: 'Duration must be positive'
      }
    }
  },
  language: {
    type: DataTypes.STRING(10),
    allowNull: false,
    defaultValue: 'uk'
  },
  isPublished: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
    field: 'is_published'
  },
  publishedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'published_at'
  },
  viewCount: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0,
    field: 'view_count'
  },
  rating: {
    type: DataTypes.DECIMAL(3, 2),
    allowNull: false,
    defaultValue: 0.0,
    validate: {
      min: 0,
      max: 5
    }
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'created_at'
  },
  updatedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    field: 'updated_at'
  }
}, {
  sequelize,
  tableName: 'content',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  hooks: {
    beforeUpdate: (content: Content) => {
      // Автоматично встановлюємо publishedAt при публікації
      if (content.changed('isPublished') && content.isPublished && !content.publishedAt) {
        content.publishedAt = new Date();
      }
    }
  }
});

export default Content;
