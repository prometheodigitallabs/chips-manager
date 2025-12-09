import { useState, useEffect } from 'react';
import { signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../config/firebase'; // Importamos la auth configurada

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Intentar iniciar sesión anónima automáticamente al cargar
    const signIn = async () => {
      try {
        await signInAnonymously(auth);
      } catch (error) {
        console.error("Error al iniciar sesión anónima:", error);
      }
    };

    signIn();

    // 2. Escuchar cambios en la autenticación
    // Esto nos avisa cuando Firebase ya confirmó que somos un usuario válido
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false); // Dejamos de cargar cuando ya sabemos quién es el usuario
    });

    // Limpieza al desmontar
    return () => unsubscribe();
  }, []);

  return { user, loading };
};