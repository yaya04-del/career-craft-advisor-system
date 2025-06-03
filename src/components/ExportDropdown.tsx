
import React from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Download, FileText, Globe, File } from 'lucide-react';
import { exportToPDF, exportToHTML, exportToDOCX } from '@/utils/exportUtils';
import { toast } from '@/hooks/use-toast';

interface ResumeData {
  personalInfo: {
    fullName: string;
    email: string;
    phone: string;
    location: string;
    linkedin: string;
    website: string;
  };
  summary: string;
  experience: Array<{
    id: string;
    company: string;
    position: string;
    startDate: string;
    endDate: string;
    current: boolean;
    description: string;
  }>;
  education: Array<{
    id: string;
    institution: string;
    degree: string;
    field: string;
    graduationDate: string;
    gpa?: string;
  }>;
  skills: string[];
  achievements: string[];
}

interface ExportDropdownProps {
  resumeData: ResumeData;
  variant?: 'default' | 'outline';
  size?: 'default' | 'sm' | 'lg';
}

const ExportDropdown: React.FC<ExportDropdownProps> = ({ 
  resumeData, 
  variant = 'default',
  size = 'default'
}) => {
  const filename = resumeData.personalInfo.fullName 
    ? `${resumeData.personalInfo.fullName.toLowerCase().replace(/\s+/g, '_')}_resume`
    : 'resume';

  const handleExportPDF = async () => {
    try {
      await exportToPDF('resume-preview', `${filename}.pdf`);
      toast({
        title: "PDF Downloaded!",
        description: "Your resume has been downloaded as a PDF file.",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "There was an error exporting your resume to PDF.",
        variant: "destructive",
      });
    }
  };

  const handleExportHTML = () => {
    try {
      exportToHTML(resumeData, `${filename}.html`);
      toast({
        title: "HTML Downloaded!",
        description: "Your resume has been downloaded as an HTML file.",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "There was an error exporting your resume to HTML.",
        variant: "destructive",
      });
    }
  };

  const handleExportDOCX = async () => {
    try {
      await exportToDOCX(resumeData, `${filename}.docx`);
      toast({
        title: "DOCX Downloaded!",
        description: "Your resume has been downloaded as a Word document.",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "There was an error exporting your resume to DOCX.",
        variant: "destructive",
      });
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size={size}>
          <Download className="w-4 h-4 mr-2" />
          Download
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleExportPDF}>
          <FileText className="w-4 h-4 mr-2" />
          Download PDF
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleExportDOCX}>
          <File className="w-4 h-4 mr-2" />
          Download DOCX
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleExportHTML}>
          <Globe className="w-4 h-4 mr-2" />
          Download HTML
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ExportDropdown;
