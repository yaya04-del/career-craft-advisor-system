
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

interface PersonalInfo {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  website: string;
}

interface PersonalInfoFormProps {
  personalInfo: PersonalInfo;
  onUpdate: (field: keyof PersonalInfo, value: string) => void;
}

const PersonalInfoForm: React.FC<PersonalInfoFormProps> = ({ personalInfo, onUpdate }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Personal Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            placeholder="Full Name"
            value={personalInfo.fullName}
            onChange={(e) => onUpdate('fullName', e.target.value)}
          />
          <Input
            placeholder="Email"
            type="email"
            value={personalInfo.email}
            onChange={(e) => onUpdate('email', e.target.value)}
          />
          <Input
            placeholder="Phone"
            value={personalInfo.phone}
            onChange={(e) => onUpdate('phone', e.target.value)}
          />
          <Input
            placeholder="Location"
            value={personalInfo.location}
            onChange={(e) => onUpdate('location', e.target.value)}
          />
          <Input
            placeholder="LinkedIn URL"
            value={personalInfo.linkedin}
            onChange={(e) => onUpdate('linkedin', e.target.value)}
          />
          <Input
            placeholder="Website"
            value={personalInfo.website}
            onChange={(e) => onUpdate('website', e.target.value)}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default PersonalInfoForm;
