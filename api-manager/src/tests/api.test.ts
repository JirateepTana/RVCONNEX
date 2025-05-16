import request from 'supertest';
import { createServer } from 'http';
import next from 'next';

const app = next({ dev: true, dir: './' });
const handle = app.getRequestHandler();

let server: any;

beforeAll(async () => {
  await app.prepare();
  server = createServer((req, res) => handle(req, res)).listen(4000);
});

afterAll(() => {
  server.close();
});

describe('API Endpoints', () => {
  let token: string;

  it('should register a new user', async () => {
    const res = await request(server)
      .post('/api/registerLogin')
      .send({ username: 'testuser', password: 'testpass' })
      .set('Content-Type', 'application/json');
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should login and return a JWT token', async () => {
    const res = await request(server)
      .put('/api/registerLogin')
      .send({ username: 'testuser', password: 'testpass' })
      .set('Content-Type', 'application/json');
    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeDefined();
    token = res.body.token;
  });

  it('should create a new task', async () => {
    const res = await request(server)
      .post('/api/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({ title: 'My Task', description: 'This is a task', status: '1' });
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should get tasks', async () => {
    const res = await request(server)
      .get('/api/tasks')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('should update a task', async () => {
    // You may need to get a real task ID from the previous test
    const res = await request(server)
      .put('/api/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({ id: 1, title: 'Updated Task', description: 'Updated description', status: '2' });
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should delete a task', async () => {
    const res = await request(server)
      .delete('/api/tasks')
      .set('Authorization', `Bearer ${token}`)
      .send({ id: 1 });
    expect(res.statusCode).toBe(200);
    expect(res.body.success).toBe(true);
  });
});