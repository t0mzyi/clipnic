import jwt from 'jsonwebtoken';

export class AuthService {
  static async loginMock(email: string, role: string) {
    const defaultSecret = 'supersecretjwtkey';
    const token = jwt.sign({ id: 'mock-id-123', role }, process.env.JWT_SECRET || defaultSecret, { expiresIn: '1d' });
    return { token, user: { id: 'mock-id-123', email, role } };
  }
}
