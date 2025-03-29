
import React, { useRef } from 'react';
import { Music, FileMusic, X, Cloud } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

interface AudioFileUploadProps {
  audioFile: File | null;
  setAudioFile: (file: File | null) => void;
  maxFileSize: number;
}

const AudioFileUpload: React.FC<AudioFileUploadProps> = ({
  audioFile,
  setAudioFile,
  maxFileSize
}) => {
  const audioInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  
  // Handle audio file selection
  const handleAudioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      
      // Check file size
      if (file.size > maxFileSize) {
        toast({
          title: "File too large",
          description: "Maximum file size is 250MB",
          variant: "destructive"
        });
        return;
      }
      
      setAudioFile(file);
    }
  };
  
  return (
    <div className="space-y-2">
      <Label>Audio File (Max 250MB)</Label>
      <div className="flex items-center gap-4">
        {audioFile ? (
          <div className="flex-1 bg-muted rounded-md p-3 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <FileMusic className="text-blue" />
              <span className="font-medium truncate">{audioFile.name}</span>
              <span className="text-muted-foreground text-sm">
                ({(audioFile.size / (1024 * 1024)).toFixed(2)} MB)
              </span>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => {
                setAudioFile(null);
                if (audioInputRef.current) audioInputRef.current.value = '';
              }}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          <Button
            type="button"
            variant="outline"
            className="flex-1 py-8"
            onClick={() => audioInputRef.current?.click()}
          >
            <div className="flex flex-col items-center">
              <div className="flex items-center mb-2">
                <Music className="h-6 w-6 mr-1" />
                <Cloud className="h-5 w-5" />
              </div>
              <span>Select audio file</span>
              <span className="text-xs text-muted-foreground mt-1">MP3 format, max 250MB</span>
              <span className="text-xs text-muted-foreground mt-1">Large files require S3 configuration</span>
            </div>
          </Button>
        )}
        <input
          ref={audioInputRef}
          type="file"
          accept=".mp3,audio/mp3"
          onChange={handleAudioChange}
          className="hidden"
        />
      </div>
    </div>
  );
};

export default AudioFileUpload;
