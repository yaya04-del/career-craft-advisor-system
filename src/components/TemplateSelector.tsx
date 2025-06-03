
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';

interface TemplateSelectorProps {
  selectedTemplate: 'modern' | 'classic' | 'minimal';
  onTemplateSelect: (template: 'modern' | 'classic' | 'minimal') => void;
}

const TemplateSelector: React.FC<TemplateSelectorProps> = ({ selectedTemplate, onTemplateSelect }) => {
  const templates = [
    {
      id: 'modern' as const,
      name: 'Modern',
      description: 'Clean design with accent colors and modern typography',
      preview: (
        <div className="w-full h-32 bg-gradient-to-br from-blue-50 to-blue-100 rounded border-2 border-blue-200 p-3">
          <div className="h-2 bg-blue-500 rounded mb-2"></div>
          <div className="h-1 bg-gray-300 rounded mb-1 w-3/4"></div>
          <div className="h-1 bg-gray-300 rounded mb-2 w-1/2"></div>
          <div className="flex gap-1">
            <div className="h-1 bg-blue-400 rounded w-1/4"></div>
            <div className="h-1 bg-blue-400 rounded w-1/3"></div>
          </div>
        </div>
      )
    },
    {
      id: 'classic' as const,
      name: 'Classic',
      description: 'Traditional layout perfect for conservative industries',
      preview: (
        <div className="w-full h-32 bg-white rounded border-2 border-gray-300 p-3">
          <div className="h-1 bg-gray-800 rounded mb-2 w-1/2"></div>
          <div className="h-1 bg-gray-500 rounded mb-1 w-3/4"></div>
          <div className="h-1 bg-gray-500 rounded mb-2 w-2/3"></div>
          <div className="border-t border-gray-300 pt-2">
            <div className="h-1 bg-gray-600 rounded mb-1 w-1/3"></div>
            <div className="h-1 bg-gray-400 rounded w-4/5"></div>
          </div>
        </div>
      )
    },
    {
      id: 'minimal' as const,
      name: 'Minimal',
      description: 'Clean and simple design focusing on content',
      preview: (
        <div className="w-full h-32 bg-white rounded border border-gray-200 p-3">
          <div className="h-1 bg-gray-900 rounded mb-3 w-1/2"></div>
          <div className="space-y-2">
            <div className="h-1 bg-gray-400 rounded w-3/4"></div>
            <div className="h-1 bg-gray-400 rounded w-2/3"></div>
            <div className="h-1 bg-gray-400 rounded w-4/5"></div>
          </div>
          <div className="mt-3 pt-2 border-t border-gray-100">
            <div className="h-1 bg-gray-500 rounded w-1/4"></div>
          </div>
        </div>
      )
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Choose Your Template</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {templates.map((template) => (
          <div
            key={template.id}
            className={`relative border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md ${
              selectedTemplate === template.id
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
            onClick={() => onTemplateSelect(template.id)}
          >
            {selectedTemplate === template.id && (
              <div className="absolute top-2 right-2">
                <CheckCircle className="w-5 h-5 text-blue-500" />
              </div>
            )}
            
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-24">
                {template.preview}
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900 mb-1">{template.name}</h3>
                <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                <Button
                  variant={selectedTemplate === template.id ? "default" : "outline"}
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onTemplateSelect(template.id);
                  }}
                >
                  {selectedTemplate === template.id ? 'Selected' : 'Select'}
                </Button>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default TemplateSelector;
