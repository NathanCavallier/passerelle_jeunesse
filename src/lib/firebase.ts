// Import the functions you need from the SDKs you need
import { initializeApp, getApps, type FirebaseApp } from "firebase/app";
import { getAuth, connectAuthEmulator, type Auth } from "firebase/auth";
import { getFirestore, connectFirestoreEmulator, type Firestore } from "firebase/firestore";
import { getStorage, connectStorageEmulator, type FirebaseStorage } from "firebase/storage";

// Résout la config Firebase côté client.
// En priorité : FIREBASE_WEBAPP_CONFIG, injecté automatiquement par Firebase App Hosting.
// En repli : les variables NEXT_PUBLIC_FIREBASE_* (utile en local avec .env.local).
function resolveFirebaseConfig() {
    if (process.env.FIREBASE_WEBAPP_CONFIG) {
        try {
            return JSON.parse(process.env.FIREBASE_WEBAPP_CONFIG);
        } catch {
            // JSON invalide : on retombe sur les variables NEXT_PUBLIC_*
        }
    }
    return {
        apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
        authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    };
}

let _app: FirebaseApp | undefined;
let _auth: Auth | undefined;
let _db: Firestore | undefined;
let _storage: FirebaseStorage | undefined;

function getFirebaseApp(): FirebaseApp {
    if (_app) return _app;

    const config = resolveFirebaseConfig();
    if (!config.apiKey) {
        throw new Error(
            "Firebase config manquante (apiKey absente) — vérifie FIREBASE_WEBAPP_CONFIG ou les variables NEXT_PUBLIC_FIREBASE_*."
        );
    }

    _app = getApps().length === 0 ? initializeApp(config) : getApps()[0];
    return _app;
}

// Initialisation paresseuse : ces fonctions ne s'exécutent que lorsqu'elles
// sont appelées (dans un composant client, un handler, etc.), jamais au
// chargement du module. Ça évite le crash au build (prerendering) quand les
// variables d'environnement client ne sont pas encore disponibles.

export function getFirebaseAuth(): Auth {
    if (_auth) return _auth;
    _auth = getAuth(getFirebaseApp());
    if (process.env.NODE_ENV === "development" && process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === "true") {
        connectAuthEmulator(_auth, "http://localhost:9099");
    }
    return _auth;
}

export function getFirebaseDb(): Firestore {
    if (_db) return _db;
    _db = getFirestore(getFirebaseApp());
    if (process.env.NODE_ENV === "development" && process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === "true") {
        connectFirestoreEmulator(_db, "localhost", 8080);
    }
    return _db;
}

export function getFirebaseStorage(): FirebaseStorage {
    if (_storage) return _storage;
    _storage = getStorage(getFirebaseApp());
    if (process.env.NODE_ENV === "development" && process.env.NEXT_PUBLIC_USE_FIREBASE_EMULATOR === "true") {
        connectStorageEmulator(_storage, "localhost", 9199);
    }
    return _storage;
}
