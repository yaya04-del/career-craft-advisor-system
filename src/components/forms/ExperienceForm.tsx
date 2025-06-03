
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { FileText } from 'lucide-react';

interface Experience {
  id: string;
  company: string;
  position: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
}

interface ExperienceFormProps {
  experience: Experience[];
  onAdd: () => void;
  onUpdate: (id: string, field: string, value: any) => void;
  onRemove: (id: string) => void;
}

const ExperienceForm: React.FC<ExperienceFormProps> = ({
  experience,
  onAdd,
  onUpdate,
  onRemove
}) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Work Experience</CardTitle>
          <Button onClick={onAdd} size="sm">Add Experience</Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {experience.map((exp) => (
          <div key={exp.id} className="border rounded-lg p-4 space-y-4">
            <div className="flex justify-between items-start">
              <h3 className="font-medium">Experience Entry</h3>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => onRemove(exp.id)}
              >
                Remove
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                placeholder="Company"
                value={exp.company}
                onChange={(e) => onUpdate(exp.id, 'company', e.target.value)}
              />
              <Input
                placeholder="Position"
                value={exp.position}
                onChange={(e) => onUpdate(exp.id, 'position', e.target.value)}
              />
              <Input
                placeholder="Start Date"
                type="month"
                value={exp.startDate}
                onChange={(e) => onUpdate(exp.id, 'startDate', e.target.value)}
              />
              <Input
                placeholder="End Date"
                type="month"
                value={exp.endDate}
                onChange={(e) => onUpdate(exp.id, 'endDate', e.target.value)}
                disabled={exp.current}
              />
            </div>
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id={`current-${exp.id}`}
                checked={exp.current}
                onChange={(e) => onUpdate(exp.id, 'current', e.target.checked)}
              />
              <label htmlFor={`current-${exp.id}`} className="text-sm">
                I currently work here
              </label>
            </div>
            <Textarea
              placeholder="Describe your responsibilities and achievements..."
              value={exp.description}
              onChange={(e) => onUpdate(exp.id, 'description', e.target.value)}
              rows={4}
            />
          </div>
        ))}
        {experience.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No work experience added yet</p>
            <Button onClick={onAdd} className="mt-4">
              Add Your First Experience
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ExperienceForm;
