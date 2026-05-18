import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Toast from './components/Toast';
import Sidebar from './components/Sidebar';
import ProtectedRoute from './components/ProtectedRoute';
import KitchenGuard from './components/KitchenGuard';
import Dashboard from './pages/Dashboard';
import Foods from './pages/Foods';
import Categories from './pages/Categories';
import Orders from './pages/Orders';
import SelectKitchen from './pages/SelectKitchen';
import Login from './pages/Login';

export default function App() {
  return (
    <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/*" element={
            <ProtectedRoute>
              <div className="min-h-screen bg-neutral-100 flex">
                <Sidebar />
                <main className="flex-1 lg:ml-64 p-6 pt-20 lg:pt-6">
                  <Routes>
                    <Route path="/" element={<KitchenGuard><Dashboard /></KitchenGuard>} />
                    <Route path="/foods" element={<KitchenGuard><Foods /></KitchenGuard>} />
                    <Route path="/categories" element={<KitchenGuard><Categories /></KitchenGuard>} />
                    <Route path="/orders" element={<KitchenGuard><Orders /></KitchenGuard>} />
                    <Route path="/select-kitchen" element={<SelectKitchen />} />
                  </Routes>
                </main>
              </div>
            </ProtectedRoute>
          } />
        </Routes>
      <Toast />
    </AuthProvider>
  );
}
