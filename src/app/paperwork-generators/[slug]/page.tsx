import { promises as fs } from 'fs';
import path from 'path';
import { Layout } from '@/components/layout/layout';
import { PaperworkGeneratorForm } from '@/components/paperwork-generators/paperwork-generator-form';
import { notFound } from 'next/navigation';

async function getGeneratorConfig(slug: string) {
  const filePath = path.join(process.cwd(), `data/paperwork-generators/${slug}.json`);
  try {
    const fileContents = await fs.readFile(filePath, 'utf8');
    const data = JSON.parse(fileContents);
    return data;
  } catch (error) {
    return null;
  }
}

export default async function GeneratorPage({ params }: { params: { slug: string } }) {
  const generatorConfig = await getGeneratorConfig(params.slug);

  if (!generatorConfig) {
    notFound();
  }

  return (
    <Layout>
        <PaperworkGeneratorForm generatorConfig={generatorConfig} />
    </Layout>
  );
}
