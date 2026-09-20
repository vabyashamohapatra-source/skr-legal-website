import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Menu, X } from 'lucide-react';

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: 'Home', href: '/' },
    { name: 'About', href: '/#about' },
    { name: 'Practice Areas', href: '/#practice' },
    { name: 'Experience', href: '/#experience' },
    { name: 'Blog', href: '/blog' },
    { name: 'Contact', href: '/#contact' },
  ];

  return (
    <nav className="fixed w-full z-50 bg-[#050a30] py-4 shadow-lg shadow-black/20 border-b border-white/5">
      <div className="max-w-7xl mx-auto px-6 md:px-12 flex justify-between items-center">
        <Link to="/" className="font-serif text-2xl font-bold tracking-wider text-white">
          SKR<span className="text-[#d4af37]">.</span>
        </Link>
        
        {/* Desktop Nav */}
        <div className="hidden md:flex items-center space-x-8">
          {navLinks.map((link) => (
            link.href.startsWith('/#') ? (
              <a 
                key={link.name} 
                href={link.href}
                className="text-sm uppercase tracking-widest text-gray-300 hover:text-[#d4af37] transition-colors"
              >
                {link.name}
              </a>
            ) : (
              <Link 
                key={link.name} 
                to={link.href}
                className="text-sm uppercase tracking-widest text-gray-300 hover:text-[#d4af37] transition-colors"
              >
                {link.name}
              </Link>
            )
          ))}
        </div>

        {/* Mobile Menu Toggle */}
        <button 
          className="md:hidden text-white"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Nav */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-[#0a1142] border-t border-white/10 py-4 px-6 flex flex-col space-y-4 shadow-xl">
          {navLinks.map((link) => (
            link.href.startsWith('/#') ? (
              <a 
                key={link.name} 
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-sm uppercase tracking-widest text-gray-300 hover:text-[#d4af37] transition-colors"
              >
                {link.name}
              </a>
            ) : (
              <Link 
                key={link.name} 
                to={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-sm uppercase tracking-widest text-gray-300 hover:text-[#d4af37] transition-colors"
              >
                {link.name}
              </Link>
            )
          ))}
        </div>
      )}
    </nav>
  );
}
