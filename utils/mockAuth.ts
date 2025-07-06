interface User {
  id: string;
  email: string;
  displayName: string;
  partnerId?: string;
  partnerName?: string;
  createdAt: string;
  isVerified: boolean;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
}

// Mock user database
const MOCK_USERS: User[] = [
  {
    id: 'user_1',
    email: 'breda.bozic@gmail.com',
    displayName: 'Breda Bozic',
    partnerId: 'user_2',
    partnerName: 'Alex Johnson',
    createdAt: '2025-01-01T00:00:00Z',
    isVerified: true,
  },
  {
    id: 'user_2',
    email: 'alex.johnson@example.com',
    displayName: 'Alex Johnson',
    partnerId: 'user_1',
    partnerName: 'Breda Bozic',
    createdAt: '2025-01-01T00:00:00Z',
    isVerified: true,
  },
];

// Mock authentication functions
export class MockAuth {
  private static currentUser: User | null = null;

  static async signIn(email: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    const user = MOCK_USERS.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (!user) {
      return { success: false, error: 'User not found' };
    }

    if (!user.isVerified) {
      return { success: false, error: 'Please verify your email address' };
    }

    // For demo purposes, accept any password for existing users
    this.currentUser = user;
    return { success: true, user };
  }

  static async signUp(email: string, password: string, displayName: string): Promise<{ success: boolean; user?: User; error?: string }> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Check if user already exists
    const existingUser = MOCK_USERS.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existingUser) {
      return { success: false, error: 'User already exists' };
    }

    // Create new user
    const newUser: User = {
      id: `user_${Date.now()}`,
      email,
      displayName,
      createdAt: new Date().toISOString(),
      isVerified: false, // Requires email verification
    };

    MOCK_USERS.push(newUser);
    return { success: true, user: newUser };
  }

  static async sendPasswordReset(email: string): Promise<{ success: boolean; error?: string }> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    const user = MOCK_USERS.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      return { success: false, error: 'User not found' };
    }

    // In a real app, this would send an email
    return { success: true };
  }

  static async verifyEmail(token: string): Promise<{ success: boolean; error?: string }> {
    // Simulate email verification
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // For demo purposes, always succeed
    return { success: true };
  }

  static getCurrentUser(): User | null {
    return this.currentUser;
  }

  static signOut(): void {
    this.currentUser = null;
  }

  static isAuthenticated(): boolean {
    return this.currentUser !== null;
  }

  static getTestCredentials() {
    return {
      email: 'breda.bozic@gmail.com',
      password: 'test123',
      displayName: 'Breda Bozic'
    };
  }
}