
import React from 'react';
import { Link } from 'react-router-dom';
import { GitHub, Twitter, Instagram, Music } from 'lucide-react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-lightest border-t border-gray-light py-10 px-4 md:px-8 mt-auto relative z-10">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and about */}
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center space-x-2 mb-4">
              <div className="w-10 h-10 bg-blue rounded-full flex items-center justify-center text-white">
                <Music className="w-5 h-5" />
              </div>
              <span className="text-xl font-medium">WaveRadio</span>
            </Link>
            <p className="text-sm text-gray-dark max-w-xs">
              Your ultimate destination for streaming the best radio stations from around the world.
            </p>
          </div>

          {/* Links */}
          <div className="md:col-span-2 grid grid-cols-2 gap-8">
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">Navigate</h3>
              <ul className="space-y-2">
                <li>
                  <Link to="/" className="text-gray-dark hover:text-blue transition-colors duration-300">
                    Home
                  </Link>
                </li>
                <li>
                  <Link to="/stations" className="text-gray-dark hover:text-blue transition-colors duration-300">
                    Radio Stations
                  </Link>
                </li>
                <li>
                  <Link to="/about" className="text-gray-dark hover:text-blue transition-colors duration-300">
                    About Us
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">Legal</h3>
              <ul className="space-y-2">
                <li>
                  <Link to="#" className="text-gray-dark hover:text-blue transition-colors duration-300">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link to="#" className="text-gray-dark hover:text-blue transition-colors duration-300">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link to="#" className="text-gray-dark hover:text-blue transition-colors duration-300">
                    Cookie Policy
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Social and newsletter */}
          <div className="md:col-span-1">
            <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">Connect With Us</h3>
            <div className="flex space-x-4 mb-6">
              <a
                href="#"
                className="text-gray-dark hover:text-blue transition-colors duration-300"
                aria-label="GitHub"
              >
                <GitHub className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="text-gray-dark hover:text-blue transition-colors duration-300"
                aria-label="Twitter"
              >
                <Twitter className="w-5 h-5" />
              </a>
              <a
                href="#"
                className="text-gray-dark hover:text-blue transition-colors duration-300"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-10 pt-8 border-t border-gray-light flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray">&copy; {new Date().getFullYear()} WaveRadio. All rights reserved.</p>
          <p className="text-sm text-gray mt-4 md:mt-0">Designed with simplicity in mind.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
