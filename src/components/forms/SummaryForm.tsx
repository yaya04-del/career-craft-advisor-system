
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface SummaryFormProps {
  summary: string;
  selectedIndustry: string;
  selectedRole: string;
  onSummaryChange: (value: string) => void;
  onIndustryChange: (value: string) => void;
  onRoleChange: (value: string) => void;
}

const SummaryForm: React.FC<SummaryFormProps> = ({
  summary,
  selectedIndustry,
  selectedRole,
  onSummaryChange,
  onIndustryChange,
  onRoleChange
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Professional Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select value={selectedIndustry} onValueChange={onIndustryChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select Industry" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="technology">Technology</SelectItem>
                <SelectItem value="healthcare">Healthcare</SelectItem>
                <SelectItem value="finance">Finance</SelectItem>
                <SelectItem value="education">Education</SelectItem>
                <SelectItem value="marketing">Marketing</SelectItem>
                <SelectItem value="sales">Sales</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedRole} onValueChange={onRoleChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select Role Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="entry">Entry Level</SelectItem>
                <SelectItem value="mid">Mid Level</SelectItem>
                <SelectItem value="senior">Senior Level</SelectItem>
                <SelectItem value="executive">Executive</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Textarea
            placeholder="Write a compelling professional summary that highlights your key achievements and career goals..."
            value={summary}
            onChange={(e) => onSummaryChange(e.target.value)}
            rows={6}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default SummaryForm;
