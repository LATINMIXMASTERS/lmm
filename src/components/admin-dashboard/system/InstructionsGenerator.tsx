
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { generateWordDocument } from './wordDocumentGenerator';

const InstructionsGenerator: React.FC = () => {
  const { toast } = useToast();

  const downloadInstructions = () => {
    generateWordDocument();
    
    toast({
      title: "Instructions Downloaded",
      description: "Installation instructions have been downloaded as a Word document with troubleshooting guides."
    });
  };

  return (
    <Card className="border border-dashed p-4">
      <CardHeader className="p-3">
        <CardTitle className="text-lg">Installation Guide</CardTitle>
        <CardDescription>
          Download VPS installation instructions with troubleshooting guide
        </CardDescription>
      </CardHeader>
      <CardContent className="p-3">
        <Button 
          variant="outline" 
          className="w-full" 
          onClick={downloadInstructions}
        >
          <Download className="mr-2" />
          Download Instructions
        </Button>
      </CardContent>
    </Card>
  );
};

export default InstructionsGenerator;
