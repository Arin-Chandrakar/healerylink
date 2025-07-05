
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, FileText, Send, Loader2, Key } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

interface HealthIssueReportProps {
  onClose: () => void;
}

const HealthIssueReport = ({ onClose }: HealthIssueReportProps) => {
  const [description, setDescription] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [apiKey, setApiKey] = useState('');
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

    if (!apiKey.trim()) {
      toast.error('Please enter your Gemini API key');
      return;
    }

    setIsAnalyzing(true);
    
    try {
      // Convert PDF to base64
      const reader = new FileReader();
      reader.onload = async () => {
        const base64Data = reader.result as string;
        const base64Content = base64Data.split(',')[1];

        try {
          // Call Gemini API directly from frontend
          const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              contents: [{
                parts: [
                  {
                    text: `Please analyze this medical document and provide insights based on the patient's description: "${description}". 

Please provide:
1. Summary of key findings from the document
2. Potential health concerns or abnormalities
3. Recommendations for follow-up care
4. Important notes or warnings

Remember to be professional and note that this analysis is for informational purposes only and should not replace professional medical advice.`
                  },
                  {
                    inline_data: {
                      mime_type: "application/pdf",
                      data: base64Content
                    }
                  }
                ]
              }],
              generationConfig: {
                temperature: 0.3,
                maxOutputTokens: 1024,
              }
            }),
          });

          if (!response.ok) {
            const errorText = await response.text();
            console.error('Gemini API error:', errorText);
            throw new Error(`Gemini API error: ${response.status}`);
          }

          const data = await response.json();
          const analysisResult = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No analysis available';

          setAnalysis(analysisResult);
          toast.success('Document analyzed successfully');
        } catch (error) {
          console.error('Analysis error:', error);
          toast.error('Failed to analyze document. Please check your API key.');
        }
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

          <div>
            <label className="block text-sm font-medium mb-2">
              <Key className="h-4 w-4 inline mr-1" />
              Gemini API Key
            </label>
            <Input
              type="password"
              placeholder="Enter your Gemini API key..."
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              className="w-full"
            />
            <p className="text-xs text-gray-500 mt-1">
              Get your API key from{' '}
              <a 
                href="https://makersuite.google.com/app/apikey" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline"
              >
                Google AI Studio
              </a>
            </p>
          </div>

          <Button
            onClick={handleSubmit}
            disabled={isAnalyzing || !description.trim() || !file || !apiKey.trim()}
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
