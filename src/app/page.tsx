import { DashboardPage } from '@/components/dashboard/dashboard-page';
import { DashboardLayout } from '@/components/layout/dashboard-layout';

export default function Home() {
  return (
    <DashboardLayout>
      <DashboardPage />
    </DashboardLayout>
  );
}
