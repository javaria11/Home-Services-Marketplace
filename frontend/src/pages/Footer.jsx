import { Home as HomeIcon, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

function Footer() {
  return (
    <footer className="bg-[#0F172A] text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 py-12 grid grid-cols-1 sm:grid-cols-4 gap-10">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <div className="w-8 h-8 rounded-lg bg-[#00236F] flex items-center justify-center">
              <HomeIcon className="w-4 h-4" />
            </div>
            <span className="text-lg font-bold">HomeEase AI</span>
          </div>
          <p className="text-slate-400 text-sm leading-relaxed">
            The premier AI-orchestrated marketplace for background-checked home service
            professionals. Guaranteed upfront pricing and 100% satisfaction protection on every
            appointment.
          </p>
          <p className="flex items-center gap-1.5 text-[#A4F1B2] text-xs font-semibold mt-4">
            <ShieldCheck className="w-3.5 h-3.5" /> Licensed, Bonded, and Verified Network
          </p>
        </div>

        <div>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Services</h3>
          <ul className="space-y-2 text-sm text-slate-300">
            <li><Link to="/search" className="hover:text-white transition-colors">Plumbing & Drains</Link></li>
            <li><Link to="/search" className="hover:text-white transition-colors">Electrical & Lighting</Link></li>
            <li><Link to="/search" className="hover:text-white transition-colors">Interior Painting</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Platform</h3>
          <ul className="space-y-2 text-sm text-slate-300">
            <li><Link to="/estimate" className="hover:text-white transition-colors">Price Estimate</Link></li>
            <li><Link to="/search" className="hover:text-white transition-colors">HomeEase AI Matching</Link></li>
            <li><span className="text-slate-500">Satisfaction Guarantee</span></li>
          </ul>
        </div>

        <div>
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Support</h3>
          <ul className="space-y-2 text-sm text-slate-300">
            <li className="text-slate-500">support@homeease.ai</li>
            <li className="text-slate-500">Nationwide Coverage</li>
            <li className="text-slate-500">Help Center & FAQ</li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10 py-5 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} HomeEase AI, Inc. All rights reserved.
      </div>
    </footer>
  );
}

export default Footer;
