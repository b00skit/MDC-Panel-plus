import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import configData from '../../../data/config.json';
import { AlertTriangle } from 'lucide-react';

export function StreetsAlert() {
    const streetsLink : string = configData.URL_STREETS;

    return (
        <Alert variant="warning" className="mt-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Heads up!</AlertTitle>
            <AlertDescription>
              One or more of the charges are applicable to <strong>Section IV</strong> of the STREETS Act.<br/>
              The arrestee may be subject to the repeat offender clause and increased vehicle seizures and license suspenses (from 7 to 28 days).<br/> 
              Reference: <a href={streetsLink} target="_blank" rel="noopener noreferrer" className="underline hover:text-yellow-700">Strengthen Traffic Regulations to Ensure Every Traveler's Safety Act 2024 (STREETS Act)</a>
            </AlertDescription>
          </Alert>
    )
}