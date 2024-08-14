
// Importa las funciones necesarias de los SDKs de Firebase
import { initializeApp } from "firebase/app";
import { getAnalytics, type Analytics } from "firebase/analytics";
import { getFirestore } from 'firebase/firestore'

interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
  measurementId?: string;
}

// Configuración de tu aplicación web de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyC306t7VYi8I6H10jU1X0wZjtXhLObr-v4",
    authDomain: "chainreaction-dd626.firebaseapp.com",
    projectId: "chainreaction-dd626",
    storageBucket: "chainreaction-dd626.appspot.com",
    messagingSenderId: "668384682689",
    appId: "1:668384682689:web:de3e58086991bdf8df2a40",
    measurementId: "G-Q08WC6HKEK"
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app)


// Inicializa Analytics solo si se ejecuta en el cliente y Firebase Analytics está disponible
let analytics: Analytics | undefined;
if(typeof window !== "undefined" && firebaseConfig.measurementId) {
  console.log(app)
  analytics = getAnalytics(app);
}

export { app, analytics, db };