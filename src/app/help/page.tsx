
import { HelpPage } from '@/components/help/help-page';
import { promises as fs } from 'fs';
import path from 'path';

async function getHelpData() {
    const helpPath = path.join(process.cwd(), 'data/help.json');
    const configPath = path.join(process.cwd(), 'data/config.json');

    const [helpFile, configFile] = await Promise.all([
        fs.readFile(helpPath, 'utf8'),
        fs.readFile(configPath, 'utf8')
    ]);

    const helpData = JSON.parse(helpFile);
    const config = JSON.parse(configFile);

    return { helpData, config };
}


export default async function Help() {
  const { helpData, config } = await getHelpData();
  
  return (
      <HelpPage 
        initialResources={helpData.resources} 
        initialFaqs={helpData.faq} 
        initialConfig={config} 
      />
  );
}
