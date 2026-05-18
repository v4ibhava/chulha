import { Navigate } from 'react-router-dom';

export default function KitchenGuard({ children }) {
  const activeKitchen = localStorage.getItem('chulha_kitchen_coords');
  
  // If no kitchen outlet has been selected yet, redirect to selection screen
  if (!activeKitchen) {
    return <Navigate to="/select-kitchen" replace />;
  }
  
  return children;
}
