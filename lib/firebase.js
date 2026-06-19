import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

// EVSE EPC Firebase project — Storage removed (not needed on free plan)
const firebaseConfig = {
  apiKey:            "AIzaSyB_dJR3xYn9MxEm_I4fkTcZwlOAog8T0XY",
  authDomain:        "evse-epc.firebaseapp.com",
  projectId:         "evse-epc",
  storageBucket:     "evse-epc.firebasestorage.app",
  messagingSenderId: "183412252323",
  appId:             "1:183412252323:web:7bd89f120b2a73d5732916",
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApps()[0];

export const db   = getFirestore(app);
export const auth = getAuth(app);
