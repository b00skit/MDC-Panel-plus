import { promises as fs } from 'fs';
import path from 'path';
import { PageHeader } from '@/components/dashboard/page-header';
import { ModuleCard, ModuleCardProps } from '@/components/dashboard/module-card';
import { FileSearch, Puzzle } from 'lucide-react';

async function getGenerators() {
  const dirPath = path.join(process.cwd(), 'data/paperwork-generators');
  try {
    const files = await fs.readdir(dirPath);
    const generators = await Promise.all(
      files.map(async (file) => {
        if (path.extname(file) === '.json') {
          const filePath = path.join(dirPath, file);
          const fileContents = await fs.readFile(filePath, 'utf8');
          const data = JSON.parse(fileContents);
          return data;
        }
        return null;
      })
    );
    return generators.filter(g => g !== null);
  } catch (error) {
    console.error("Could not read paperwork generators directory:", error);
    return [];
  }
}

const ICONS: { [key: string]: React.ReactNode } = {
  FileSearch: <FileSearch className="w-8 h-8 text-primary" />,
  Puzzle: <Puzzle className="w-8 h-8 text-primary" />,
  default: <Puzzle className="w-8 h-8 text-primary" />,
};

export default async function PaperworkGeneratorsPage() {
  const generators = await getGenerators();

  return (
      <div className="container mx-auto p-4 md:p-6 lg:p-8">
        <PageHeader
          title="Paperwork Generators"
          description="Select a template to generate paperwork."
        />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
          {generators.map((generator) => (
            <ModuleCard
              key={generator.id}
              title={generator.title}
              description={generator.description}
              icon={ICONS[generator.icon] || ICONS.default}
              href={`/paperwork-generators/form?s=${generator.id}`}
            />
          ))}
        </div>
      </div>
  );
}
