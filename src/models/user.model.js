const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Por favor proporciona tu nombre'],
      trim: true,
      minlength: [2, 'El nombre debe tener al menos 2 caracteres'],
      maxlength: [50, 'El nombre no puede tener más de 50 caracteres']
    },
    email: {
      type: String,
      required: [true, 'Por favor proporciona tu email'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
        'Por favor proporciona un email válido'
      ]
    },
    password: {
      type: String,
      required: [true, 'Por favor proporciona una contraseña'],
      minlength: [6, 'La contraseña debe tener al menos 6 caracteres'],
      select: false
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user'
    },
    last_login: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: {
      createdAt: 'created_at',
      updatedAt: 'updated_at'
    }
  }
);

// Middleware para hashear la contraseña antes de guardar
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Método para comparar contraseñas
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Método para actualizar la fecha del último login
userSchema.methods.updateLastLogin = async function() {
  this.last_login = Date.now();
  await this.save();
};

const User = mongoose.model('User', userSchema);

module.exports = User;