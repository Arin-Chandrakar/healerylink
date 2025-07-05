
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, FileText, Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface HealthIssueReportProps {
  onClose: () => void;
}

const HealthIssueReport = ({ onClose }: HealthIssueReportProps) => {
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState('');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type === 'application/pdf') {
        setFile(selectedFile);
        toast.success('PDF file selected');
      } else {
        toast.error('Please select a PDF file');
      }
    }
  };

  const handleSubmit = async () => {
    if (!description.trim()) {
      toast.error('Please provide a description of your health issue');
      return;
    }

    if (!file) {
      toast.error('Please upload a PDF file');
      return;
    }

    setIsAnalyzing(true);
    
    try {
      // Convert PDF to base64
      const reader = new FileReader();
      reader.onload = async () => {
        const base64Data = reader.result as string;
        const base64Content = base64Data.split(',')[1];

        // Call Gemini analysis edge function
        const { data, error } = await supabase.functions.invoke('analyze-health-document', {
          body: {
            description,
            pdfData: base64Content,
            fileName: file.name
          }
        });

        if (error) {
          console.error('Analysis error:', error);
          toast.error('Failed to analyze document');
          return;
        }

        setAnalysis(data.analysis);
        toast.success('Document analyzed successfully');
      };

      reader.onerror = () => {
        toast.error('Failed to read PDF file');
      };

      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error submitting health report:', error);
      toast.error('Failed to submit health report');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
    >
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Report Health Issue
            <Button variant="ghost" size="sm" onClick={onClose}>
              ×
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">
              Describe your health issue
            </label>
            <Textarea
              placeholder="Please describe your symptoms, concerns, or health issue in detail..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-24"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Upload Medical Document (PDF)
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <Input
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="hidden"
                id="pdf-upload"
              />
              <label htmlFor="pdf-upload" className="cursor-pointer">
                <Upload className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                <p className="text-sm text-gray-600">
                  Click to upload PDF file (lab results, prescriptions, etc.)
                </p>
              </label>
              {file && (
                <div className="mt-2 flex items-center justify-center text-sm text-green-600">
                  <FileText className="h-4 w-4 mr-1" />
                  {file.name}
                </div>
              )}
            </div>
          </div>

          <Button
            onClick={handleSubmit}
            disabled={isAnalyzing || !description.trim() || !file}
            className="w-full"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Analyzing Document...
              </>
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Analyze with AI
              </>
            )}
          </Button>

          {analysis && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-medium text-blue-900 mb-2">AI Analysis Result:</h3>
              <div className="text-sm text-blue-800 whitespace-pre-wrap">
                {analysis}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default HealthIssueReport;
