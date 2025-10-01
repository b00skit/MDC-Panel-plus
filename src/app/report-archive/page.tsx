
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

export default function ReportArchivePage() {
    const { reports, deleteReport, clearArchive } = useArchiveStore();
    const { setReport, setPenalCode, setAdditions, penalCode, additions } = useChargeStore();
    const setBasicForm = useFormStore(state => state.setAll);
    const setAdvancedForm = useAdvancedReportStore(state => state.setFields);
    const setAdvancedMode = useAdvancedReportStore(state => state.setAdvanced);
    const router = useRouter();
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
        document.title = 'MDC Panel – Report Archive';
    }, []);

    const handleRestore = async (report: ArchivedReport) => {
        setReport(report.charges);
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
    };
    
    const getReportTitle = (report: ArchivedReport) => {
        if (report.type === 'advanced') {
            return report.fields.arrestee?.name || 'N/A';
        }
        return report.fields.arrest?.suspectName || 'N/A';
    }

    if (!isClient) {
        return null;
    }

    return (
        <div className="container mx-auto p-4 md:p-6 lg:p-8">
            <div className="flex justify-between items-center">
                <PageHeader
                    title="Report Archive"
                    description="View and restore your past arrest reports."
                />
                {reports.length > 0 && (
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="destructive">
                                <Trash2 className="mr-2 h-4 w-4" /> Delete All
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This action cannot be undone. This will permanently delete all {reports.length} archived reports.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={clearArchive}>
                                    Continue
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                )}
            </div>
            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Report Type</TableHead>
                                <TableHead>Suspect Name</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {reports.length > 0 ? (
                                reports.map((report) => (
                                    <TableRow key={report.id}>
                                        <TableCell>{format(new Date(report.id), 'PPP p')}</TableCell>
                                        <TableCell><Badge variant={report.type === 'advanced' ? 'default' : 'secondary'}>{report.type}</Badge></TableCell>
                                        <TableCell>{getReportTitle(report)}</TableCell>
                                        <TableCell className="text-right space-x-2">
                                            <Button variant="outline" size="sm" onClick={() => handleRestore(report)}>
                                                <ArchiveRestore className="mr-2 h-4 w-4" /> Restore
                                            </Button>
                                            <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                    <Button variant="destructive" size="sm">
                                                        <Trash2 className="mr-2 h-4 w-4" /> Delete
                                                    </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                    <AlertDialogHeader>
                                                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                        <AlertDialogDescription>
                                                            This action cannot be undone. This will permanently delete this archived report.
                                                        </AlertDialogDescription>
                                                    </AlertDialogHeader>
                                                    <AlertDialogFooter>
                                                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                        <AlertDialogAction onClick={() => deleteReport(report.id)}>
                                                            Continue
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
                                        No archived reports found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
}
