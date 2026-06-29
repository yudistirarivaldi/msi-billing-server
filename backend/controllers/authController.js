const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { User } = require('../models');

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const COOKIE_EXPIRES_IN = 7 * 24 * 60 * 60 * 1000; // 7 days

class AuthController {
  // Handle user login
  static async login(req, res) {
    try {
      const { username, password } = req.body;

      if (!username || !password) {
        return res.status(400).json({ 
          success: false, 
          message: 'Username and password are required' 
        });
      }

      // Find user and include password for comparison
      const user = await User.findOne({ where: { username } });
      if (!user) {
        return res.status(401).json({ 
          success: false, 
          message: 'Invalid credentials' 
        });
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ 
          success: false, 
          message: 'Invalid credentials' 
        });
      }

      // Generate JWT token
      const token = jwt.sign(
        { 
          id: user.id, 
          username: user.username, 
          email: user.email, 
        },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      // Set cookie
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: COOKIE_EXPIRES_IN
      });

      // Prepare user data for response (exclude password)
      const { password: _, ...userResponse } = user.toJSON();

      return res.json({
        success: true,
        message: 'Login successful',
        user: userResponse
      });

    } catch (error) {
      console.error('Login error:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Internal server error' 
      });
    }
  }

  // Handle user logout
  static logout(req, res) {
    res.clearCookie('token');
    return res.json({
      success: true,
      message: 'Logout successful'
    });
  }

  // Get current authenticated user info
  static async getMe(req, res) {
    try {
      // req.user is populated by authMiddleware
      const user = await User.findByPk(req.user.id, {
        attributes: { exclude: ['password'] }
      });

      if (!user) {
        return res.status(404).json({ 
          success: false, 
          message: 'User not found' 
        });
      }

      return res.json({
        success: true,
        user
      });

    } catch (error) {
      console.error('Auth getMe error:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'Internal server error' 
      });
    }
  }
}

module.exports = AuthController;

