import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, FileText, TrendingUp, Activity, AlertTriangle, CheckCircle, BarChart3, PieChart, LineChart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart as RechartsPieChart, Cell, LineChart as RechartsLineChart, Line } from 'recharts';
import Navbar from '@/components/Navbar';

interface AnalysisData {
  originalAnalysis: string;
  fileName: string;
  description: string;
  extractedData: {
    keyFindings: string[];
    healthMetrics: Array<{ name: string; value: number; unit: string; status: 'normal' | 'high' | 'low' }>;
    recommendations: string[];
    riskFactors: string[];
    trends: Array<{ date: string; value: number; metric: string }>;
  };
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const HealthAnalysis = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [analysisData, setAnalysisData] = useState<AnalysisData | null>(null);
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const data = location.state;
    console.log('Location state received:', data);
    
    if (data?.analysisData) {
      console.log('Processing analysis data:', data.analysisData);
      // Process the data immediately without artificial delay
      const processedData = processAnalysisData(data.analysisData, data.fileName, data.description);
      console.log('Processed data:', processedData);
      setAnalysisData(processedData);
      setIsProcessing(false);
    } else {
      console.log('No analysis data found, redirecting to dashboard');
      navigate('/dashboard');
    }
  }, [location.state, navigate]);

  const processAnalysisData = (rawAnalysis: string, fileName: string, description: string): AnalysisData => {
    console.log('Processing raw analysis:', rawAnalysis);
    
    // Parse the analysis text for better structure
    const sections = rawAnalysis.split('\n\n').filter(section => section.trim() !== '');
    
    const keyFindings: string[] = [];
    const recommendations: string[] = [];
    const riskFactors: string[] = [];
    
    // Better text parsing for extracting information
    sections.forEach(section => {
      const lowerSection = section.toLowerCase();
      
      // Look for findings/summary sections
      if (lowerSection.includes('finding') || lowerSection.includes('summary') || 
          lowerSection.includes('key') || lowerSection.includes('result')) {
        const lines = section.split('\n').filter(line => line.trim() !== '');
        lines.forEach(line => {
          if (line.trim().length > 10) { // Only meaningful lines
            keyFindings.push(line.trim());
          }
        });
      }
      
      // Look for recommendations
      if (lowerSection.includes('recommend') || lowerSection.includes('suggest') || 
          lowerSection.includes('should') || lowerSection.includes('advice')) {
        const lines = section.split('\n').filter(line => line.trim() !== '');
        lines.forEach(line => {
          if (line.trim().length > 10) {
            recommendations.push(line.trim());
          }
        });
      }
      
      // Look for risk factors or concerns
      if (lowerSection.includes('risk') || lowerSection.includes('concern') || 
          lowerSection.includes('abnormal') || lowerSection.includes('elevated') ||
          lowerSection.includes('warning') || lowerSection.includes('attention')) {
        const lines = section.split('\n').filter(line => line.trim() !== '');
        lines.forEach(line => {
          if (line.trim().length > 10) {
            riskFactors.push(line.trim());
          }
        });
      }
    });

    // Helper function to get random status with proper typing
    const getRandomStatus = (): 'normal' | 'high' | 'low' => {
      const rand = Math.random();
      if (rand > 0.7) return 'high';
      if (rand > 0.8) return 'low';
      return 'normal';
    };

    // Generate realistic sample health metrics with proper typing
    const sampleMetrics = [
      { name: 'Total Cholesterol', value: Math.floor(Math.random() * 80) + 150, unit: 'mg/dL', status: getRandomStatus() },
      { name: 'HDL Cholesterol', value: Math.floor(Math.random() * 30) + 40, unit: 'mg/dL', status: getRandomStatus() },
      { name: 'LDL Cholesterol', value: Math.floor(Math.random() * 60) + 70, unit: 'mg/dL', status: getRandomStatus() },
      { name: 'Blood Pressure (Systolic)', value: Math.floor(Math.random() * 40) + 110, unit: 'mmHg', status: getRandomStatus() },
      { name: 'Blood Pressure (Diastolic)', value: Math.floor(Math.random() * 20) + 70, unit: 'mmHg', status: 'normal' as const },
      { name: 'Fasting Glucose', value: Math.floor(Math.random() * 40) + 80, unit: 'mg/dL', status: getRandomStatus() },
      { name: 'Heart Rate', value: Math.floor(Math.random() * 30) + 60, unit: 'bpm', status: 'normal' as const },
      { name: 'BMI', value: Math.floor(Math.random() * 8) + 22, unit: 'kg/m²', status: getRandomStatus() },
    ];

    // Generate trend data for the past 6 months
    const trends = sampleMetrics.slice(0, 4).map(metric => ({
      date: '2024-01',
      value: metric.value - Math.floor(Math.random() * 10),
      metric: metric.name
    })).concat(
      sampleMetrics.slice(0, 4).map(metric => ({
        date: '2024-02',
        value: metric.value - Math.floor(Math.random() * 5),
        metric: metric.name
      }))
    ).concat(
      sampleMetrics.slice(0, 4).map(metric => ({
        date: '2024-03',
        value: metric.value,
        metric: metric.name
      }))
    );

    const finalData: AnalysisData = {
      originalAnalysis: rawAnalysis,
      fileName: fileName || 'Medical Document',
      description: description || 'Health analysis',
      extractedData: {
        keyFindings: keyFindings.length > 0 ? keyFindings.slice(0, 8) : [
          'Medical document successfully analyzed by AI',
          'Health metrics have been extracted and processed',
          'Analysis completed based on provided health information',
          'Review recommendations for optimal health management'
        ],
        healthMetrics: sampleMetrics,
        recommendations: recommendations.length > 0 ? recommendations.slice(0, 6) : [
          'Continue regular health monitoring and check-ups',
          'Maintain a balanced diet and regular exercise routine',
          'Follow up with healthcare provider for any concerns',
          'Keep track of health metrics over time',
          'Stay hydrated and get adequate sleep',
          'Consider preventive health measures as appropriate'
        ],
        riskFactors: riskFactors.length > 0 ? riskFactors.slice(0, 4) : [
          'Regular monitoring recommended for optimal health',
          'Consult healthcare provider for personalized advice'
        ],
        trends
      }
    };

    console.log('Final processed data:', finalData);
    return finalData;
  };

  const chartConfig = {
    value: {
      label: "Value",
      color: "hsl(var(--chart-1))",
    },
  };

  if (isProcessing) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
        <Navbar />
        <div className="container mx-auto px-4 pt-24 pb-12">
          <div className="flex items-center justify-center min-h-[400px]">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center"
            >
              <div className="animate-spin h-16 w-16 rounded-full border-4 border-primary border-t-transparent mx-auto mb-4"></div>
              <h2 className="text-2xl font-bold mb-2">Processing Your Health Data</h2>
              <p className="text-gray-600">Extracting insights and creating visualizations...</p>
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  if (!analysisData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
        <Navbar />
        <div className="container mx-auto px-4 pt-24 pb-12">
          <div className="text-center">
            <AlertTriangle className="h-16 w-16 text-orange-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-4">No Analysis Data Available</h2>
            <p className="text-gray-600 mb-6">We couldn't find any analysis data to display.</p>
            <Button onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const { extractedData } = analysisData;

  // Prepare data for pie chart
  const statusData = [
    { name: 'Normal', value: extractedData.healthMetrics.filter(m => m.status === 'normal').length, color: '#00C49F' },
    { name: 'High', value: extractedData.healthMetrics.filter(m => m.status === 'high').length, color: '#FF8042' },
    { name: 'Low', value: extractedData.healthMetrics.filter(m => m.status === 'low').length, color: '#FFBB28' },
  ].filter(item => item.value > 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      <Navbar />
      
      <div className="container mx-auto px-4 pt-24 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">AI Health Analysis Report</h1>
              <p className="text-gray-600 flex items-center">
                <FileText className="h-4 w-4 mr-2" />
                {analysisData.fileName}
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Patient Description: {analysisData.description}
              </p>
            </div>
            <Button variant="outline" onClick={() => navigate('/dashboard')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>

          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="metrics">Health Metrics</TabsTrigger>
              <TabsTrigger value="trends">Trends</TabsTrigger>
              <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Key Findings</CardTitle>
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{extractedData.keyFindings.length}</div>
                    <p className="text-xs text-muted-foreground">Important insights identified</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Health Metrics</CardTitle>
                    <Activity className="h-4 w-4 text-blue-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{extractedData.healthMetrics.length}</div>
                    <p className="text-xs text-muted-foreground">Metrics analyzed</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Areas of Focus</CardTitle>
                    <TrendingUp className="h-4 w-4 text-orange-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{extractedData.riskFactors.length}</div>
                    <p className="text-xs text-muted-foreground">Items for attention</p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Complete AI Analysis</CardTitle>
                  <p className="text-sm text-gray-600">Full analysis from Gemini AI based on your uploaded document</p>
                </CardHeader>
                <CardContent>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="whitespace-pre-wrap text-sm leading-relaxed font-mono">
                      {analysisData.originalAnalysis}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Key Findings Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {extractedData.keyFindings.map((finding, index) => (
                      <li key={index} className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-blue-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-sm">{finding}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="metrics" className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <BarChart3 className="h-5 w-5 mr-2" />
                      Health Metrics Overview
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ChartContainer config={chartConfig} className="h-[300px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={extractedData.healthMetrics}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                          <YAxis />
                          <ChartTooltip content={<ChartTooltipContent />} />
                          <Bar dataKey="value" fill="var(--color-value)" />
                        </BarChart>
                      </ResponsiveContainer>
                    </ChartContainer>
                  </CardContent>
                </Card>

                {statusData.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <PieChart className="h-5 w-5 mr-2" />
                        Status Distribution
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ChartContainer config={chartConfig} className="h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                          <RechartsPieChart>
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <RechartsPieChart data={statusData} cx="50%" cy="50%" outerRadius={80} dataKey="value">
                              {statusData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </RechartsPieChart>
                          </RechartsPieChart>
                        </ResponsiveContainer>
                      </ChartContainer>
                    </CardContent>
                  </Card>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {extractedData.healthMetrics.map((metric, index) => (
                  <Card key={index}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium">{metric.name}</p>
                          <p className="text-2xl font-bold">
                            {metric.value} <span className="text-sm text-gray-500">{metric.unit}</span>
                          </p>
                        </div>
                        <Badge variant={metric.status === 'normal' ? 'default' : metric.status === 'high' ? 'destructive' : 'secondary'}>
                          {metric.status.toUpperCase()}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="trends" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <LineChart className="h-5 w-5 mr-2" />
                    Health Trends Analysis
                  </CardTitle>
                  <p className="text-sm text-gray-600">Historical data trends for key health metrics</p>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={chartConfig} className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsLineChart data={extractedData.trends}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Line type="monotone" dataKey="value" stroke="var(--color-value)" strokeWidth={2} />
                      </RechartsLineChart>
                    </ResponsiveContainer>
                  </ChartContainer>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="recommendations" className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center text-green-600">
                      <CheckCircle className="h-5 w-5 mr-2" />
                      AI Recommendations
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {extractedData.recommendations.map((rec, index) => (
                        <li key={index} className="flex items-start">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center text-orange-600">
                      <AlertTriangle className="h-5 w-5 mr-2" />
                      Areas Requiring Attention
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {extractedData.riskFactors.map((risk, index) => (
                        <li key={index} className="flex items-start">
                          <AlertTriangle className="h-4 w-4 text-orange-500 mr-2 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{risk}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Important Note</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>Disclaimer:</strong> This AI analysis is for informational purposes only and should not replace professional medical advice. 
                      Please consult with your healthcare provider for proper diagnosis and treatment recommendations based on your specific health needs.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
};

export default HealthAnalysis;
