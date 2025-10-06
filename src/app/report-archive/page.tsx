
'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader } from '@/components/dashboard/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArchiveRestore, Trash2 } from 'lucide-react';
import { useArchiveStore, ArchivedReport } from '@/stores/archive-store';
import { useChargeStore } from '@/stores/charge-store';
import { useFormStore } from '@/stores/form-store';
import { useAdvancedReportStore } from '@/stores/advanced-report-store';
import { format } from 'date-fns';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
  } from "@/components/ui/alert-dialog";
import configData from '../../../data/config.json';
import { usePaperworkStore } from '@/stores/paperwork-store';
import { useI18n, useScopedI18n } from '@/lib/i18n/client';

export default function ReportArchivePage() {
    const { reports, deleteReport, clearArchive } = useArchiveStore();
    const { setReport, setPenalCode, setAdditions, penalCode, additions } = useChargeStore();
    const setBasicForm = useFormStore(state => state.setAll);
    const setAdvancedForm = useAdvancedReportStore(state => state.setFields);
    const setAdvancedMode = useAdvancedReportStore(state => state.setAdvanced);
    const setPendingRestore = usePaperworkStore(state => state.setPendingRestore);
    const router = useRouter();
    const [isClient, setIsClient] = useState(false);
    const { t: tRoot } = useI18n();
    const t = useScopedI18n('reportArchive');
    
    const arrestReports = reports.filter(report => report.paperworkType === 'arrest-report');
    const paperworkReports = reports.filter(report => report.paperworkType === 'paperwork-generator');
    const [activeTab, setActiveTab] = useState<'arrest' | 'paperwork'>(
        () => (arrestReports.length > 0 ? 'arrest' : 'paperwork')
    );

    useEffect(() => {
        setIsClient(true);
        document.title = tRoot('reportArchive.documentTitle');
    }, [tRoot]);

    useEffect(() => {
        if (activeTab === 'arrest' && arrestReports.length === 0 && paperworkReports.length > 0) {
            setActiveTab('paperwork');
        } else if (activeTab === 'paperwork' && paperworkReports.length === 0 && arrestReports.length > 0) {
            setActiveTab('arrest');
        }
    }, [activeTab, arrestReports.length, paperworkReports.length]);

    const handleRestore = async (report: ArchivedReport) => {
        if (report.paperworkType === 'arrest-report') {
            setReport(report.charges || []);
            if (!penalCode || additions.length === 0) {
                try {
                    const [penalCodeData, additionsData] = await Promise.all([
                        fetch(`${configData.CONTENT_DELIVERY_NETWORK}?file=gtaw_penal_code.json`).then(res => res.json()),
                        fetch('/data/additions.json').then(res => res.json()),
                    ]);
                    setPenalCode(penalCodeData);
                    setAdditions(additionsData.additions);
                } catch (error) {
                    console.error('Failed to load charge data for restore:', error);
                }
            }
            if (report.type === 'basic') {
                setBasicForm(report.fields);
                setAdvancedMode(false);
            } else {
                setAdvancedForm(report.fields);
                setAdvancedMode(true);
            }
            router.push('/arrest-report');
            return;
        }

        if (report.paperworkType === 'paperwork-generator' && report.generator) {
            setPendingRestore({
                generatorId: report.generator.id,
                generatorType: report.generator.type,
                groupId: report.generator.groupId || null,
                fields: report.fields || {},
            });
            const params = new URLSearchParams({
                type: report.generator.type,
                id: report.generator.id,
            });
            if (report.generator.groupId) {
                params.set('group_id', report.generator.groupId);
            }
            router.push(`/paperwork-generators/form?${params.toString()}`);
        }
    };
    
    const getReportTitle = (report: ArchivedReport) => {
        if (report.type === 'advanced') {
            return report.fields.arrestee?.name || t('table.notAvailable');
        }
        return report.fields.arrest?.suspectName || t('table.notAvailable');
    };

    const getGeneratorTitle = (report: ArchivedReport) => {
        return report.generator?.title || t('table.unknownGenerator');
    };

    if (!isClient) {
        return null;
    }

    return (
        <div className="container mx-auto p-4 md:p-6 lg:p-8">
            <div className="flex justify-between items-center">
                <PageHeader
                    title={t('header.title')}
                    description={t('header.description')}
                />
                {reports.length > 0 && (
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive">
                                <Trash2 className="mr-2 h-4 w-4" /> {t('buttons.deleteAll')}
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>{t('dialogs.deleteAll.title')}</AlertDialogTitle>
                                <AlertDialogDescription>
                                   {t('dialogs.deleteAll.description', { count: reports.length })}
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>{t('buttons.cancel')}</AlertDialogCancel>
                                <AlertDialogAction onClick={clearArchive}>
                                    {t('buttons.continue')}
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                )}
            </div>
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'arrest' | 'paperwork')} className="mt-6">
                <TabsList className="w-full justify-start">
                    <TabsTrigger value="arrest">{t('tabs.arrestReports')} ({arrestReports.length})</TabsTrigger>
                    <TabsTrigger value="paperwork">{t('tabs.paperworkGenerators')} ({paperworkReports.length})</TabsTrigger>
                </TabsList>
                <TabsContent value="arrest">
                    <Card>
                        <CardHeader>
                            <CardTitle>{t('arrestReports.title')}</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>{t('table.headers.date')}</TableHead>
                                        <TableHead>{t('table.headers.reportType')}</TableHead>
                                        <TableHead>{t('table.headers.suspectName')}</TableHead>
                                        <TableHead className="text-right">{t('table.headers.actions')}</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {arrestReports.length > 0 ? (
                                        arrestReports.map((report) => (
                                            <TableRow key={report.id}>
                                                <TableCell>{format(new Date(report.id), 'PPP p')}</TableCell>
                                                <TableCell>
                                                    {report.type ? (
                                                        <Badge variant={report.type === 'advanced' ? 'default' : 'secondary'}>{t(`reportTypes.${report.type}`)}</Badge>
                                                    ) : (
                                                        t('table.notAvailable')
                                                    )}
                                                </TableCell>
                                                <TableCell>{getReportTitle(report)}</TableCell>
                                                <TableCell className="text-right space-x-2">
                                                    <Button variant="outline" size="sm" onClick={() => handleRestore(report)}>
                                                        <ArchiveRestore className="mr-2 h-4 w-4" /> {t('buttons.restore')}
                                                    </Button>
                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <Button variant="destructive" size="sm">
                                                                <Trash2 className="mr-2 h-4 w-4" /> {t('buttons.delete')}
                                                            </Button>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>{t('dialogs.deleteSingle.title')}</AlertDialogTitle>
                                                                <AlertDialogDescription>
                                                                    {t('dialogs.deleteSingle.description')}
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>{t('buttons.cancel')}</AlertDialogCancel>
                                                                <AlertDialogAction onClick={() => deleteReport(report.id)}>
                                                                    {t('buttons.continue')}
                                                                </AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={4} className="h-24 text-center">
                                                {t('arrestReports.empty')}
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="paperwork">
                    <Card>
                        <CardHeader>
                            <CardTitle>{t('paperworkSubmissions.title')}</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>{t('table.headers.date')}</TableHead>
                                        <TableHead>{t('table.headers.generator')}</TableHead>
                                        <TableHead>{t('table.headers.source')}</TableHead>
                                        <TableHead className="text-right">{t('table.headers.actions')}</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {paperworkReports.length > 0 ? (
                                        paperworkReports.map((report) => (
                                            <TableRow key={report.id}>
                                                <TableCell>{format(new Date(report.id), 'PPP p')}</TableCell>
                                                <TableCell>{getGeneratorTitle(report)}</TableCell>
                                                <TableCell>
                                                    {report.generator ? (
                                                        <Badge variant={report.generator.type === 'user' ? 'default' : 'secondary'}>
                                                            {t(`sourceTypes.${report.generator.type}`)}
                                                        </Badge>
                                                    ) : 'N/A'}
                                                </TableCell>
                                                <TableCell className="text-right space-x-2">
                                                    <Button variant="outline" size="sm" onClick={() => handleRestore(report)}>
                                                        <ArchiveRestore className="mr-2 h-4 w-4" /> {t('buttons.restore')}
                                                    </Button>
                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <Button variant="destructive" size="sm">
                                                                <Trash2 className="mr-2 h-4 w-4" /> {t('buttons.delete')}
                                                            </Button>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>{t('dialogs.deleteSingle.title')}</AlertDialogTitle>
                                                                <AlertDialogDescription>
                                                                    {t('dialogs.deleteSingle.description')}
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>{t('buttons.cancel')}</AlertDialogCancel>
                                                                <AlertDialogAction onClick={() => deleteReport(report.id)}>
                                                                    {t('buttons.continue')}
                                                                </AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={4} className="h-24 text-center">
                                                {t('paperworkSubmissions.empty')}
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
