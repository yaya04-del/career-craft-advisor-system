
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface SkillsFormProps {
  skills: string[];
  achievements: string[];
  currentSkill: string;
  currentAchievement: string;
  onSkillChange: (value: string) => void;
  onAchievementChange: (value: string) => void;
  onAddSkill: () => void;
  onAddAchievement: () => void;
  onRemoveSkill: (skill: string) => void;
  onRemoveAchievement: (index: number) => void;
}

const SkillsForm: React.FC<SkillsFormProps> = ({
  skills,
  achievements,
  currentSkill,
  currentAchievement,
  onSkillChange,
  onAchievementChange,
  onAddSkill,
  onAddAchievement,
  onRemoveSkill,
  onRemoveAchievement
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Skills & Achievements</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Skills Section */}
        <div>
          <h3 className="font-medium mb-3">Skills</h3>
          <div className="flex gap-2 mb-4">
            <Input
              placeholder="Add a skill"
              value={currentSkill}
              onChange={(e) => onSkillChange(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && onAddSkill()}
            />
            <Button onClick={onAddSkill}>Add</Button>
          </div>
          <div className="flex flex-wrap gap-2">
            {skills.map((skill, index) => (
              <Badge key={index} variant="secondary" className="px-3 py-1">
                {skill}
                <button
                  onClick={() => onRemoveSkill(skill)}
                  className="ml-2 text-gray-500 hover:text-red-500"
                >
                  ×
                </button>
              </Badge>
            ))}
          </div>
        </div>

        {/* Achievements Section */}
        <div>
          <h3 className="font-medium mb-3">Key Achievements</h3>
          <div className="flex gap-2 mb-4">
            <Input
              placeholder="Add an achievement"
              value={currentAchievement}
              onChange={(e) => onAchievementChange(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && onAddAchievement()}
            />
            <Button onClick={onAddAchievement}>Add</Button>
          </div>
          <div className="space-y-2">
            {achievements.map((achievement, index) => (
              <div key={index} className="flex items-center justify-between bg-gray-50 p-3 rounded">
                <span className="text-sm">{achievement}</span>
                <button
                  onClick={() => onRemoveAchievement(index)}
                  className="text-red-500 hover:text-red-700"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default SkillsForm;
