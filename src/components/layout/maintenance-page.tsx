import { TriangleAlert } from 'lucide-react';

export default function MaintenancePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-center p-4">
      <TriangleAlert className="w-16 h-16 text-primary mb-4" />
      <h1 className="text-4xl font-bold mb-2">Under Maintenance</h1>
      <p className="text-lg text-muted-foreground">
        We are currently performing scheduled maintenance. We should be back online shortly.
      </p>
    </div>
  );
}
