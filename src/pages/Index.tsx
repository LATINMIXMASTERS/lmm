
import React from 'react';
import MainLayout from '@/layout/MainLayout';
import Hero from '@/components/Hero';
import TestAccount from '@/components/TestAccount';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRadio } from '@/contexts/RadioContext';
import { RadioStation } from '@/models/RadioStation';
import { Link } from 'react-router-dom';
import { Play, Radio } from 'lucide-react';

const Index = () => {
  const { stations, setCurrentPlayingStation } = useRadio();
  
  // Get featured stations (first 3)
  const featuredStations = stations.slice(0, 3);
  
  const handlePlay = (station: RadioStation) => {
    setCurrentPlayingStation(station.id);
  };
  
  return (
    <MainLayout>
      <Hero />
      
      <div className="container py-12">
        {/* Test Account Section */}
        <TestAccount />
        
        {/* Featured Stations */}
        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6">Featured Radio Stations</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredStations.map((station) => (
              <Card key={station.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="aspect-video relative">
                  <img 
                    src={station.image} 
                    alt={station.name} 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4">
                    <h3 className="text-xl font-bold text-white">{station.name}</h3>
                    <p className="text-white/90">{station.genre}</p>
                  </div>
                </div>
                <CardContent className="p-4">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                      <Radio className="h-4 w-4 text-blue" />
                      <span className="text-sm text-muted-foreground">{station.listeners} listeners</span>
                    </div>
                    <div className="flex space-x-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handlePlay(station)}
                      >
                        <Play className="mr-1 h-4 w-4" /> Listen
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        asChild
                      >
                        <Link to={`/stations/${station.id}`}>
                          Details
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="flex justify-center mt-8">
            <Button asChild variant="outline">
              <Link to="/stations">View All Stations</Link>
            </Button>
          </div>
        </section>
      </div>
    </MainLayout>
  );
};

export default Index;
