
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FileText } from 'lucide-react';

interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string;
  graduationDate: string;
  gpa?: string;
}

interface EducationFormProps {
  education: Education[];
  onAdd: () => void;
  onUpdate: (id: string, field: string, value: string) => void;
  onRemove: (id: string) => void;
}

const EducationForm: React.FC<EducationFormProps> = ({
  education,
  onAdd,
  onUpdate,
  onRemove
}) => {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Education</CardTitle>
          <Button onClick={onAdd} size="sm">Add Education</Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {education.map((edu) => (
          <div key={edu.id} className="border rounded-lg p-4 space-y-4">
            <div className="flex justify-between items-start">
              <h3 className="font-medium">Education Entry</h3>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => onRemove(edu.id)}
              >
                Remove
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                placeholder="Institution"
                value={edu.institution}
                onChange={(e) => onUpdate(edu.id, 'institution', e.target.value)}
              />
              <Input
                placeholder="Degree"
                value={edu.degree}
                onChange={(e) => onUpdate(edu.id, 'degree', e.target.value)}
              />
              <Input
                placeholder="Field of Study"
                value={edu.field}
                onChange={(e) => onUpdate(edu.id, 'field', e.target.value)}
              />
              <Input
                placeholder="Graduation Date"
                type="month"
                value={edu.graduationDate}
                onChange={(e) => onUpdate(edu.id, 'graduationDate', e.target.value)}
              />
            </div>
            <Input
              placeholder="GPA (optional)"
              value={edu.gpa || ''}
              onChange={(e) => onUpdate(edu.id, 'gpa', e.target.value)}
            />
          </div>
        ))}
        {education.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No education added yet</p>
            <Button onClick={onAdd} className="mt-4">
              Add Your Education
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default EducationForm;
