export const saveAuth = (data: {
  token: string;
  nom: string;
  email: string;
  role: string;
}) => {
  localStorage.setItem('token', data.token);
  localStorage.setItem('nom', data.nom);
  localStorage.setItem('email', data.email);
  localStorage.setItem('role', data.role);
};

export const getToken = () => localStorage.getItem('token');
export const getNom = () => localStorage.getItem('nom');
export const getRole = () => localStorage.getItem('role');
export const isAuthenticated = () => !!localStorage.getItem('token');

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('nom');
  localStorage.removeItem('email');
  localStorage.removeItem('role');
  window.location.href = '/login';
};