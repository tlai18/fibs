// All available anime animal avatars
export const AVATARS = [
  'cat',
  'dog', 
  'bunny',
  'fox',
  'bear',
  'panda',
  'owl',
  'penguin',
  'frog',
  'monkey',
  'lion',
  'tiger',
  'elephant',
  'koala',
  'panda-red',
  'sloth',
  'raccoon',
  'deer',
  'hamster',
  'hedgehog',
  'hippo',
  'fish',
  'dolphin',
  'duck',
  'flamingo',
  'beaver',
  'squirrel',
  'zebra',
  'whale',
  'goat'
];

// Get a random avatar
export function getRandomAvatar(): string {
  return AVATARS[Math.floor(Math.random() * AVATARS.length)];
}