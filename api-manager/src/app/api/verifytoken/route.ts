import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = 'JWTsecret'; // Use env variable in production

export async function GET(req: NextRequest) {
  try {
    const auth = req.headers.get('authorization');
    if (!auth || !auth.startsWith('Bearer ')) {
      return NextResponse.json({ valid: false }, { status: 401 });
    }
    const token = auth.split(' ')[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    return NextResponse.json({ valid: true, userId: (decoded as any).userId });
  } catch {
    return NextResponse.json({ valid: false }, { status: 401 });
  }
}