# Complete Test Suite Guide

This guide covers the complete test suite setup for the separated Auth and Database architecture.

## 📁 Test Structure

```
src/__tests__/
├── setup.ts                           # Jest setup (mocks, globals)
├── setup/
│   └── firebase-emulator.ts           # Firebase Emulator configuration
├── fixtures/
│   └── index.ts                       # Test data and fixtures
├── mocks/
│   └── contexts.ts                    # Mock context providers
├── lib/
│   ├── auth/
│   │   └── authService.test.ts        # Auth service tests
│   └── database/
│       └── firestoreService.test.ts   # Database service tests
├── contexts/
│   └── authContext.test.ts            # Auth context tests
└── components/
    └── example.test.tsx               # Component testing examples
```

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install --save-dev jest @testing-library/react @testing-library/jest-dom ts-jest
npm install --save-dev @types/jest jest-environment-jsdom
```

### 2. Update package.json

Add these scripts to `package.json`:

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:debug": "node --inspect-brk node_modules/.bin/jest --runInBand"
  },
  "devDependencies": {
    "jest": "^29.0.0",
    "@testing-library/react": "^14.0.0",
    "@testing-library/jest-dom": "^6.0.0",
    "ts-jest": "^29.0.0",
    "@types/jest": "^29.0.0",
    "jest-environment-jsdom": "^29.0.0"
  }
}
```

### 3. Run Tests

```bash
# Run all tests
npm test

# Watch mode (re-run on file changes)
npm test -- --watch

# Coverage report
npm test -- --coverage

# Run specific test file
npm test -- authService.test.ts

# Debug mode
npm run test:debug

# Emulator integration tests (starts Firestore emulator automatically)
npm run test:emulator
```

## 📋 Test Categories

### 1. **Auth Service Tests** (`lib/auth/authService.test.ts`)
- Login with valid/invalid credentials
- Magic link sign-in
- User registration
- Logout functionality
- Mock user creation

**Run:**
```bash
npm test -- authService.test.ts
```

### 2. **Firestore Service Tests** (`lib/database/firestoreService.test.ts`)
- Profile operations (create, fetch, update)
- Plot operations
- Tree operations
- Species operations
- Mock customization

**Run:**
```bash
npm test -- firestoreService.test.ts
```

### 3. **Auth Context Tests** (`contexts/authContext.test.ts`)
- Initial state validation
- User authentication state
- Profile data loading
- Auth method calls
- Role and permission checks
- Approval status

**Run:**
```bash
npm test -- authContext.test.ts
```

### 4. **Component Tests** (`components/example.test.tsx`)
- Component rendering with mock auth
- Database data display
- Error handling
- User interactions

**Run:**
```bash
npm test -- component
```

## 🔧 Using Mocks

### Mock Auth Service

```typescript
import { mockAuthService, createMockUser } from '@/lib/auth/authService.mock';

// Use in tests
const auth = mockAuthService;
const user = createMockUser();
```

### Mock Database Service

```typescript
import { mockFirestoreService, createMockFirestoreService } from '@/lib/database/firestoreService.mock';

// Use in tests
const db = mockFirestoreService;

// Or create custom mock
const customDb = createMockFirestoreService({
  fetchPlots: jest.fn(async () => []),
});
```

### Mock Contexts

```typescript
import { createMockAuthContext, createMockDatabaseContext } from '@/__tests__/mocks/contexts';
import { fixtures } from '@/__tests__/fixtures';

// Use in tests
const authContext = createMockAuthContext({
  role: 'admin',
  isApproved: true,
});

const dbContext = createMockDatabaseContext();
```

### Test Fixtures

```typescript
import { fixtures, TEST_USER_ID, TEST_PLOT_ID } from '@/__tests__/fixtures';

// Access pre-made test data
const user = fixtures.user;
const plots = fixtures.plots;
const trees = fixtures.trees;
const species = fixtures.speciesList;
```

## 🧪 Testing Patterns

### Pattern 1: Testing Auth Service

```typescript
describe('Auth Service', () => {
  it('should login successfully', async () => {
    const result = await mockAuthService.login('valid@test.com', 'password123');
    expect(result.success).toBe(true);
  });
});
```

### Pattern 2: Testing Database Without Auth

```typescript
describe('Database Service', () => {
  it('should fetch plots independently', async () => {
    const plots = await mockFirestoreService.fetchPlots();
    expect(Array.isArray(plots)).toBe(true);
  });
});
```

### Pattern 3: Testing Context

```typescript
describe('Auth Context', () => {
  it('should have authenticated user', () => {
    const auth = createMockAuthContext();
    expect(auth.user).toBeDefined();
  });
});
```

### Pattern 4: Testing Components with Mocks

```typescript
describe('Component', () => {
  it('should render with mocked data', () => {
    const auth = createMockAuthContext();
    render(<MyComponent />); // Provide auth mock
    expect(screen.getByText('Profile')).toBeInTheDocument();
  });
});
```

## 🔗 Firebase Emulator (Optional)

For testing with real Firebase services locally:

### Quick Run (Recommended)

```bash
npm run test:emulator
```

This command starts Firestore emulator for the test run and shuts it down automatically.
Configured Firestore emulator port: `127.0.0.1:8085`.

### 1. Install Firebase Emulator

```bash
npm install -g firebase-tools
firebase init emulators
```

### 2. Start Emulator

```bash
firebase emulators:start
```

### 3. Use in Tests

```typescript
import { initializeFirebaseWithEmulators } from '@/__tests__/setup/firebase-emulator';

const { auth, db } = initializeFirebaseWithEmulators({
  enableAuth: true,
  enableFirestore: true,
});
```

## 📊 Coverage Requirements

Current configuration requires:
- **Branches:** 50%
- **Functions:** 50%
- **Lines:** 50%
- **Statements:** 50%

Adjust in `jest.config.js` `coverageThreshold`:

```javascript
coverageThreshold: {
  global: {
    branches: 50,
    functions: 50,
    lines: 50,
    statements: 50,
  },
},
```

## 🐛 Debugging Tests

### Visual Debugging

```typescript
import { screen, debug } from '@testing-library/react';

test('debug example', () => {
  render(<MyComponent />);
  debug(); // Prints DOM to console
});
```

### Debug Mode

```bash
npm run test:debug

# Then open chrome://inspect in Chrome browser
```

### Watch Mode

```bash
npm test -- --watch
```

## ✅ Best Practices

1. **Use Fixtures**: Keep test data in `fixtures/index.ts`
2. **Mock Services**: Use pre-built mocks from `lib/*/service.mock.ts`
3. **Clear Names**: Use descriptive test names
4. **Arrange-Act-Assert**: Structure tests clearly
5. **Isolate Tests**: Each test should be independent
6. **Clean Up**: Jest automatically clears mocks after each test
7. **Avoid Real Firebase**: Use mocks unless specifically testing emulator

## 📝 Example Test

```typescript
import { mockAuthService } from '@/lib/auth/authService.mock';
import { fixtures } from '@/__tests__/fixtures';

describe('Auth Service - Login', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should successfully login with valid credentials', async () => {
    // Arrange
    const email = 'valid@test.com';
    const password = 'password123';

    // Act
    const result = await mockAuthService.login(email, password);

    // Assert
    expect(result.success).toBe(true);
    expect(mockAuthService.login).toHaveBeenCalledWith(email, password);
  });

  it('should reject invalid credentials', async () => {
    // Arrange
    const email = 'invalid@test.com';
    const password = 'wrongpassword';

    // Act
    const result = await mockAuthService.login(email, password);

    // Assert
    expect(result.success).toBe(false);
    expect(result.message).toBe('Invalid credentials');
  });
});
```

## 🔗 Related Files

- [Auth Service](../../lib/auth/authService.ts)
- [Database Service](../../lib/database/firestoreService.ts)
- [Auth Context](../../contexts/AuthContext.tsx)
- [Database Context](../../contexts/DatabaseContext.tsx)

## 💡 Tips

- Run `npm test -- --coverage` to see coverage reports
- Use `jest.fn()` to create custom mocks
- Import fixtures to avoid hardcoding test data
- Keep mocks close to the modules they mock
- Use descriptive test names that explain behavior

## 🆘 Troubleshooting

**Tests not found:**
```bash
npm test -- --listTests
```

**Clear Jest cache:**
```bash
npm test -- --clearCache
```

**Module not found:**
- Check `moduleNameMapper` in `jest.config.js`
- Ensure paths match your project structure

**Timeout errors:**
- Increase timeout: `jest.setTimeout(30000);`
- Check for unresolved promises

**Mock not working:**
- Verify mock module path
- Ensure mock is imported before usage
- Check `jest.mock()` usage

