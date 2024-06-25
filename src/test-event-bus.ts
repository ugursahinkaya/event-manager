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
