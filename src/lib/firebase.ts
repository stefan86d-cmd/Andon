
// This file is intentionally left blank to disable Firebase integration.
// The configuration has been removed to allow for offline UI/feature development.

const app = {};
const auth = {};
const db = {};
const googleProvider = {};
const signInWithPopup = async () => { throw new Error("Firebase is disabled."); };


export { app, auth, db, googleProvider, signInWithPopup };
