import { Metadata } from 'next';
import fs from 'fs';
import path from 'path';

export const metadata: Metadata = {
  title: '愈见 - 产品展示',
  description: '面向大学生的 AI 情绪疗愈助手',
};

export default function AboutPage() {
  const htmlPath = path.join(process.cwd(), 'app', 'about', 'template.html');
  const htmlContent = fs.readFileSync(htmlPath, 'utf-8');
  
  return (
    <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
  );
}
