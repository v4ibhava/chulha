import { MapPinIcon, PhoneIcon, EnvelopeIcon } from '@heroicons/react/24/solid';

export default function Footer() {
  return (
    <footer className="bg-charcoal-900 text-charcoal-400 pt-14 pb-8">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-10">
        <div className="col-span-1 md:col-span-1">
          <div className="flex items-center gap-2.5 mb-4">
            <div className="w-7 h-7 bg-primary-500 rounded-lg flex items-center justify-center">
              <span className="text-white text-sm font-black">C</span>
            </div>
            <span className="text-lg font-display font-black text-white tracking-tight">CHULHA</span>
          </div>
          <p className="text-xs leading-relaxed mb-5">
            Crafting artisanal culinary experiences and delivering them with professional precision. From our heart to your hearth.
          </p>
          <div className="flex gap-3">
             <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-primary-500 transition-colors cursor-pointer text-xs font-bold text-white">FB</div>
             <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-primary-500 transition-colors cursor-pointer text-xs font-bold text-white">IG</div>
             <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-primary-500 transition-colors cursor-pointer text-xs font-bold text-white">TW</div>
          </div>
        </div>

        <div>
          <h4 className="text-white font-bold text-xs uppercase tracking-widest mb-4">Explore</h4>
          <div className="flex flex-col gap-3 text-xs font-bold">
            <span className="hover:text-primary-400 cursor-pointer transition-colors">Menu</span>
            <span className="hover:text-primary-400 cursor-pointer transition-colors">Special Offers</span>
            <span className="hover:text-primary-400 cursor-pointer transition-colors">Locations</span>
            <span className="hover:text-primary-400 cursor-pointer transition-colors">Order Tracker</span>
          </div>
        </div>

        <div>
          <h4 className="text-white font-bold text-xs uppercase tracking-widest mb-4">Support</h4>
          <div className="flex flex-col gap-3 text-xs font-bold">
            <span className="hover:text-primary-400 cursor-pointer transition-colors">Help Center</span>
            <span className="hover:text-primary-400 cursor-pointer transition-colors">Privacy Policy</span>
            <span className="hover:text-primary-400 cursor-pointer transition-colors">Terms of Use</span>
            <span className="hover:text-primary-400 cursor-pointer transition-colors">Contact Us</span>
          </div>
        </div>

        <div>
          <h4 className="text-white font-bold text-xs uppercase tracking-widest mb-4">Reach Us</h4>
          <div className="flex flex-col gap-3 text-xs">
            <div className="flex items-start gap-2.5">
               <MapPinIcon className="w-4 h-4 text-primary-500 shrink-0" />
               <span>street fighter, Naraklok, Mumbai</span>
            </div>
            <div className="flex items-center gap-2.5">
               <PhoneIcon className="w-4 h-4 text-primary-500 shrink-0" />
               <span>+91 98765 43210</span>
            </div>
            <div className="flex items-center gap-2.5">
               <EnvelopeIcon className="w-4 h-4 text-primary-500 shrink-0" />
               <span>orders@chulha.com</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 mt-14 pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="text-[10px] font-bold uppercase tracking-[0.2em]">
          &copy; {new Date().getFullYear()} CHULHA ARTISANAL KITCHEN.
        </div>
        <div className="flex gap-6 text-[10px] font-bold uppercase tracking-widest">
           <span className="hover:text-white cursor-pointer transition-colors">Privacy</span>
           <span className="hover:text-white cursor-pointer transition-colors">Terms</span>
           <span className="hover:text-white cursor-pointer transition-colors">Accessibility</span>
        </div>
      </div>
    </footer>
  );
}
