
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Radio, Users, Music } from 'lucide-react';

const SiteStatisticsManagement: React.FC = () => {
  const { toast } = useToast();
  const [stats, setStats] = useState({
    radioStationsCount: '7+',
    djsCount: '20+',
    listenersCount: '1M+'
  });
  
  // Load saved statistics on component mount
  useEffect(() => {
    const savedStats = localStorage.getItem('latinmixmasters_site_stats');
    if (savedStats) {
      try {
        setStats(JSON.parse(savedStats));
      } catch (error) {
        console.error('Failed to parse saved statistics:', error);
      }
    }
  }, []);
  
  const handleStatChange = (key: keyof typeof stats, value: string) => {
    setStats(prev => ({
      ...prev,
      [key]: value
    }));
  };
  
  const saveStatistics = () => {
    // Save to localStorage
    localStorage.setItem('latinmixmasters_site_stats', JSON.stringify(stats));
    
    toast({
      title: "Site statistics updated",
      description: "The statistics displayed on the homepage have been updated."
    });
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Manage Site Statistics</CardTitle>
        <CardDescription>
          Update the statistics displayed on the homepage hero section
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Radio className="h-4 w-4 text-primary" />
                <Label htmlFor="radioStationsCount">Radio Stations Count</Label>
              </div>
              <Input
                id="radioStationsCount"
                value={stats.radioStationsCount}
                onChange={(e) => handleStatChange('radioStationsCount', e.target.value)}
                placeholder="e.g. 7+"
              />
              <p className="text-xs text-muted-foreground">
                The number of radio stations to display (use + for estimates)
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                <Label htmlFor="djsCount">DJs Count</Label>
              </div>
              <Input
                id="djsCount"
                value={stats.djsCount}
                onChange={(e) => handleStatChange('djsCount', e.target.value)}
                placeholder="e.g. 20+"
              />
              <p className="text-xs text-muted-foreground">
                The number of DJs to display (use + for estimates)
              </p>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Music className="h-4 w-4 text-primary" />
                <Label htmlFor="listenersCount">Active Listeners</Label>
              </div>
              <Input
                id="listenersCount"
                value={stats.listenersCount}
                onChange={(e) => handleStatChange('listenersCount', e.target.value)}
                placeholder="e.g. 1M+"
              />
              <p className="text-xs text-muted-foreground">
                The number of active listeners to display (use K or M for thousands/millions)
              </p>
            </div>
          </div>
          
          <Button onClick={saveStatistics} className="w-full md:w-auto">
            Save Statistics
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SiteStatisticsManagement;
