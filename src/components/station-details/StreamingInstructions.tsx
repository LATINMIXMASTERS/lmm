
import React from 'react';
import { Info } from 'lucide-react';

interface StreamingInstructionsProps {
  stationName: string;
  streamUrl?: string;
  streamPort?: string;
}

const StreamingInstructions: React.FC<StreamingInstructionsProps> = ({ 
  stationName, 
  streamUrl, 
  streamPort 
}) => {
  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold mb-2 flex items-center">
        <Info className="w-4 h-4 mr-2" />
        Streaming Instructions
      </h3>
      <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-md">
        <h4 className="font-semibold mb-2">Instructions for BUTT (Broadcast Using This Tool)</h4>
        <ol className="list-decimal pl-5 space-y-2 text-sm">
          <li>Download and install BUTT from <a href="https://danielnoethen.de/butt/" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">https://danielnoethen.de/butt/</a></li>
          <li>Open BUTT and go to Settings</li>
          <li>In the "Server" tab, click "Add" to create a new server</li>
          <li>Enter a name for your server (e.g., "{stationName}")</li>
          <li>Set the server type to "Shoutcast"</li>
          <li>Enter your stream URL in the "Address" field: {streamUrl || "Not configured"}</li>
          <li>Enter your port number in the "Port" field: {streamPort || "Not configured"}</li>
          <li>Enter your stream password in the "Password" field</li>
          <li>In the "Audio" tab, select your microphone or audio input device</li>
          <li>Click "Save" to save your settings</li>
          <li>In the main BUTT window, select your server from the dropdown menu</li>
          <li>Click "Play" to start broadcasting to your station</li>
        </ol>
        
        <div className="mt-4 p-3 bg-blue-100 dark:bg-blue-900 rounded-md">
          <p className="text-xs text-blue-700 dark:text-blue-300">
            <strong>Tip:</strong> For the best audio quality, configure BUTT settings to use MP3 encoding with a bitrate of at least 128 kbps. For talk shows, you can use a lower bitrate (64-96 kbps), while music shows should use higher bitrates (128-320 kbps).
          </p>
        </div>
      </div>
    </div>
  );
};

export default StreamingInstructions;
