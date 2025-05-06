/* eslint-disable @typescript-eslint/no-explicit-any */
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const loginUser = async (loginData: { dato_usuario: string; contrasena_usuario: string }) => {
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify(loginData),
    });

    const data = await response.json();
    
    if (!response.ok) {
      if (response.status === 401) {
        throw new Error("Usuario o contraseña incorrectos");
      } else if (response.status === 404) {
        throw new Error("Usuario no encontrado");
      } else {
        throw new Error(data.message || "Error al iniciar sesión");
      }
    }
    
    return data;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("Error en loginUser:", error);
    if (error.message === "Failed to fetch") {
      throw new Error("Error de conexión con el servidor. Por favor, verifica tu conexión a internet o inténtalo más tarde.");
    }
    throw error;
  }
};

export const registerUser = async (userData: { [key: string]: any }) => {
  try {
    // Verificar que dato_usuario esté presente y no esté vacío
    if (!userData.dato_usuario || userData.dato_usuario.trim() === '') {
      throw new Error("El nombre de usuario es requerido");
    }

    console.log("Datos a enviar al servidor:", userData); // Para debug

    const response = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify(userData),
    });

    const data = await response.json();
    console.log("Respuesta del servidor:", data); // Para debug

    if (!response.ok) {
      throw new Error(data.message || "Error al registrar el usuario");
    }
    return data;
  } catch (error: any) {
    console.error("Error en registerUser:", error);
    if (error.message === "Failed to fetch") {
      throw new Error("Error de conexión con el servidor. Por favor, verifica tu conexión a internet o inténtalo más tarde.");
    }
    throw error;
  }
};

