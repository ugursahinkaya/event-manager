import { useEventRouter } from './index.js';
// Simulated server-side function to check if a username is available.
function checkUserName(user: AuthInput): Promise<AuthResult> {
  return Promise.resolve({ ...user });
}

// Simulated server-side function to register a user.
function registerFetchFn(user: AuthInput) {
  return Promise.resolve({ error: 'fake error', ...user });
}

// Define the input structure for authentication operations.
type AuthInput = {
  userName: string;
  firstName?: string;
  lastName?: string;
  password?: string;
  password2?: string;
};

// Define the expected result structure for authentication operations.
type AuthResult = {
  error?: string;
  firstName?: string;
  lastName?: string;
  userName?: string;
};

// Destructure the functions returned from useEventRouter for middleware and after-hooks.
const { setMiddleware, setAfter, runMiddlewares, checkPostEvents } = useEventRouter<
  AuthInput,
  AuthResult
>();

// Middleware to check if the passwords match during user registration.
setMiddleware('registerUser', ({ password, password2 }) => {
  if (password !== password2) {
    console.log("passwords didn't match");
    return false;
  }
  return true;
});

// Middleware to asynchronously check if the username is available.
setMiddleware('registerUser', async ({ userName }) => {
  const result = await checkUserName({ userName });
  if (result.error) {
    return false;
  }
  return true;
});

// After-hook to handle actions after user registration
setAfter('registerUser', (registerResponse) => {
  if (registerResponse.error) {
    console.log(`User register error: '${registerResponse.error}'`);
    return false;
  }
  console.log('User registered:', registerResponse);
  return true;
});

// After-hook demonstrating handling of promises after user registration.
setAfter('registerUser', (registerResponse) => {
  return new Promise((resolve) => {
    console.log(`make something with promise about ${registerResponse}`);
    resolve(true);
  });
});

export async function register(user: AuthInput) {
  console.log('register', user);
  // Run all middlewares associated with "registerUser" event.
  const middlewareLet = await runMiddlewares('registerUser', user);

  if (!middlewareLet) {
    return; // Exit function early if any middleware returned false.
  }

  // Simulated function to register user on the server side.
  const result = await registerFetchFn(user);

  // Check and run post-events associated with "registerUser" event.
  await checkPostEvents('registerUser', result);
}

await register({
  firstName: 'İbrahim Abdullah',
  lastName: 'Hassanein',
  userName: 'ibrahim_hassanein',
  password: 'Free',
  password2: 'Palestine'
});

await register({
  firstName: 'Mustafa Muhammed',
  lastName: 'Obeyd',
  userName: 'muhammed_obeyd',
  password: 'Free Palestine',
  password2: 'Free Palestine'
});
