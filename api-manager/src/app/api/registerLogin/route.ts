import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';
import jwt from 'jsonwebtoken'; // <-- Add this line
import 'dotenv/config';

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT),
});

// DB_HOST=localhost
// DB_USER=myuser
// DB_PASSWORD=mypassword
// DB_NAME=mydatabase
// DB_PORT=3306
// JWT_SECRET=JWTsecret

const JWT_SECRET = 'JWTsecret'; // Use a secure secret in production

// ...existing POST handler...

// Login user
export async function PUT(req: NextRequest) {
  try {
    const { username, password } = await req.json();
    if (!username || !password) {
      return NextResponse.json({
        success: false,
        data: null,
        message: null,
        error: 'Username and password are required',
      }, { status: 400 });
    }

    const [users] = await pool.query(
      'SELECT * FROM users WHERE username = ? AND password = ?',
      [username, password]
    );
    if ((users as any[]).length === 0) {
      return NextResponse.json({
        success: false,
        data: null,
        message: null,
        error: 'Invalid username or password',
      }, { status: 401 });
    }

    const user = (users as any[])[0];
    // Generate JWT token with userId
    const token = jwt.sign({ userId: user.userID }, JWT_SECRET, { expiresIn: '9h' });

    return NextResponse.json({
      success: true,
      token, // <-- Return the token
      message: 'Login successful',
      error: null,
    });
  } catch (err: any) {
    return NextResponse.json({
      success: false,
      data: null,
      message: null,
      error: err.message || 'Internal server error',
    }, { status: 500 });
  }
}