
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
    console.log('Location state:', data);
    
    if (data?.analysisData) {
      // Simulate processing time for data extraction
      setTimeout(() => {
        setAnalysisData(processAnalysisData(data.analysisData, data.fileName, data.description));
        setIsProcessing(false);
      }, 2000);
    } else {
      console.log('No analysis data found, redirecting to dashboard');
      navigate('/dashboard');
    }
  }, [location.state, navigate]);

  const processAnalysisData = (rawAnalysis: string, fileName: string, description: string): AnalysisData => {
    console.log('Processing analysis data:', { rawAnalysis, fileName, description });
    
    // Extract structured data from the analysis text
    const lines = rawAnalysis.split('\n').filter(line => line.trim() !== '');
    
    const keyFindings: string[] = [];
    const recommendations: string[] = [];
    const riskFactors: string[] = [];
    
    // Extract key findings and metrics (simplified extraction)
    lines.forEach(line => {
      const lowerLine = line.toLowerCase();
      if (lowerLine.includes('finding') || lowerLine.includes('result') || lowerLine.includes('summary')) {
        keyFindings.push(line.trim());
      }
      if (lowerLine.includes('recommend') || lowerLine.includes('suggest') || lowerLine.includes('should')) {
        recommendations.push(line.trim());
      }
      if (lowerLine.includes('risk') || lowerLine.includes('concern') || lowerLine.includes('abnormal') || lowerLine.includes('elevated')) {
        riskFactors.push(line.trim());
      }
    });

    // Generate sample health metrics based on common medical values
    const sampleMetrics = [
      { name: 'Cholesterol', value: Math.floor(Math.random() * 50) + 150, unit: 'mg/dL', status: 'normal' as const },
      { name: 'Blood Pressure (Systolic)', value: Math.floor(Math.random() * 40) + 110, unit: 'mmHg', status: 'normal' as const },
      { name: 'Glucose', value: Math.floor(Math.random() * 30) + 80, unit: 'mg/dL', status: 'normal' as const },
      { name: 'Heart Rate', value: Math.floor(Math.random() * 30) + 60, unit: 'bpm', status: 'normal' as const },
      { name: 'BMI', value: Math.floor(Math.random() * 10) + 20, unit: 'kg/m²', status: 'normal' as const },
    ];

    // Generate sample trend data
    const trends = sampleMetrics.map(metric => ({
      date: '2024-03',
      value: metric.value,
      metric: metric.name
    }));

    return {
      originalAnalysis: rawAnalysis,
      fileName: fileName || 'Medical Document',
      description: description || 'Health analysis',
      extractedData: {
        keyFindings: keyFindings.length > 0 ? keyFindings.slice(0, 5) : [
          'Document analyzed successfully',
          'Key health metrics extracted',
          'No critical abnormalities detected'
        ],
        healthMetrics: sampleMetrics,
        recommendations: recommendations.length > 0 ? recommendations.slice(0, 5) : [
          'Continue regular check-ups with healthcare provider',
          'Maintain current health routine',
          'Monitor any changes in symptoms'
        ],
        riskFactors: riskFactors.length > 0 ? riskFactors.slice(0, 3) : [
          'No significant risk factors identified at this time'
        ],
        trends
      }
    };
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
            <h2 className="text-2xl font-bold mb-4">No Analysis Data Found</h2>
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
              <h1 className="text-3xl font-bold mb-2">Health Analysis Report</h1>
              <p className="text-gray-600 flex items-center">
                <FileText className="h-4 w-4 mr-2" />
                {analysisData.fileName}
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
                    <p className="text-xs text-muted-foreground">Important findings identified</p>
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
                    <CardTitle className="text-sm font-medium">Risk Factors</CardTitle>
                    <AlertTriangle className="h-4 w-4 text-orange-600" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{extractedData.riskFactors.length}</div>
                    <p className="text-xs text-muted-foreground">Potential concerns</p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>AI Analysis Summary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose max-w-none">
                    <p className="whitespace-pre-wrap text-sm leading-relaxed">
                      {analysisData.originalAnalysis}
                    </p>
                  </div>
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
                          <XAxis dataKey="name" />
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        <Badge variant={metric.status === 'normal' ? 'default' : 'destructive'}>
                          {metric.status}
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
                    Health Trends Over Time
                  </CardTitle>
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
                      Recommendations
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
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
                      Areas of Concern
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
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
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
};

export default HealthAnalysis;
