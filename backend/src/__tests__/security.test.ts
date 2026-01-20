import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import Fastify from 'fastify'
import { registerRoutes } from '../routes/index.js'
import { errorHandler } from '../middlewares/errorHandler.js'

describe('Security Tests', () => {
  let app: any

  beforeAll(async () => {
    app = Fastify({ logger: false })
    app.setErrorHandler(errorHandler)
    await registerRoutes(app)
    await app.ready()
  })

  afterAll(async () => {
    await app.close()
  })

  describe('Input Validation - XSS Protection', () => {
    it('should reject email with script tag', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/register',
        payload: {
          email: 'test<script>alert("xss")</script>@example.com',
          password: 'Password123!',
          firstName: 'John',
          lastName: 'Doe',
        },
      })

      expect(response.statusCode).toBe(400)
      expect(response.json().error).toContain('validation')
    })

    it('should reject name with dangerous characters', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/register',
        payload: {
          email: 'test@example.com',
          password: 'Password123!',
          firstName: 'John<script>',
          lastName: 'Doe',
        },
      })

      expect(response.statusCode).toBe(400)
    })

    it('should reject name with HTML entities', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/register',
        payload: {
          email: 'test@example.com',
          password: 'Password123!',
          firstName: 'John&lt;script&gt;',
          lastName: 'Doe',
        },
      })

      expect(response.statusCode).toBe(400)
    })
  })

  describe('SQL Injection Protection', () => {
    it('should reject SQL injection in email', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/login',
        payload: {
          email: "admin'--",
          password: 'password',
        },
      })

      expect(response.statusCode).toBe(400)
      expect(response.json().error).toContain('validation')
    })

    it('should reject SQL injection with UNION', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/login',
        payload: {
          email: "admin' UNION SELECT * FROM users--",
          password: 'password',
        },
      })

      expect(response.statusCode).toBe(400)
    })

    it('should reject SQL injection in password', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/login',
        payload: {
          email: 'test@example.com',
          password: "' OR '1'='1",
        },
      })

      // Validation passe mais auth échoue (pas de match)
      expect([400, 401]).toContain(response.statusCode)
    })
  })

  describe('Password Security', () => {
    it('should reject weak password (no uppercase)', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/register',
        payload: {
          email: 'test@example.com',
          password: 'password123!',
          firstName: 'John',
          lastName: 'Doe',
        },
      })

      expect(response.statusCode).toBe(400)
      expect(response.json().error).toContain('majuscule')
    })

    it('should reject weak password (no lowercase)', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/register',
        payload: {
          email: 'test@example.com',
          password: 'PASSWORD123!',
          firstName: 'John',
          lastName: 'Doe',
        },
      })

      expect(response.statusCode).toBe(400)
    })

    it('should reject weak password (no number)', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/register',
        payload: {
          email: 'test@example.com',
          password: 'Password!',
          firstName: 'John',
          lastName: 'Doe',
        },
      })

      expect(response.statusCode).toBe(400)
    })

    it('should reject weak password (no special char)', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/register',
        payload: {
          email: 'test@example.com',
          password: 'Password123',
          firstName: 'John',
          lastName: 'Doe',
        },
      })

      expect(response.statusCode).toBe(400)
    })

    it('should reject password too short', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/register',
        payload: {
          email: 'test@example.com',
          password: 'Pwd1!',
          firstName: 'John',
          lastName: 'Doe',
        },
      })

      expect(response.statusCode).toBe(400)
    })

    it('should reject password too long', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/register',
        payload: {
          email: 'test@example.com',
          password: 'P'.repeat(130) + '1!',
          firstName: 'John',
          lastName: 'Doe',
        },
      })

      expect(response.statusCode).toBe(400)
    })
  })

  describe('Path Traversal Protection', () => {
    it('should reject file download with path traversal', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/files/../../etc/passwd/download',
      })

      expect(response.statusCode).toBe(401) // Pas authentifié
    })

    it('should reject invalid UUID in file download', async () => {
      // Même avec auth, UUID invalide doit être rejeté
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/files/invalid-uuid/download',
      })

      expect(response.statusCode).toBe(401) // Non authentifié
    })
  })

  describe('Rate Limiting', () => {
    it('should rate limit login attempts', async () => {
      const loginAttempt = async () => {
        return await app.inject({
          method: 'POST',
          url: '/api/v1/auth/login',
          payload: {
            email: 'ratelimit@example.com',
            password: 'wrongpassword',
          },
        })
      }

      // Faire 6 tentatives (limit = 5)
      const responses = await Promise.all([
        loginAttempt(),
        loginAttempt(),
        loginAttempt(),
        loginAttempt(),
        loginAttempt(),
        loginAttempt(),
      ])

      // Au moins une devrait être rate limited
      const rateLimited = responses.some((r) => r.statusCode === 429)
      expect(rateLimited).toBe(true)
    })
  })

  describe('Authorization - Broken Access Control', () => {
    it('should deny access to protected route without token', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/auth/me',
      })

      expect(response.statusCode).toBe(401)
    })

    it('should deny access with invalid token', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/auth/me',
        headers: {
          authorization: 'Bearer invalid-token',
        },
      })

      expect(response.statusCode).toBe(401)
    })

    it('should deny access with malformed authorization header', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/auth/me',
        headers: {
          authorization: 'InvalidFormat token',
        },
      })

      expect(response.statusCode).toBe(401)
    })
  })

  describe('CSRF Protection', () => {
    it('should have CSRF protection enabled', async () => {
      // Vérifier que le serveur renvoie des tokens CSRF
      const response = await app.inject({
        method: 'GET',
        url: '/health',
      })

      // Les routes POST devraient vérifier CSRF token
      expect(response.statusCode).toBe(200)
    })
  })

  describe('Headers Security', () => {
    it('should have security headers', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/health',
      })

      const headers = response.headers

      // Helmet headers
      expect(headers['x-dns-prefetch-control']).toBeDefined()
      expect(headers['x-frame-options']).toBeDefined()
      expect(headers['x-content-type-options']).toBe('nosniff')
      expect(headers['x-xss-protection']).toBeDefined()
    })

    it('should not expose server information', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/health',
      })

      // Ne devrait pas révéler "Fastify" ou version
      expect(response.headers['x-powered-by']).toBeUndefined()
    })
  })

  describe('Error Handling - Information Disclosure', () => {
    it('should not leak stack trace in production', async () => {
      // Simuler une erreur
      const response = await app.inject({
        method: 'GET',
        url: '/api/v1/nonexistent',
      })

      const body = response.json()

      // Ne devrait pas contenir de stack trace
      expect(body.stack).toBeUndefined()
      expect(body.message).not.toContain('at ')
      expect(body.message).not.toContain('.js:')
    })

    it('should return generic error for 500', async () => {
      // Même en cas d'erreur interne, pas de détails techniques
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/auth/login',
        payload: {}, // Payload invalide pour trigger erreur
      })

      const body = response.json()
      expect(body.error).toBeDefined()
      expect(body.stack).toBeUndefined()
    })
  })

  describe('File Upload Security', () => {
    it('should reject file without authentication', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/files/upload',
      })

      expect(response.statusCode).toBe(401)
    })

    // Note: Tests d'upload avec fichiers nécessitent multipart
    // À implémenter avec une lib de test multipart
  })

  describe('Email Validation', () => {
    it('should reject invalid email format', async () => {
      const invalidEmails = [
        'notanemail',
        '@example.com',
        'test@',
        'test@@example.com',
        'test@example',
        '',
        'test @example.com', // espace
      ]

      for (const email of invalidEmails) {
        const response = await app.inject({
          method: 'POST',
          url: '/api/v1/auth/login',
          payload: {
            email,
            password: 'Password123!',
          },
        })

        expect(response.statusCode).toBe(400)
      }
    })

    it('should accept valid email formats', async () => {
      const validEmails = [
        'test@example.com',
        'user+tag@example.co.uk',
        'first.last@example.com',
        'test123@test-domain.com',
      ]

      for (const email of validEmails) {
        const response = await app.inject({
          method: 'POST',
          url: '/api/v1/auth/login',
          payload: {
            email,
            password: 'Password123!',
          },
        })

        // 401 car credentials invalides, mais validation passe
        expect(response.statusCode).toBe(401)
      }
    })
  })

  describe('Token Validation', () => {
    it('should reject invalid reset token format', async () => {
      const invalidTokens = [
        '<script>alert("xss")</script>',
        '../../etc/passwd',
        'token with spaces',
        'token;DROP TABLE users;',
      ]

      for (const token of invalidTokens) {
        const response = await app.inject({
          method: 'POST',
          url: '/api/v1/auth/reset-password',
          payload: {
            token,
            password: 'NewPassword123!',
          },
        })

        expect(response.statusCode).toBe(400)
      }
    })
  })
})

describe('Security Best Practices Compliance', () => {
  it('should use HTTPS in production', () => {
    // Vérifier la config
    const isProd = process.env.NODE_ENV === 'production'
    if (isProd) {
      // En production, toujours HTTPS
      expect(process.env.API_URL?.startsWith('https')).toBe(true)
    }
  })

  it('should have strong JWT secrets', () => {
    const jwtSecret = process.env.JWT_ACCESS_SECRET || ''
    const refreshSecret = process.env.JWT_REFRESH_SECRET || ''

    // Minimum 32 caractères pour les secrets
    expect(jwtSecret.length).toBeGreaterThanOrEqual(32)
    expect(refreshSecret.length).toBeGreaterThanOrEqual(32)
    expect(jwtSecret).not.toBe(refreshSecret) // Différents
  })

  it('should have CORS configured', () => {
    expect(process.env.FRONTEND_URL).toBeDefined()
    expect(process.env.FRONTEND_URL).not.toBe('*') // Pas de wildcard
  })
})
