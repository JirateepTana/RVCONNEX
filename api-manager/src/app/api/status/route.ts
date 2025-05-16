import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';
import jwt from 'jsonwebtoken'; // <-- Add this
import 'dotenv/config';

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: Number(process.env.DB_PORT),
  });

//   DB_HOST=localhost
//   DB_USER=myuser
//   DB_PASSWORD=mypassword
//   DB_NAME=mydatabase
//   DB_PORT=3306
//   JWT_SECRET=JWTsecret

const JWT_SECRET = 'JWTsecret'; // Use env variable in production

function verifyToken(req: NextRequest) {
  const auth = req.headers.get('authorization');
  if (!auth || !auth.startsWith('Bearer ')) return null;
  try {
    return jwt.verify(auth.split(' ')[1], JWT_SECRET);
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  // Require valid JWT
  const user = verifyToken(req);
  if (!user) {
    return NextResponse.json({
      success: false,
      data: null,
      message: null,
      error: 'Unauthorized',
    }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const title = searchParams.get('title');
    const status = searchParams.get('status');

    let query = 'SELECT * FROM tasks';
    let params: any[] = [];

    if (title && status) {
      query += ' WHERE title LIKE ? AND status = ?';
      params = [`%${title}%`, status];
    } else if (title) {
      query += ' WHERE title LIKE ?';
      params = [`%${title}%`];
    } else if (status) {
      query += ' WHERE status = ?';
      params = [status];
    }

    const [rows] = await pool.query(query, params);
    return NextResponse.json({
      success: true,
      data: rows,
      message: null,
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