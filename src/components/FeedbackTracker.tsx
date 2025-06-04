
import React, { useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Brain, RotateCcw } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface FeedbackData {
  originalSuggestion: string;
  userEdit: string;
  type: 'summary' | 'skill' | 'achievement' | 'experience';
  timestamp: number;
  industry?: string;
  role?: string;
}

interface FeedbackPattern {
  pattern: string;
  frequency: number;
  improvement: string;
}

interface FeedbackTrackerProps {
  onPatternsUpdate: (patterns: FeedbackPattern[]) => void;
}

const FeedbackTracker: React.FC<FeedbackTrackerProps> = ({ onPatternsUpdate }) => {
  const [feedbackData, setFeedbackData] = React.useState<FeedbackData[]>([]);
  const [patterns, setPatterns] = React.useState<FeedbackPattern[]>([]);
  const [isAnalyzing, setIsAnalyzing] = React.useState(false);
  const lastAnalysisRef = useRef<number>(0);

  // Load feedback data from localStorage
  useEffect(() => {
    const savedFeedback = localStorage.getItem('resumeFeedbackData');
    if (savedFeedback) {
      const data = JSON.parse(savedFeedback);
      setFeedbackData(data);
      analyzeFeedbackPatterns(data);
    }
  }, []);

  // Save feedback data to localStorage
  useEffect(() => {
    if (feedbackData.length > 0) {
      localStorage.setItem('resumeFeedbackData', JSON.stringify(feedbackData));
    }
  }, [feedbackData]);

  const trackFeedback = (feedback: Omit<FeedbackData, 'timestamp'>) => {
    const newFeedback: FeedbackData = {
      ...feedback,
      timestamp: Date.now()
    };

    setFeedbackData(prev => [...prev, newFeedback]);
    
    // Analyze patterns if we have enough data and haven't analyzed recently
    const now = Date.now();
    if (feedbackData.length >= 3 && now - lastAnalysisRef.current > 30000) {
      lastAnalysisRef.current = now;
      setTimeout(() => analyzeFeedbackPatterns([...feedbackData, newFeedback]), 1000);
    }

    toast({
      title: "Feedback Recorded",
      description: "Your edit has been recorded to improve future suggestions.",
    });
  };

  const analyzeFeedbackPatterns = async (data: FeedbackData[]) => {
    if (data.length < 3) return;

    setIsAnalyzing(true);
    
    try {
      // Analyze common patterns in user edits
      const patternAnalysis = analyzeEditPatterns(data);
      setPatterns(patternAnalysis);
      onPatternsUpdate(patternAnalysis);
      
      console.log('Feedback patterns analyzed:', patternAnalysis);
    } catch (error) {
      console.error('Error analyzing feedback patterns:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const analyzeEditPatterns = (data: FeedbackData[]): FeedbackPattern[] => {
    const patterns: Record<string, { count: number; examples: string[] }> = {};
    
    data.forEach(feedback => {
      const { originalSuggestion, userEdit, type } = feedback;
      
      // Analyze common editing patterns
      if (userEdit.length > originalSuggestion.length) {
        const key = `${type}_expansion`;
        if (!patterns[key]) patterns[key] = { count: 0, examples: [] };
        patterns[key].count++;
        patterns[key].examples.push(userEdit);
      }
      
      if (userEdit.includes('quantified') || /\d+/.test(userEdit)) {
        const key = `${type}_quantification`;
        if (!patterns[key]) patterns[key] = { count: 0, examples: [] };
        patterns[key].count++;
        patterns[key].examples.push(userEdit);
      }
      
      if (userEdit.toLowerCase().includes('led') || userEdit.toLowerCase().includes('managed')) {
        const key = `${type}_leadership`;
        if (!patterns[key]) patterns[key] = { count: 0, examples: [] };
        patterns[key].count++;
        patterns[key].examples.push(userEdit);
      }
    });

    // Convert to feedback patterns
    return Object.entries(patterns)
      .filter(([_, data]) => data.count >= 2)
      .map(([pattern, data]) => ({
        pattern: pattern.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
        frequency: data.count,
        improvement: generateImprovement(pattern, data.examples)
      }))
      .sort((a, b) => b.frequency - a.frequency);
  };

  const generateImprovement = (pattern: string, examples: string[]): string => {
    if (pattern.includes('quantification')) {
      return "Include specific numbers and metrics in suggestions";
    }
    if (pattern.includes('expansion')) {
      return "Provide more detailed and comprehensive suggestions";
    }
    if (pattern.includes('leadership')) {
      return "Emphasize leadership and management experiences";
    }
    return "Adjust suggestion style based on user preferences";
  };

  const clearFeedbackData = () => {
    setFeedbackData([]);
    setPatterns([]);
    localStorage.removeItem('resumeFeedbackData');
    toast({
      title: "Feedback Data Cleared",
      description: "All feedback data has been reset.",
    });
  };

  // Expose tracking function globally
  useEffect(() => {
    (window as any).trackResumeEdits = trackFeedback;
    return () => {
      delete (window as any).trackResumeEdits;
    };
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="w-5 h-5" />
          Learning Patterns
          {isAnalyzing && <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-green-600" />
            <span className="text-sm text-gray-600">
              {feedbackData.length} edits tracked
            </span>
          </div>
          {feedbackData.length > 0 && (
            <Button
              size="sm"
              variant="outline"
              onClick={clearFeedbackData}
            >
              <RotateCcw className="w-3 h-3 mr-1" />
              Reset
            </Button>
          )}
        </div>

        {patterns.length > 0 && (
          <div>
            <h4 className="font-medium text-gray-700 mb-2">Detected Patterns</h4>
            <div className="space-y-2">
              {patterns.map((pattern, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-blue-50 rounded">
                  <span className="text-sm font-medium">{pattern.pattern}</span>
                  <Badge variant="secondary">{pattern.frequency}x</Badge>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="text-xs text-gray-500 space-y-1">
          <p>💡 How it works:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Your edits to AI suggestions are automatically tracked</li>
            <li>Patterns are analyzed to improve future suggestions</li>
            <li>Data is stored locally and never shared</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default FeedbackTracker;
