const request = require('supertest');
const { app } = require('../src/server');

describe('API Health Check', () => {
  it('should return 200 for health check', async () => {
    const response = await request(app)
      .get('/api/health')
      .expect(200);
    
    expect(response.body.status).toBe('OK');
  });
});

describe('Authentication', () => {
  it('should register a new user', async () => {
    const userData = {
      email: 'test@example.com',
      password: 'Test123456',
      confirmPassword: 'Test123456',
      role: 'student'
    };

    const response = await request(app)
      .post('/api/auth/register')
      .send(userData)
      .expect(201);

    expect(response.body.success).toBe(true);
    expect(response.body.data.user.email).toBe(userData.email);
    expect(response.body.data.tokens).toHaveProperty('accessToken');
  });

  it('should login with valid credentials', async () => {
    // First register a user
    await request(app)
      .post('/api/auth/register')
      .send({
        email: 'login@example.com',
        password: 'Test123456',
        confirmPassword: 'Test123456',
        role: 'student'
      });

    // Then login
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'login@example.com',
        password: 'Test123456'
      })
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data.tokens).toHaveProperty('accessToken');
  });

  it('should reject login with invalid credentials', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'nonexistent@example.com',
        password: 'wrongpassword'
      })
      .expect(401);

    expect(response.body.success).toBe(false);
  });
});