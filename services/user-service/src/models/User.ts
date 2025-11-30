import { DataTypes, Model, Optional } from 'sequelize';
import bcrypt from 'bcrypt';
import { sequelize } from '../config/database.js';
import type { UserAttributes, UserCreationAttributes } from '../types/index.js';

class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  declare id: string;
  declare email: string;
  declare passwordHash: string;
  declare firstName?: string;
  declare lastName?: string;
  declare role: 'user' | 'admin' | 'moderator';
  declare isActive: boolean;
  declare lastLogin?: Date;
  declare readonly createdAt: Date;
  declare readonly updatedAt: Date;

  // Instance methods
  async comparePassword(candidatePassword: string): Promise<boolean> {
    return await bcrypt.compare(candidatePassword, this.passwordHash);
  }

  toJSON(): Omit<UserAttributes, 'passwordHash'> {
    const values = { ...this.get() } as UserAttributes;
    const { passwordHash, ...userWithoutPassword } = values;
    return userWithoutPassword;
  }
}

User.init({
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: {
        msg: 'Must be a valid email address'
      }
    }
  },
  passwordHash: {
    type: DataTypes.STRING(255),
    allowNull: false,
    field: 'password_hash'
  },
  firstName: {
    type: DataTypes.STRING(100),
    allowNull: true,
    field: 'first_name'
  },
  lastName: {
    type: DataTypes.STRING(100),
    allowNull: true,
    field: 'last_name'
  },
  role: {
    type: DataTypes.ENUM('user', 'admin', 'moderator'),
    defaultValue: 'user',
    allowNull: false
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    field: 'is_active'
  },
  lastLogin: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'last_login'
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
  tableName: 'users',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  hooks: {
    beforeCreate: async (user: User) => {
      if (user.passwordHash) {
        const salt = await bcrypt.genSalt(parseInt(process.env.BCRYPT_ROUNDS || '10'));
        user.passwordHash = await bcrypt.hash(user.passwordHash, salt);
      }
    },
    beforeUpdate: async (user: User) => {
      if (user.changed('passwordHash')) {
        const salt = await bcrypt.genSalt(parseInt(process.env.BCRYPT_ROUNDS || '10'));
        user.passwordHash = await bcrypt.hash(user.passwordHash, salt);
      }
    }
  }
});

export default User;
