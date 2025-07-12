
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      console.log('File selected:', selectedFile.name, selectedFile.type);
      if (selectedFile.type === 'application/pdf') {
        setFile(selectedFile);
        toast.success('PDF file selected');
      } else {
        toast.error('Please select a PDF file');
      }
    }
  };

  const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

  const callGeminiAPI = async (base64Content: string, retryCount = 0): Promise<string> => {
    const maxRetries = 3;
    const baseDelay = 2000; // 2 seconds

    try {
      console.log(`Calling Gemini API (attempt ${retryCount + 1}/${maxRetries + 1})...`);

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [
              {
                text: `Please analyze this medical document and provide a comprehensive analysis based on the patient's description: "${description}". 

Please provide:
1. Summary of key findings from the document
2. Detailed health metrics and values (with units)
3. Potential health concerns or abnormalities
4. Risk factors identified
5. Recommendations for follow-up care
6. Trends or patterns in the data
7. Important notes or warnings

Structure your response with clear sections and include specific numerical values where available. This analysis will be used to create data visualizations and charts.

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
            maxOutputTokens: 2048,
          }
        }),
      });

      console.log('Gemini API response status:', response.status);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error?.message || `HTTP ${response.status}`;
        
        // Handle specific error cases with retry logic
        if (response.status === 503 || errorMessage.includes("overloaded")) {
          if (retryCount < maxRetries) {
            const delayTime = baseDelay * Math.pow(2, retryCount); // Exponential backoff
            console.log(`API overloaded, retrying in ${delayTime}ms...`);
            toast.warning(`API is busy, retrying in ${delayTime/1000} seconds...`);
            
            await delay(delayTime);
            return callGeminiAPI(base64Content, retryCount + 1);
          } else {
            throw new Error("The Gemini API is currently overloaded. Please try again in a few minutes.");
          }
        } else if (response.status === 429) {
          throw new Error("Rate limit exceeded. Please wait a moment before trying again.");
        } else if (response.status === 401 || response.status === 403) {
          throw new Error("Invalid API key. Please check your Gemini API key.");
        } else {
          throw new Error(errorMessage);
        }
      }

      const data = await response.json();
      console.log('Gemini API response received successfully');
      
      const analysisResult = data.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!analysisResult) {
        throw new Error('No analysis content received from API');
      }
      
      return analysisResult;
    } catch (error) {
      console.error('Gemini API call error:', error);
      throw error;
    }
  };

  const handleSubmit = async () => {
    console.log('Starting analysis with:', { description: description.trim(), hasFile: !!file, hasApiKey: !!apiKey.trim() });
    
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
        try {
          const base64Data = reader.result as string;
          const base64Content = base64Data.split(',')[1];

          console.log('PDF converted to base64, calling Gemini API...');

          const analysisResult = await callGeminiAPI(base64Content);
          console.log('Analysis result received, navigating to health analysis...');

          // Store the analysis data in sessionStorage to prevent auth redirects from interfering
          sessionStorage.setItem('healthAnalysisData', JSON.stringify({
            analysisData: analysisResult,
            fileName: file.name,
            description: description
          }));

          // Close the modal first
          onClose();
          
          // Small delay to ensure modal closes before navigation
          setTimeout(() => {
            console.log('Navigating to health analysis page');
            navigate('/health-analysis', {
              state: {
                analysisData: analysisResult,
                fileName: file.name,
                description: description
              }
            });
          }, 100);

          toast.success('Document analyzed successfully! Redirecting to detailed analysis...');
        } catch (error) {
          console.error('Analysis error:', error);
          const errorMessage = error instanceof Error ? error.message : 'Failed to analyze document. Please try again.';
          toast.error(errorMessage);
          setIsAnalyzing(false);
        }
      };

      reader.onerror = () => {
        console.error('File reader error');
        toast.error('Failed to read PDF file');
        setIsAnalyzing(false);
      };

      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error submitting health report:', error);
      toast.error('Failed to submit health report');
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
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default HealthIssueReport;
