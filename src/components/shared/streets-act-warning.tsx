import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import configData from '../../../data/config.json';
import { AlertTriangle } from 'lucide-react';
import { useScopedI18n } from '@/lib/i18n/client';

export function StreetsAlert() {
    const streetsLink : string = configData.URL_STREETS;
    const t = useScopedI18n('shared.streetsAct');

    const descriptionHtml = t('description', {
        link: `<a href="${streetsLink}" target="_blank" rel="noopener noreferrer" className="underline hover:text-yellow-700">${t('linkLabel')}</a>`
    });

    return (
        <Alert variant="warning" className="mt-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>{t('title')}</AlertTitle>
            <AlertDescription dangerouslySetInnerHTML={{ __html: descriptionHtml }} />
          </Alert>
    )
}
