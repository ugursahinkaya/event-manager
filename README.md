# Event Bus Extended

Event Bus Extended is a flexible and efficient event handling library with middleware and post-event handling capabilities. It supports complex event keys and allows multiple listeners for each event, ensuring a well-organized and event-driven architecture for your projects.

## Features

- Supports complex event keys (e.g., tuples)
- Allows multiple listeners for each event
- Middleware support for pre-event processing
- Post-event handling capabilities
- Designed for flexibility and efficiency in large applications

## License

### Commercial License

If you intend to use this software for a commercial project or commercial purposes, you need to obtain a commercial license.

The commercial license covers the commercial use, integration, and distribution of the software. It grants the user the right to use the software in commercial projects and includes additional support and services.

For more information on commercial license fees and conditions, please contact us at: [ugur@sahinkaya.xyz](mailto:ugur@sahinkaya.xyz)

### Open Source License

This software is available for free under the GNU General Public License version 3 (GPLv3).

This license allows the software to be used, modified, and distributed under open source terms. However, when using the software under the GPLv3 license, any project that uses the software must also be distributed under the same license terms.

You can access the full text of the GPLv3 license [here](LICENSE-GPL.txt).

## Usage

### Basic Usage

Here is an example of how to use the `EventBus` class:

```typescript
import { ref } from 'vue';
import { EventBus } from './index.js';

// Simulated objects
type User = { firstName: string; lastName: string };
const myLocalUserRef = ref<User>();
function anyFunctionAboutUser(user?: User) {
  console.log(user);
  return Promise.resolve(true);
}

// Define the types for events and their associated data.
type EventTypes = {
  userUpdated: (data: { firstName: string; lastName: string }) => void;
  logout: () => void;
};

// Instantiate an event bus with defined event types.
const eventBus = new EventBus<EventTypes>();

// Subscribe to 'userUpdated' event to update local user reference.
eventBus.on('userUpdated', (data) => {
  myLocalUserRef.value = data;
});

// Subscribe to 'userUpdated' event to perform any function related to user data.
eventBus.on('userUpdated', anyFunctionAboutUser);

// Subscribe to 'logout' event to log processes after user logs out.
eventBus.on('logout', () => {
  console.log('Run processes after log out');
});

// Trigger 'logout' event when the user logs out.
eventBus.emit('logout');

// Trigger 'userUpdated' event with specific data when user information is updated.
eventBus.emit('userUpdated', {
  payload: { firstName: 'Manar', lastName: 'Abdulkerim' }
});
```

### Advanced Usage with Event Router

You can also use the `useEventRouter` function for more advanced scenarios:

```typescript
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
```
