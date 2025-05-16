import { NextRequest, NextResponse } from 'next/server';
import mysql from 'mysql2/promise';
import jwt from 'jsonwebtoken';

const pool = mysql.createPool({
  host: 'localhost',
  user: 'myuser',
  password: 'mypassword',
  database: 'mydatabase',
  port: 3306,
});

const JWT_SECRET = 'JWTsecret';

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
    const userId = (user as any).userId;

    let rows;
    if (title) {
      [rows] = await pool.query(
        'SELECT * FROM tasks WHERE title LIKE ? AND updateuserby = ?',
        [`%${title}%`, userId]
      );
    } else {
      [rows] = await pool.query(
        'SELECT * FROM tasks WHERE updateuserby = ?',
        [userId]
      );
    }
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

export async function POST(req: NextRequest) {
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
    const body = await req.json();
    const { title, description, status } = body;
    const userId = (user as any).userId;

    if (!title) {
      return NextResponse.json({
        success: false,
        data: null,
        message: null,
        error: 'Title is required',
      }, { status: 400 });
    }

    await pool.query(
      'INSERT INTO tasks (title, description, status, updateuserby) VALUES (?, ?, ?, ?)',
      [title, description, status, userId]
    );

    return NextResponse.json({
      success: true,
      data: null,
      message: 'Task created',
      error: null,
    });
  } catch (err: any) {
    console.error("POST /api/tasks error:", err);
    return NextResponse.json({
      success: false,
      data: null,
      message: null,
      error: err.message || 'Internal server error',
    }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const { id } = await req.json();
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
    const userId = (user as any).userId;

    const [result] = await pool.query(
      'DELETE FROM tasks WHERE id = ? AND updateuserby = ?',
      [id, userId]
    );

    return NextResponse.json({
      success: true,
      data: result,
      message: 'Task(s) deleted',
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
export async function PUT(req: NextRequest) {
  const user = verifyToken(req);
  if (!user) {
    console.error('PUT /api/tasks error: Unauthorized - No valid JWT');
    return NextResponse.json({
      success: false,
      data: null,
      message: null,
      error: 'Unauthorized',
    }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { id, title: newTitle, description, status } = body;
    const userId = (user as any).userId;

    // Log the received data
    console.log('PUT /api/tasks received:', { id, newTitle, description, status, userId });

    if (!id) {
      console.error('PUT /api/tasks error: Missing task ID', { body });
      return NextResponse.json({
        success: false,
        data: null,
        message: null,
        error: 'Task ID is required',
      }, { status: 400 });
    }
    if (!userId) {
      console.error('PUT /api/tasks error: Missing userId in JWT', { user });
      return NextResponse.json({
        success: false,
        data: null,
        message: null,
        error: 'User ID is required',
      }, { status: 400 });
    }

    const [result] = await pool.query(
      'UPDATE tasks SET title = ?, description = ?, status = ? WHERE id = ? AND updateuserby = ?',
      [newTitle, description, status, id, userId]
    );

    return NextResponse.json({
      success: true,
      data: result,
      message: 'Task updated',
      error: null,
    });
  } catch (err: any) {
    console.error('PUT /api/tasks error:', err);
    return NextResponse.json({
      success: false,
      data: null,
      message: null,
      error: err.message || 'Internal server error',
    }, { status: 500 });
  }
}