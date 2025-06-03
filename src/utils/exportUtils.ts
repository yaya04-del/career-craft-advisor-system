
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Document, Packer, Paragraph, TextRun, HeadingLevel } from 'docx';

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

export const exportToPDF = async (elementId: string, filename: string = 'resume.pdf') => {
  const element = document.getElementById(elementId);
  if (!element) return;

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    allowTaint: true
  });

  const imgData = canvas.toDataURL('image/png');
  const pdf = new jsPDF('p', 'mm', 'a4');
  
  const imgWidth = 210;
  const pageHeight = 295;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;
  let heightLeft = imgHeight;
  let position = 0;

  pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
  heightLeft -= pageHeight;

  while (heightLeft >= 0) {
    position = heightLeft - imgHeight;
    pdf.addPage();
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
  }

  pdf.save(filename);
};

export const exportToHTML = (data: ResumeData, filename: string = 'resume.html') => {
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
  };

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${data.personalInfo.fullName} - Resume</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 800px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 30px; }
        .header h1 { margin: 0; font-size: 2.5em; }
        .contact-info { margin: 10px 0; }
        .section { margin-bottom: 30px; }
        .section h2 { border-bottom: 1px solid #333; padding-bottom: 5px; margin-bottom: 15px; }
        .experience-item, .education-item { margin-bottom: 20px; }
        .job-title { font-weight: bold; font-size: 1.1em; }
        .company { font-style: italic; color: #666; }
        .date { float: right; color: #666; font-size: 0.9em; }
        .skills { display: flex; flex-wrap: wrap; gap: 10px; }
        .skill { background: #f0f0f0; padding: 5px 10px; border-radius: 3px; }
        .achievement { margin-bottom: 5px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>${data.personalInfo.fullName || 'Your Name'}</h1>
        <div class="contact-info">
            ${data.personalInfo.email ? `<div>${data.personalInfo.email}</div>` : ''}
            ${data.personalInfo.phone ? `<div>${data.personalInfo.phone}</div>` : ''}
            ${data.personalInfo.location ? `<div>${data.personalInfo.location}</div>` : ''}
            ${data.personalInfo.linkedin ? `<div>${data.personalInfo.linkedin}</div>` : ''}
            ${data.personalInfo.website ? `<div>${data.personalInfo.website}</div>` : ''}
        </div>
    </div>

    ${data.summary ? `
    <div class="section">
        <h2>Summary</h2>
        <p>${data.summary}</p>
    </div>
    ` : ''}

    ${data.experience.length > 0 ? `
    <div class="section">
        <h2>Experience</h2>
        ${data.experience.map(exp => `
        <div class="experience-item">
            <div class="job-title">${exp.position}</div>
            <div class="company">${exp.company}</div>
            <div class="date">${formatDate(exp.startDate)} - ${exp.current ? 'Present' : formatDate(exp.endDate)}</div>
            ${exp.description ? `<p>${exp.description}</p>` : ''}
        </div>
        `).join('')}
    </div>
    ` : ''}

    ${data.education.length > 0 ? `
    <div class="section">
        <h2>Education</h2>
        ${data.education.map(edu => `
        <div class="education-item">
            <div class="job-title">${edu.degree} ${edu.field ? `in ${edu.field}` : ''}</div>
            <div class="company">${edu.institution}</div>
            <div class="date">${formatDate(edu.graduationDate)}</div>
            ${edu.gpa ? `<div>GPA: ${edu.gpa}</div>` : ''}
        </div>
        `).join('')}
    </div>
    ` : ''}

    ${data.skills.length > 0 ? `
    <div class="section">
        <h2>Skills</h2>
        <div class="skills">
            ${data.skills.map(skill => `<span class="skill">${skill}</span>`).join('')}
        </div>
    </div>
    ` : ''}

    ${data.achievements.length > 0 ? `
    <div class="section">
        <h2>Achievements</h2>
        ${data.achievements.map(achievement => `<div class="achievement">• ${achievement}</div>`).join('')}
    </div>
    ` : ''}
</body>
</html>
  `;

  const blob = new Blob([html], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};

export const exportToDOCX = async (data: ResumeData, filename: string = 'resume.docx') => {
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
  };

  const docElements = [];

  // Header
  docElements.push(
    new Paragraph({
      children: [
        new TextRun({
          text: data.personalInfo.fullName || 'Your Name',
          bold: true,
          size: 32
        })
      ],
      heading: HeadingLevel.TITLE
    })
  );

  // Contact Info
  if (data.personalInfo.email) {
    docElements.push(new Paragraph({ children: [new TextRun(data.personalInfo.email)] }));
  }
  if (data.personalInfo.phone) {
    docElements.push(new Paragraph({ children: [new TextRun(data.personalInfo.phone)] }));
  }
  if (data.personalInfo.location) {
    docElements.push(new Paragraph({ children: [new TextRun(data.personalInfo.location)] }));
  }
  if (data.personalInfo.linkedin) {
    docElements.push(new Paragraph({ children: [new TextRun(data.personalInfo.linkedin)] }));
  }
  if (data.personalInfo.website) {
    docElements.push(new Paragraph({ children: [new TextRun(data.personalInfo.website)] }));
  }

  docElements.push(new Paragraph({ children: [new TextRun("")] })); // Empty line

  // Summary
  if (data.summary) {
    docElements.push(
      new Paragraph({
        children: [new TextRun({ text: "SUMMARY", bold: true, size: 24 })],
        heading: HeadingLevel.HEADING_1
      }),
      new Paragraph({ children: [new TextRun(data.summary)] }),
      new Paragraph({ children: [new TextRun("")] })
    );
  }

  // Experience
  if (data.experience.length > 0) {
    docElements.push(
      new Paragraph({
        children: [new TextRun({ text: "EXPERIENCE", bold: true, size: 24 })],
        heading: HeadingLevel.HEADING_1
      })
    );

    data.experience.forEach(exp => {
      docElements.push(
        new Paragraph({
          children: [new TextRun({ text: exp.position, bold: true })]
        }),
        new Paragraph({
          children: [
            new TextRun(exp.company),
            new TextRun(` | ${formatDate(exp.startDate)} - ${exp.current ? 'Present' : formatDate(exp.endDate)}`)
          ]
        })
      );

      if (exp.description) {
        docElements.push(new Paragraph({ children: [new TextRun(exp.description)] }));
      }

      docElements.push(new Paragraph({ children: [new TextRun("")] }));
    });
  }

  // Education
  if (data.education.length > 0) {
    docElements.push(
      new Paragraph({
        children: [new TextRun({ text: "EDUCATION", bold: true, size: 24 })],
        heading: HeadingLevel.HEADING_1
      })
    );

    data.education.forEach(edu => {
      docElements.push(
        new Paragraph({
          children: [new TextRun({ text: `${edu.degree} ${edu.field ? `in ${edu.field}` : ''}`, bold: true })]
        }),
        new Paragraph({
          children: [
            new TextRun(edu.institution),
            new TextRun(` | ${formatDate(edu.graduationDate)}`)
          ]
        })
      );

      if (edu.gpa) {
        docElements.push(new Paragraph({ children: [new TextRun(`GPA: ${edu.gpa}`)] }));
      }

      docElements.push(new Paragraph({ children: [new TextRun("")] }));
    });
  }

  // Skills
  if (data.skills.length > 0) {
    docElements.push(
      new Paragraph({
        children: [new TextRun({ text: "SKILLS", bold: true, size: 24 })],
        heading: HeadingLevel.HEADING_1
      }),
      new Paragraph({ children: [new TextRun(data.skills.join(', '))] }),
      new Paragraph({ children: [new TextRun("")] })
    );
  }

  // Achievements
  if (data.achievements.length > 0) {
    docElements.push(
      new Paragraph({
        children: [new TextRun({ text: "ACHIEVEMENTS", bold: true, size: 24 })],
        heading: HeadingLevel.HEADING_1
      })
    );

    data.achievements.forEach(achievement => {
      docElements.push(new Paragraph({ children: [new TextRun(`• ${achievement}`)] }));
    });
  }

  const doc = new Document({
    sections: [{
      properties: {},
      children: docElements
    }]
  });

  const buffer = await Packer.toBuffer(doc);
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
