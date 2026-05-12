import { FireIcon, MapPinIcon, PhoneIcon, EnvelopeIcon } from '@heroicons/react/24/solid';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 mt-16">
      <div className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <FireIcon className="w-6 h-6 text-primary-500" />
            <span className="text-xl font-bold text-white">Chulha</span>
          </div>
          <p className="text-sm">Delicious food delivered to your doorstep. Order now and enjoy!</p>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-3">Quick Links</h4>
          <div className="flex flex-col gap-2 text-sm">
            <span className="hover:text-white cursor-pointer">About Us</span>
            <span className="hover:text-white cursor-pointer">Contact</span>
            <span className="hover:text-white cursor-pointer">Privacy Policy</span>
            <span className="hover:text-white cursor-pointer">Terms of Service</span>
          </div>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-3">Contact</h4>
          <div className="flex flex-col gap-2 text-sm">
            <span><MapPinIcon className="inline w-4 h-4 mr-1" />street fighter, Naraklok</span>
            <span><PhoneIcon className="inline w-4 h-4 mr-1" /> +1234567890</span>
            <span><EnvelopeIcon className="inline w-4 h-4 mr-1" /> hello@chulha.com</span>
          </div>
        </div>
      </div>
      <div className="border-t border-gray-800 text-center py-4 text-sm">
        &copy; {new Date().getFullYear()} Chulha. All rights reserved.
      </div>
    </footer>
  );
}
