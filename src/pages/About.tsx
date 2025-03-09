
import React, { useState, useEffect } from 'react';
import { Radio, Music, Headphones, Mail, MessageCircle, Share2 } from 'lucide-react';
import MainLayout from '@/layout/MainLayout';
import { cn } from '@/lib/utils';

const AboutPage: React.FC = () => {
  const [isAnimated, setIsAnimated] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsAnimated(true);
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  return (
    <MainLayout>
      {/* Hero Section */}
      <section className="text-center max-w-5xl mx-auto mb-20">
        <div 
          className={cn(
            "inline-flex items-center px-3 py-1 rounded-full bg-blue/10 text-blue text-xs font-medium mb-4",
            !isAnimated ? "opacity-0" : "animate-fade-in"
          )}
        >
          Our Story
        </div>
        <h1 
          className={cn(
            "text-4xl md:text-5xl font-bold mb-6",
            !isAnimated ? "opacity-0" : "animate-slide-down"
          )}
          style={{ animationDelay: "0.1s" }}
        >
          About WaveRadio
        </h1>
        <p 
          className={cn(
            "text-gray-dark text-lg mb-10 max-w-3xl mx-auto",
            !isAnimated ? "opacity-0" : "animate-slide-down"
          )}
          style={{ animationDelay: "0.2s" }}
        >
          We're passionate about connecting music lovers with radio stations from around the globe. Our platform offers a seamless listening experience with high-quality audio and a beautiful interface.
        </p>
        
        <div 
          className={cn(
            "relative h-80 md:h-96 rounded-xl overflow-hidden",
            !isAnimated ? "opacity-0" : "animate-scale-in"
          )}
          style={{ animationDelay: "0.3s" }}
        >
          <img 
            src="https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=2000&auto=format&fit=crop" 
            alt="Team photo" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end">
            <div className="p-8 text-white text-left">
              <h2 className="text-2xl font-bold mb-2">Connecting the world through music</h2>
              <p className="text-white/90 max-w-lg">Founded in 2023, WaveRadio has grown to become a platform used by millions of listeners worldwide.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Mission */}
      <section className="mb-20">
        <div className="max-w-5xl mx-auto">
          <div 
            className={cn(
              "grid grid-cols-1 md:grid-cols-2 gap-12 items-center",
              !isAnimated ? "opacity-0" : "animate-slide-down"
            )}
            style={{ animationDelay: "0.4s" }}
          >
            <div>
              <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
              <p className="text-gray-dark mb-4">
                At WaveRadio, we believe in the power of music to connect people across cultures and borders. Our mission is to make radio stations from every corner of the world accessible to anyone with an internet connection.
              </p>
              <p className="text-gray-dark mb-4">
                We're committed to providing a premium listening experience with:
              </p>
              <ul className="space-y-3">
                {[
                  { text: "High-quality, uninterrupted streaming", icon: <Music className="w-5 h-5" /> },
                  { text: "Carefully curated station selections", icon: <Radio className="w-5 h-5" /> },
                  { text: "Beautiful, intuitive user interface", icon: <Headphones className="w-5 h-5" /> },
                ].map((item, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-blue mr-3 mt-0.5">{item.icon}</span>
                    <span>{item.text}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="relative">
              <div className="absolute -z-10 w-72 h-72 bg-blue/10 rounded-full top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 blur-3xl"></div>
              <div className="bg-white rounded-xl overflow-hidden border border-gray-light shadow-xl">
                <img 
                  src="https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=800&auto=format&fit=crop" 
                  alt="Our mission" 
                  className="w-full h-64 object-cover"
                />
                <div className="p-6">
                  <h3 className="text-xl font-medium mb-2">Global Reach</h3>
                  <p className="text-gray">
                    With stations from over 150 countries and content in dozens of languages, we're breaking down barriers to musical discovery.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section 
        className={cn(
          "py-20 bg-gray-lightest rounded-xl mb-20",
          !isAnimated ? "opacity-0" : "animate-fade-in"
        )}
        style={{ animationDelay: "0.5s" }}
      >
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Why Choose WaveRadio</h2>
            <p className="text-gray-dark max-w-xl mx-auto">
              We're dedicated to creating the best radio streaming experience possible.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Crystal Clear Sound",
                description: "Experience high-fidelity audio streaming with minimal buffering and interruptions.",
                icon: <Headphones className="w-6 h-6" />
              },
              {
                title: "Extensive Library",
                description: "Access thousands of stations across all genres, from mainstream hits to niche discoveries.",
                icon: <Radio className="w-6 h-6" />
              },
              {
                title: "Seamless Experience",
                description: "Enjoy a beautiful interface that makes finding and enjoying your favorite stations effortless.",
                icon: <Music className="w-6 h-6" />
              }
            ].map((feature, index) => (
              <div 
                key={index} 
                className="bg-white rounded-xl p-6 border border-gray-light shadow-sm hover:shadow-md transition-shadow duration-300"
              >
                <div className="w-14 h-14 bg-blue/10 text-blue rounded-full flex items-center justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-medium mb-2">{feature.title}</h3>
                <p className="text-gray-dark">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="mb-20 max-w-5xl mx-auto">
        <div 
          className={cn(
            "text-center mb-12",
            !isAnimated ? "opacity-0" : "animate-slide-down"
          )}
          style={{ animationDelay: "0.6s" }}
        >
          <h2 className="text-3xl font-bold mb-4">Meet Our Team</h2>
          <p className="text-gray-dark max-w-2xl mx-auto">
            We're a dedicated group of music lovers and tech enthusiasts working to bring you the best radio experience.
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {[
            {
              name: "Alex Morgan",
              role: "Founder & CEO",
              image: "https://images.unsplash.com/photo-1543610892-0b1f7e6d8ac1?q=80&w=350&auto=format&fit=crop"
            },
            {
              name: "Sarah Chen",
              role: "Head of Content",
              image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=350&auto=format&fit=crop"
            },
            {
              name: "Marcus Johnson",
              role: "Lead Developer",
              image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?q=80&w=350&auto=format&fit=crop"
            }
          ].map((member, index) => (
            <div 
              key={index} 
              className={cn(
                "bg-white rounded-xl overflow-hidden border border-gray-light shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1",
                !isAnimated ? "opacity-0" : "animate-scale-in"
              )}
              style={{ animationDelay: `${index * 0.1 + 0.7}s` }}
            >
              <div className="h-60 overflow-hidden">
                <img 
                  src={member.image} 
                  alt={member.name} 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-medium mb-1">{member.name}</h3>
                <p className="text-gray">{member.role}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Contact */}
      <section 
        className={cn(
          "bg-blue text-white rounded-xl py-16 px-6 mb-20 overflow-hidden relative",
          !isAnimated ? "opacity-0" : "animate-fade-in"
        )}
        style={{ animationDelay: "0.8s" }}
      >
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-blue-light/20 to-transparent"></div>
        <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-gradient-to-t from-blue-dark/30 to-transparent"></div>
        
        <div className="max-w-5xl mx-auto relative z-10">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-4">Get In Touch</h2>
            <p className="text-blue-50/90 max-w-xl mx-auto">
              Have questions or feedback? We'd love to hear from you. Reach out using any of the methods below.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Email Us",
                description: "Send us an email and we'll get back to you within 24 hours.",
                icon: <Mail className="w-6 h-6" />,
                action: "hello@waveradio.com"
              },
              {
                title: "Live Chat",
                description: "Chat with our support team for immediate assistance.",
                icon: <MessageCircle className="w-6 h-6" />,
                action: "Start a chat"
              },
              {
                title: "Follow Us",
                description: "Stay updated with the latest news and features.",
                icon: <Share2 className="w-6 h-6" />,
                action: "View our socials"
              }
            ].map((item, index) => (
              <div 
                key={index} 
                className="bg-white/10 backdrop-blur-md rounded-xl p-6 border border-white/20 hover:bg-white/15 transition-colors duration-300"
              >
                <div className="w-14 h-14 bg-white/20 text-white rounded-full flex items-center justify-center mb-4">
                  {item.icon}
                </div>
                <h3 className="text-xl font-medium mb-2">{item.title}</h3>
                <p className="text-blue-50/80 mb-4">{item.description}</p>
                <button className="text-white hover:underline font-medium">
                  {item.action}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>
    </MainLayout>
  );
};

export default AboutPage;
