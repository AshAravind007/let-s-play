// shared/network.js

// Replace with your real Firebase config
const firebaseConfig = {
  apiKey: "YOUR_FIREBASE_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

// Global handles
let db = null;
let currentRoomId = null;
let playerNumber = null; // 1, 2, 3, 4
let roomUnsubscribe = null;

export function initFirebase() {
  if (typeof firebase === 'undefined') {
    console.error("Firebase SDK script not loaded in HTML head.");
    return;
  }
  if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
  }
  db = firebase.firestore();
}

// Generate 4-letter room code
export function generateRoomCode() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 4; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

// Create a Room
export async function createRoom(gameName, initialGameState) {
  if (!db) initFirebase();
  const roomId = generateRoomCode();
  const roomRef = db.collection("rooms").doc(roomId);

  const roomData = {
    game: gameName,
    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    players: {
      1: { name: "Player 1", connected: true }
    },
    playerCount: 1,
    turn: 1,
    state: initialGameState
  };

  await roomRef.set(roomData);
  currentRoomId = roomId;
  playerNumber = 1;
  return { roomId, playerNumber };
}

// Join an Existing Room
export async function joinRoom(roomId, initialGameState) {
  if (!db) initFirebase();
  const cleanId = roomId.trim().toUpperCase();
  const roomRef = db.collection("rooms").doc(cleanId);
  const snap = await roomRef.get();

  if (!snap.exists) {
    throw new Error("Room does not exist. Check code!");
  }

  const data = snap.data();
  const nextSlot = (data.playerCount || 1) + 1;

  if (nextSlot > 4) {
    throw new Error("Room is already full!");
  }

  await roomRef.update({
    [`players.${nextSlot}`]: { name: `Player ${nextSlot}`, connected: true },
    playerCount: nextSlot
  });

  currentRoomId = cleanId;
  playerNumber = nextSlot;
  return { roomId: cleanId, playerNumber };
}

// Listen to room updates from Firebase
export function subscribeToRoom(roomId, onUpdate) {
  if (!db) initFirebase();
  const roomRef = db.collection("rooms").doc(roomId);

  if (roomUnsubscribe) roomUnsubscribe();

  roomUnsubscribe = roomRef.onSnapshot((doc) => {
    if (doc.exists) {
      onUpdate(doc.data());
    }
  }, (err) => {
    console.error("Room sync error:", err);
  });
}

// Send updated game state or switch turn
export async function broadcastState(updates) {
  if (!db || !currentRoomId) return;
  const roomRef = db.collection("rooms").doc(currentRoomId);
  await roomRef.update(updates);
}

export function getCurrentPlayer() {
  return playerNumber;
}

export function getRoomId() {
  return currentRoomId;
}
