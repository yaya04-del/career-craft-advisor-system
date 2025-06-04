
import { useState, useEffect } from 'react';

interface FeedbackPattern {
  pattern: string;
  frequency: number;
  improvement: string;
}

interface ImprovementSuggestions {
  includeMetrics: boolean;
  expandDetails: boolean;
  emphasizeLeadership: boolean;
  industrySpecific: boolean;
}

export const useFeedbackImprovement = () => {
  const [patterns, setPatterns] = useState<FeedbackPattern[]>([]);
  const [improvements, setImprovements] = useState<ImprovementSuggestions>({
    includeMetrics: false,
    expandDetails: false,
    emphasizeLeadership: false,
    industrySpecific: false
  });

  useEffect(() => {
    // Update improvement suggestions based on patterns
    const newImprovements: ImprovementSuggestions = {
      includeMetrics: patterns.some(p => p.pattern.toLowerCase().includes('quantification')),
      expandDetails: patterns.some(p => p.pattern.toLowerCase().includes('expansion')),
      emphasizeLeadership: patterns.some(p => p.pattern.toLowerCase().includes('leadership')),
      industrySpecific: patterns.length > 3
    };
    
    setImprovements(newImprovements);
  }, [patterns]);

  const updatePatterns = (newPatterns: FeedbackPattern[]) => {
    setPatterns(newPatterns);
  };

  const generateImprovedPrompt = (basePrompt: string, context: any) => {
    let improvedPrompt = basePrompt;

    if (improvements.includeMetrics) {
      improvedPrompt += "\n\nIMPORTANT: Include specific numbers, percentages, and quantifiable achievements in your suggestions. Users prefer concrete metrics.";
    }

    if (improvements.expandDetails) {
      improvedPrompt += "\n\nIMPORTANT: Provide detailed, comprehensive descriptions rather than brief summaries. Users tend to expand on suggestions.";
    }

    if (improvements.emphasizeLeadership) {
      improvedPrompt += "\n\nIMPORTANT: Emphasize leadership, management, and team collaboration aspects in your suggestions.";
    }

    if (improvements.industrySpecific && context.industry) {
      improvedPrompt += `\n\nIMPORTANT: Focus specifically on ${context.industry} industry terminology and requirements based on user editing patterns.`;
    }

    return improvedPrompt;
  };

  const trackEdit = (originalSuggestion: string, userEdit: string, type: string, context?: any) => {
    if (typeof window !== 'undefined' && (window as any).trackResumeEdits) {
      (window as any).trackResumeEdits({
        originalSuggestion,
        userEdit,
        type,
        industry: context?.industry,
        role: context?.role
      });
    }
  };

  return {
    patterns,
    improvements,
    updatePatterns,
    generateImprovedPrompt,
    trackEdit
  };
};
