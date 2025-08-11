
'use client';

import { useSettingsStore } from '@/stores/settings-store';
import { ModuleCard } from '../dashboard/module-card';
import { FileSearch, Puzzle } from 'lucide-react';
import { Separator } from '../ui/separator';

const ICONS: { [key: string]: React.ReactNode } = {
  FileSearch: <FileSearch className="w-8 h-8 text-primary" />,
  Puzzle: <Puzzle className="w-8 h-8 text-primary" />,
  Car: <FileSearch className="w-8 h-8 text-primary" />,
  default: <Puzzle className="w-8 h-8 text-primary" />,
};

interface PaperworkGeneratorsListProps {
    globalGenerators: any[];
    factionGroups: any[];
}

export function PaperworkGeneratorsList({ globalGenerators, factionGroups }: PaperworkGeneratorsListProps) {
    const { hiddenFactions } = useSettingsStore();

    const visibleFactionGroups = factionGroups.filter(
        (group) => !hiddenFactions.includes(group.group_id)
    );

    return (
        <div className="space-y-8">
            {globalGenerators.length > 0 && (
                 <div>
                    <h2 className="text-2xl font-bold mb-4">Global Generators</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {globalGenerators.map((generator) => (
                            <ModuleCard
                            key={generator.id}
                            title={generator.title}
                            description={generator.description}
                            icon={ICONS[generator.icon] || ICONS.default}
                            href={`/paperwork-generators/form?type=static&id=${generator.id}`}
                            />
                        ))}
                    </div>
                 </div>
            )}
            
            {visibleFactionGroups.map((group, index) => (
                <div key={group.group_id}>
                    {(globalGenerators.length > 0 || index > 0) && <Separator />}
                    <h2 className="text-2xl font-bold my-4">{group.group_name}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {group.generators.map((generator: any) => (
                        <ModuleCard
                            key={generator.id}
                            title={generator.title}
                            description={generator.description}
                            icon={ICONS[generator.icon] || ICONS.default}
                            href={`/paperwork-generators/form?type=static&id=${generator.id}&group_id=${group.group_id}`}
                        />
                    ))}
                    </div>
                </div>
            ))}

            {globalGenerators.length === 0 && visibleFactionGroups.length === 0 && (
                 <p className="text-muted-foreground text-center py-8">No paperwork generators available.</p>
            )}
        </div>
    );
}
