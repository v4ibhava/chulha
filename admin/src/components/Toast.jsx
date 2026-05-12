import { Toaster } from 'react-hot-toast';

export default function Toast() {
  return <Toaster position="bottom-right" toastOptions={{ duration: 3000, style: { background: '#1f2937', color: '#fff', fontSize: '14px' }, success: { iconTheme: { primary: '#22c55e', secondary: '#fff' } }, error: { iconTheme: { primary: '#ef4444', secondary: '#fff' } } }} />;
}
