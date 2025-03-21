
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Github, X, Instagram, Facebook, Youtube, Linkedin } from 'lucide-react';
import { SocialLinkType, initialSocialLinks } from '@/components/admin-dashboard/SocialMediaConfig';

const socialIcons = {
  x: <X className="w-5 h-5" />,
  instagram: <Instagram className="w-5 h-5" />,
  facebook: <Facebook className="w-5 h-5" />,
  github: <Github className="w-5 h-5" />,
  youtube: <Youtube className="w-5 h-5" />,
  linkedin: <Linkedin className="w-5 h-5" />
};

const Footer: React.FC = () => {
  const [activeSocialLinks, setActiveSocialLinks] = useState<SocialLinkType[]>([]);

  useEffect(() => {
    // Get social links from localStorage or use the initial ones
    const savedLinks = localStorage.getItem('socialLinks');
    const links = savedLinks ? JSON.parse(savedLinks) : initialSocialLinks;
    
    // Filter to only show active links with valid URLs
    setActiveSocialLinks(links.filter((link: SocialLinkType) => link.active && link.url));
  }, []);

  return (
    <footer className="bg-gray-lightest border-t border-gray-light py-10 px-4 md:px-8 mt-auto relative z-10">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo and about */}
          <div className="md:col-span-1">
            <Link to="/" className="flex items-center mb-4">
              <img 
                src="/lovable-uploads/42fbeaeb-8383-46a5-99ec-9eade511c5a3.png" 
                alt="LATINMIXMASTERS Logo" 
                className="h-10"
              />
            </Link>
            <p className="text-sm text-gray-dark max-w-xs">
              Your ultimate destination for streaming the best Latin music and radio stations from around the world.
            </p>
          </div>

          {/* Links */}
          <div className="md:col-span-2 grid grid-cols-2 gap-8">
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">Navigate</h3>
              <ul className="space-y-2">
                <li>
                  <Link to="/" className="text-gray-dark hover:text-gold transition-colors duration-300">
                    Home
                  </Link>
                </li>
                <li>
                  <Link to="/stations" className="text-gray-dark hover:text-gold transition-colors duration-300">
                    Radio Stations
                  </Link>
                </li>
                <li>
                  <Link to="/djs" className="text-gray-dark hover:text-gold transition-colors duration-300">
                    DJs
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">Legal</h3>
              <ul className="space-y-2">
                <li>
                  <Link to="/privacy-policy" className="text-gray-dark hover:text-gold transition-colors duration-300">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link to="/terms-of-service" className="text-gray-dark hover:text-gold transition-colors duration-300">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link to="/cookie-policy" className="text-gray-dark hover:text-gold transition-colors duration-300">
                    Cookie Policy
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Social and newsletter */}
          <div className="md:col-span-1">
            {activeSocialLinks.length > 0 && (
              <>
                <h3 className="text-sm font-semibold uppercase tracking-wider mb-4">Connect With Us</h3>
                <div className="flex space-x-4 mb-6">
                  {activeSocialLinks.map((link, index) => (
                    <a
                      key={index}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-dark hover:text-gold transition-colors duration-300"
                      aria-label={link.platform}
                    >
                      {socialIcons[link.platform as keyof typeof socialIcons]}
                    </a>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-10 pt-8 border-t border-gray-light flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray">&copy; {new Date().getFullYear()} LATINMIXMASTERS LLC. All rights reserved.</p>
          <p className="text-sm text-gray mt-4 md:mt-0">INTERNATIONAL DJ CREW</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
