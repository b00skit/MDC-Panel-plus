
'use client';

import { useChargeStore, type SelectedCharge } from '@/stores/charge-store';
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle, Clipboard, Pencil, Link2, Asterisk } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';
import config from '../../../data/config.json';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useMemo, useCallback } from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';
import type { ArrestCalculation, ChargeResult } from '@/lib/arrest-calculator';
import { Skeleton } from '@/components/ui/skeleton';
import { useScopedI18n } from '@/lib/i18n/client';

/** ---------- Loading UI ---------- */
function LoadingTableSkeleton() {
    return (
      <Card aria-busy="true" aria-live="polite">
        <CardHeader className="flex flex-row items-center justify-between">
            <Skeleton className="h-8 w-32" />
            <div className="flex gap-2">
                <Skeleton className="h-9 w-44 rounded-md" />
                <Skeleton className="h-9 w-36 rounded-md" />
            </div>
        </CardHeader>
        <CardContent>
          <div className="w-full overflow-hidden rounded-lg border">
            <div className="grid grid-cols-12 gap-4 bg-muted/50 p-3">
              {Array.from({ length: 12 }).map((_, i) => (
                <Skeleton key={i} className="h-4 w-full" />
              ))}
            </div>
            <div className="divide-y divide-border">
              {Array.from({ length: 3 }).map((_, r) => (
                <div key={r} className="grid grid-cols-12 gap-4 p-3">
                  {Array.from({ length: 12 }).map((__, c) => (
                    <Skeleton key={c} className="h-5 w-full" />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  function LoadingSummarySkeleton() {
    return (
      <Card aria-busy="true">
        <CardHeader>
          <Skeleton className="h-8 w-32" />
        </CardHeader>
        <CardContent>
           <div className="w-full overflow-hidden rounded-lg border">
              <div className="grid grid-cols-8 gap-4 bg-muted/50 p-3">
                {Array.from({ length: 8 }).map((_, i) => (
                  <Skeleton key={i} className="h-4 w-full" />
                ))}
              </div>
              <div className="grid grid-cols-8 gap-4 p-3">
                  {Array.from({ length: 8 }).map((_, i) => (
                      <Skeleton key={i} className="h-5 w-full" />
                  ))}
              </div>
            </div>
        </CardContent>
      </Card>
    );
  }
  
  function LoadingCopyablesSkeleton() {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-4 space-y-2">
              <Skeleton className="h-4 w-24" />
              <div className="flex gap-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-10" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }
/** -------------------------------- */

interface ArrestCalculatorResultsProps {
  report: SelectedCharge[];
  showCharges?: boolean;
  showStipulations?: boolean;
  showSummary?: boolean;
  showCopyables?: boolean;
  clickToCopy?: boolean;
  showModifyChargesButton?: boolean;
  onModifyCharges?: () => void;
  paroleViolatorOverride?: boolean;
}

export function ArrestCalculatorResults({
  report,
  showCharges = false,
  showStipulations = false,
  showSummary = false,
  showCopyables = false,
  clickToCopy = false,
  showModifyChargesButton = false,
  onModifyCharges,
  paroleViolatorOverride,
}: ArrestCalculatorResultsProps) {
  const { toast } = useToast();
  const router = useRouter();
  const { setCharges: setChargesForModification, isParoleViolator, reportIsParoleViolator } = useChargeStore();

  const [data, setData] = useState<ArrestCalculation | null>(null);
  const t = useScopedI18n('arrestCalculation.results');

  const additionNameMap = useMemo(() => {
    const map = new Map<string, string>([
      ['offender', t('additionNames.offender')],
      ['attempt', t('additionNames.attempt')],
      ['accomplice', t('additionNames.accomplice')],
      ['accessory', t('additionNames.accessory')],
      ['conspiracy', t('additionNames.conspiracy')],
      ['solicitation', t('additionNames.solicitation')],
    ]);
    map.set(config.PAROLE_VIOLATION_DEFINITION.toLowerCase(), t('additionNames.paroleViolation'));
    return map;
  }, [t]);

  const translateAdditionName = useCallback((name?: string | null) => {
    if (!name) {
      return additionNameMap.get('offender') ?? 'Offender';
    }
    const translation = additionNameMap.get(name.toLowerCase());
    return translation ?? name;
  }, [additionNameMap]);

  const typeLabels = useMemo(
    () => ({
      F: t('types.felony'),
      M: t('types.misdemeanor'),
      I: t('types.infraction'),
      default: t('types.unknown'),
    }),
    [t],
  );

  const getTypeLabel = useCallback(
    (type: string | undefined) => {
      if (!type) return typeLabels.default;
      return typeLabels[type as 'F' | 'M' | 'I'] ?? typeLabels.default;
    },
    [typeLabels],
  );

  const autoBailLabels = useMemo(
    () => ({
      na: t('autoBail.na'),
      noBail: t('autoBail.noBail'),
      auto: t('autoBail.auto'),
      discretionary: t('autoBail.discretionary'),
    }),
    [t],
  );

  const bailStatusLabels = useMemo(
    () => ({
      'N/A': t('bailStatus.na'),
      'NOT ELIGIBLE': t('bailStatus.notEligible'),
      'DISCRETIONARY': t('bailStatus.discretionary'),
      'ELIGIBLE': t('bailStatus.eligible'),
    }),
    [t],
  );

  const yesLabel = t('labels.yes');
  const noLabel = t('labels.no');
  const notAvailableLabel = t('labels.notAvailable');
  const yesWithValue = useCallback((value: string) => t('labels.yesWithValue', { value }), [t]);
  const formatCurrency = useCallback((value: number) => t('currency', { value: value.toLocaleString() }), [t]);

  const zeroLabel = t('time.zero');

  const formatUnit = useCallback(
    (unit: 'days' | 'hours' | 'minutes', count: number) =>
      t(`time.${unit}.${count === 1 ? 'one' : 'other'}`, { count }),
    [t],
  );

  const formatTotalTime = useCallback(
    (totalMinutes: number) => {
      const rounded = Math.round(totalMinutes);
      if (rounded === 0) {
        return { label: zeroLabel, detailed: zeroLabel };
      }

      const days = Math.floor(rounded / 1440);
      const hours = Math.floor((rounded % 1440) / 60);
      const minutes = rounded % 60;

      const parts: string[] = [];
      if (days > 0) {
        parts.push(formatUnit('days', days));
      }
      if (hours > 0) {
        parts.push(formatUnit('hours', hours));
      }
      if (minutes > 0) {
        parts.push(formatUnit('minutes', minutes));
      }

      const label = parts.join(' ');
      const detailed = t('time.summary', { parts: label, minutes: rounded });

      return { label, detailed };
    },
    [formatUnit, t, zeroLabel],
  );

  const formatDays = useCallback(
    (value: number) => {
      const rounded = Math.round(value);
      if (rounded <= 0) return null;
      return formatUnit('days', rounded);
    },
    [formatUnit],
  );

  const formatImpoundDisplay = useCallback(
    (value: number) => {
      const dayLabel = formatDays(value);
      return dayLabel ? yesWithValue(dayLabel) : noLabel;
    },
    [formatDays, yesWithValue, noLabel],
  );

  const formatDaysOrNone = useCallback(
    (value: number) => {
      const dayLabel = formatDays(value);
      return dayLabel ?? noLabel;
    },
    [formatDays, noLabel],
  );

  const getBailStatusLabel = useCallback(
    (status: string) => bailStatusLabels[status as keyof typeof bailStatusLabels] ?? bailStatusLabels['N/A'],
    [bailStatusLabels],
  );

  const getCopyTooltip = useCallback((field: string) => t('charges.copyTooltip', { field }), [t]);
  const getCopyAria = useCallback((field: string) => t('charges.copyAria', { field }), [t]);

  const BailStatusBadge = ({ bailInfo }: { bailInfo: any }) => {
    if (!bailInfo) return <Badge variant="secondary">{autoBailLabels.na}</Badge>;
    if (bailInfo.auto === false) return <Badge variant="destructive">{autoBailLabels.noBail}</Badge>;
    if (bailInfo.auto === true)
      return <Badge className="bg-green-500 hover:bg-green-600 text-white">{autoBailLabels.auto}</Badge>;
    if (bailInfo.auto === 2)
      return <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white">{autoBailLabels.discretionary}</Badge>;
    return <Badge variant="secondary">{autoBailLabels.na}</Badge>;
  };

  const CopyableCard = ({
    label,
    value,
    tooltipContent,
  }: {
    label: string;
    value: string | number;
    tooltipContent?: string;
  }) => {
    const inputId = `copy-${label.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
    const ariaLabel = getCopyAria(label);

    const handleCopy = () => {
      navigator.clipboard.writeText(value.toString());
      toast({
        title: t('copyables.toastTitle'),
        description: t('copyables.toastDescription', { label }),
      });
    };

    const content = (
      <Card>
        <CardContent className="p-4">
          <Label htmlFor={inputId}>
            <div className="flex items-center gap-1">
              {label}
              {tooltipContent && <Asterisk className="h-3 w-3 text-yellow-500" />}
            </div>
          </Label>
          <div className="flex items-center gap-2 mt-2">
            <Input id={inputId} value={value} readOnly disabled />
            <Button
              size="icon"
              variant="outline"
              onClick={handleCopy}
              aria-label={ariaLabel}
              title={ariaLabel}
            >
              <Clipboard className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    );

    if (tooltipContent) {
      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>{content}</TooltipTrigger>
            <TooltipContent>
              <p>{tooltipContent}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    }

    return content;
  };

  const effectiveParoleStatus = paroleViolatorOverride ?? (report.length > 0 ? reportIsParoleViolator : isParoleViolator);

  useEffect(() => {
    fetch('/api/arrest-calculator', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ report, isParoleViolator: effectiveParoleStatus }),
    })
      .then(res => res.json())
      .then(setData)
      .catch(err => console.error('Failed to load arrest calculation:', err));
  }, [report, effectiveParoleStatus]);

  if (!data) {
    return (
      <div className="space-y-6">
        <LoadingTableSkeleton />
        <LoadingSummarySkeleton />
        <LoadingCopyablesSkeleton />
      </div>
    );
  }

  const { calculationResults, extras, totals, bailStatus, minTimeCapped, maxTimeCapped, isCapped, impoundCapped, isImpoundCapped, suspensionCapped, isSuspensionCapped } = data;

  const handleCopyToClipboard = (text: string | number, label?: string) => {
    navigator.clipboard.writeText(text.toString());
    toast({
      title: t('toasts.copiedTitle'),
      description: label
        ? t('toasts.copiedDescriptionWithLabel', { label, value: text })
        : t('toasts.copiedDescription', { value: text }),
    });
  };

  const handleModifyCharges = () => {
    onModifyCharges?.();
    setChargesForModification(report);
    router.push('/arrest-calculator?modify=true');
  };

  const handleCopyCalculationLink = () => {
    const additionMapping: { [key: string]: number } = {
      Offender: 1,
      Accomplice: 2,
      Accessory: 3,
      Conspiracy: 4,
      Attempt: 5,
      Solicitation: 6,
      'Parole Violation': 7,
    };

    const chargeParams = calculationResults.map(result => {
      const { row, chargeDetails } = result as ChargeResult;
      const additionIndex = additionMapping[row.addition || 'Offender'];
      let chargeStr = `${row.class?.toLowerCase()}${chargeDetails.id}-${row.offense}-${additionIndex}`;
      if (chargeDetails.drugs && row.category) {
        const categoryIndex = Object.keys(chargeDetails.drugs).find(
          key => chargeDetails.drugs![key] === row.category
        );
        if (categoryIndex) {
          chargeStr += `-${categoryIndex}`;
        }
      }
      return `c=${encodeURIComponent(chargeStr)}`;
    });

    if (chargeParams.length > 0) {
      const queryParts = [...chargeParams];
      if (effectiveParoleStatus) {
        queryParts.push('pv=1');
      }
      const url = `${window.location.origin}/arrest-calculation?${queryParts.join('&')}`;
      navigator.clipboard.writeText(url);
      toast({
        title: t('toasts.linkCopiedTitle'),
        description: t('toasts.linkCopiedDescription'),
      });
    }
  };

  const hasAnyModifiers = calculationResults.some(r => r.isModified);

  const charges = calculationResults.map(result => {
    const {
      row,
      chargeDetails,
      appliedAdditions,
      isModified,
      original,
      modified,
      fine,
      impound,
      suspension,
      bailAuto,
      bailCost,
    } = result as ChargeResult;

    const typePrefix = `${chargeDetails.type}${row.class}`;
    let title = t('charges.title', {
      prefix: typePrefix,
      id: chargeDetails.id,
      charge: chargeDetails.charge,
    });

    if (chargeDetails.drugs && row.category) {
      title += ` ${t('charges.categorySuffix', { category: row.category })}`;
    } else if (row.offense && row.offense !== '1') {
      title += ` ${t('charges.offenseSuffix', { offense: row.offense })}`;
    }

    const additions = appliedAdditions ?? [];
    const additionDisplayNames =
      additions.length > 0
        ? additions.map(add => translateAdditionName(add.name)).join(' + ')
        : translateAdditionName(row.addition || 'Offender');

    const typeDisplay = getTypeLabel(chargeDetails.type);
    const typeColorClass =
      chargeDetails.type === 'F'
        ? 'text-red-500'
        : chargeDetails.type === 'M'
          ? 'text-yellow-500'
            : chargeDetails.type === 'I'
              ? 'text-green-500'
              : '';

    const minTime = formatTotalTime(modified.minTime);
    const maxTime = formatTotalTime(modified.maxTime);
    const originalMinTime = formatTotalTime(original.minTime);
    const originalMaxTime = formatTotalTime(original.maxTime);

    return {
      key: row.uniqueId,
      title,
      additionDisplayNames,
      additions,
      isModified,
      offense: row.offense,
      offenseLabel: row.offense ? t('charges.offenseNumber', { offense: row.offense }) : null,
      typeDisplay,
      typeColorClass,
      minTime,
      maxTime,
      originalMinTime,
      originalMaxTime,
      pointsDisplay: Math.round(modified.points),
      originalPoints: original.points,
      fine,
      fineDisplay: formatCurrency(fine),
      impoundDisplay: formatImpoundDisplay(impound),
      suspensionDisplay: formatImpoundDisplay(suspension),
      bailAuto,
      bailCost,
      bailCostDisplay: bailAuto !== false && bailCost > 0 ? formatCurrency(bailCost) : notAvailableLabel,
    };
  });

  const minTimeCappedDisplay = formatTotalTime(minTimeCapped);
  const maxTimeCappedDisplay = formatTotalTime(maxTimeCapped);
  const originalMinDisplay = formatTotalTime(totals.original.minTime);
  const originalMaxDisplay = formatTotalTime(totals.original.maxTime);
  const modifiedMinDisplay = formatTotalTime(totals.modified.minTime);
  const modifiedMaxDisplay = formatTotalTime(totals.modified.maxTime);
  const totalFineDisplay = formatCurrency(totals.fine);
  const highestBailDisplay = formatCurrency(totals.highestBail);

  const renderOverallBailStatus = () => {
    if (bailStatus === 'NOT ELIGIBLE') {
      return <Badge variant="destructive">{getBailStatusLabel(bailStatus)}</Badge>;
    }
    if (bailStatus === 'DISCRETIONARY') {
      return <Badge className="bg-yellow-500 hover:bg-yellow-600 text-white">{getBailStatusLabel(bailStatus)}</Badge>;
    }
    if (bailStatus === 'ELIGIBLE') {
      return <Badge className="bg-green-500 hover:bg-green-600 text-white">{getBailStatusLabel(bailStatus)}</Badge>;
    }
    return <Badge variant="secondary">{getBailStatusLabel('N/A')}</Badge>;
  };

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {showCharges && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>{t('charges.cardTitle')}</CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleCopyCalculationLink}>
                  <Link2 className="mr-2 h-4 w-4" />
                  {t('charges.copyLink')}
                </Button>
                {showModifyChargesButton && (
                  <Button variant="outline" size="sm" onClick={handleModifyCharges}>
                    <Pencil className="mr-2 h-4 w-4" />
                    {t('charges.modify')}
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="hidden w-full overflow-x-auto sm:block">
                <Table className="w-full sm:min-w-[960px]">
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('charges.table.title')}</TableHead>
                      <TableHead>{t('charges.table.addition')}</TableHead>
                      <TableHead>{t('charges.table.offense')}</TableHead>
                      <TableHead>{t('charges.table.type')}</TableHead>
                      <TableHead>{t('charges.table.minTime')}</TableHead>
                      <TableHead>{t('charges.table.maxTime')}</TableHead>
                      <TableHead>{t('charges.table.points')}</TableHead>
                      <TableHead>{t('charges.table.fine')}</TableHead>
                      <TableHead>{t('charges.table.impound')}</TableHead>
                      <TableHead>{t('charges.table.suspension')}</TableHead>
                      <TableHead>{t('charges.table.autoBail')}</TableHead>
                      <TableHead>{t('charges.table.bail')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {charges.map(charge => (
                      <TableRow key={charge.key}>
                        <TableCell
                          className={cn('font-medium', clickToCopy && 'cursor-pointer hover:text-primary')}
                          onClick={clickToCopy ? () => handleCopyToClipboard(charge.title, t('charges.table.title')) : undefined}
                          title={clickToCopy ? getCopyTooltip(t('charges.table.title')) : undefined}
                        >
                          {charge.title}
                        </TableCell>
                        <TableCell>
                          {charge.isModified && charge.additions.length > 0 ? (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <span className="cursor-help font-bold text-yellow-500">{charge.additionDisplayNames}</span>
                              </TooltipTrigger>
                              <TooltipContent className="space-y-2">
                                {charge.additions.map(addition => (
                                  <div key={addition.name} className="space-y-1">
                                    <p className="font-semibold">{translateAdditionName(addition.name)}</p>
                                    <p>{t('charges.tooltip.sentenceMultiplier', { value: addition.sentence_multiplier })}</p>
                                    <p>{t('charges.tooltip.pointsMultiplier', { value: addition.points_multiplier })}</p>
                                  </div>
                                ))}
                              </TooltipContent>
                            </Tooltip>
                          ) : (
                            <span>{charge.additionDisplayNames}</span>
                          )}
                        </TableCell>
                        <TableCell>{charge.offense}</TableCell>
                        <TableCell>
                          <span className={cn('font-bold', charge.typeColorClass)}>{charge.typeDisplay}</span>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            {charge.minTime.label}
                            {charge.isModified && (
                              <Tooltip>
                                <TooltipTrigger>
                                  <Asterisk className="h-3 w-3 text-yellow-500" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>{t('charges.tooltip.originalTime', { value: charge.originalMinTime.detailed })}</p>
                                  <p>{t('charges.tooltip.modifiedTime', { value: charge.minTime.detailed })}</p>
                                </TooltipContent>
                              </Tooltip>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            {charge.maxTime.label}
                            {charge.isModified && (
                              <Tooltip>
                                <TooltipTrigger>
                                  <Asterisk className="h-3 w-3 text-yellow-500" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>{t('charges.tooltip.originalTime', { value: charge.originalMaxTime.detailed })}</p>
                                  <p>{t('charges.tooltip.modifiedTime', { value: charge.maxTime.detailed })}</p>
                                </TooltipContent>
                              </Tooltip>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            {charge.pointsDisplay}
                            {charge.isModified && (
                              <Tooltip>
                                <TooltipTrigger>
                                  <Asterisk className="h-3 w-3 text-yellow-500" />
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p>{t('charges.tooltip.originalPoints', { value: charge.originalPoints })}</p>
                                  <p>{t('charges.tooltip.modifiedPoints', { value: charge.pointsDisplay })}</p>
                                </TooltipContent>
                              </Tooltip>
                            )}
                          </div>
                        </TableCell>
                        <TableCell
                          className={cn(clickToCopy && 'cursor-pointer hover:text-primary')}
                          onClick={clickToCopy ? () => handleCopyToClipboard(charge.fine, t('charges.copyLabels.rawFine')) : undefined}
                          title={clickToCopy ? getCopyTooltip(t('charges.copyLabels.rawFine')) : undefined}
                          aria-label={clickToCopy ? getCopyAria(t('charges.copyLabels.rawFine')) : undefined}
                        >
                          {charge.fineDisplay}
                        </TableCell>
                        <TableCell>{charge.impoundDisplay}</TableCell>
                        <TableCell>{charge.suspensionDisplay}</TableCell>
                        <TableCell>
                          <BailStatusBadge bailInfo={{ auto: charge.bailAuto }} />
                        </TableCell>
                        <TableCell>{charge.bailCostDisplay}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              <div className="space-y-4 sm:hidden">
                {charges.map(charge => (
                  <div
                    key={charge.key}
                    className="rounded-lg border bg-card p-4 text-card-foreground shadow-sm text-center sm:text-left"
                  >
                    <div
                      className={cn('text-base font-semibold', clickToCopy && 'cursor-pointer hover:text-primary')}
                      onClick={clickToCopy ? () => handleCopyToClipboard(charge.title, t('charges.table.title')) : undefined}
                    >
                      {charge.title}
                    </div>
                    <div className="mt-2 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-xs uppercase text-muted-foreground sm:justify-start">
                      <span className={cn('font-semibold', charge.typeColorClass)}>{charge.typeDisplay}</span>
                      {charge.offenseLabel && <span>{charge.offenseLabel}</span>}
                    </div>
                    <div className="mt-3 text-sm text-center sm:text-left">
                      <p className="text-xs font-semibold uppercase text-muted-foreground">{t('charges.table.addition')}</p>
                      {charge.isModified && charge.additions.length > 0 ? (
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="mt-1 inline-flex cursor-help font-semibold text-yellow-500">
                              {charge.additionDisplayNames}
                            </span>
                          </TooltipTrigger>
                          <TooltipContent className="space-y-2">
                              {charge.additions.map(addition => (
                                <div key={addition.name} className="space-y-1">
                                  <p className="font-semibold">{translateAdditionName(addition.name)}</p>
                                  <p>{t('charges.tooltip.sentenceMultiplier', { value: addition.sentence_multiplier })}</p>
                                  <p>{t('charges.tooltip.pointsMultiplier', { value: addition.points_multiplier })}</p>
                                </div>
                              ))}
                          </TooltipContent>
                        </Tooltip>
                      ) : (
                        <span className="mt-1 block">{charge.additionDisplayNames}</span>
                      )}
                    </div>
                    <dl className="mt-3 space-y-3 text-sm">
                      <div>
                        <dt className="text-xs font-semibold uppercase text-muted-foreground">{t('charges.table.minTime')}</dt>
                        <dd className="mt-1 flex items-center justify-center gap-1 sm:justify-start">
                          {charge.minTime.label}
                          {charge.isModified && (
                            <Tooltip>
                              <TooltipTrigger>
                                <Asterisk className="h-3 w-3 text-yellow-500" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{t('charges.tooltip.originalTime', { value: charge.originalMinTime.detailed })}</p>
                                <p>{t('charges.tooltip.modifiedTime', { value: charge.minTime.detailed })}</p>
                              </TooltipContent>
                            </Tooltip>
                          )}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs font-semibold uppercase text-muted-foreground">{t('charges.table.maxTime')}</dt>
                        <dd className="mt-1 flex items-center justify-center gap-1 sm:justify-start">
                          {charge.maxTime.label}
                          {charge.isModified && (
                            <Tooltip>
                              <TooltipTrigger>
                                <Asterisk className="h-3 w-3 text-yellow-500" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{t('charges.tooltip.originalTime', { value: charge.originalMaxTime.detailed })}</p>
                                <p>{t('charges.tooltip.modifiedTime', { value: charge.maxTime.detailed })}</p>
                              </TooltipContent>
                            </Tooltip>
                          )}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-xs font-semibold uppercase text-muted-foreground">{t('charges.table.points')}</dt>
                        <dd className="mt-1 flex items-center justify-center gap-1 sm:justify-start">
                          {charge.pointsDisplay}
                          {charge.isModified && (
                            <Tooltip>
                              <TooltipTrigger>
                                <Asterisk className="h-3 w-3 text-yellow-500" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{t('charges.tooltip.originalPoints', { value: charge.originalPoints })}</p>
                                <p>{t('charges.tooltip.modifiedPoints', { value: charge.pointsDisplay })}</p>
                              </TooltipContent>
                            </Tooltip>
                          )}
                        </dd>
                      </div>
                        <div>
                          <dt className="text-xs font-semibold uppercase text-muted-foreground">{t('charges.table.fine')}</dt>
                          <dd
                            className={cn('mt-1', clickToCopy && 'cursor-pointer hover:text-primary')}
                            onClick={clickToCopy ? () => handleCopyToClipboard(charge.fine, t('charges.copyLabels.rawFine')) : undefined}
                            title={clickToCopy ? getCopyTooltip(t('charges.copyLabels.rawFine')) : undefined}
                            aria-label={clickToCopy ? getCopyAria(t('charges.copyLabels.rawFine')) : undefined}
                          >
                            {charge.fineDisplay}
                          </dd>
                        </div>
                        <div>
                          <dt className="text-xs font-semibold uppercase text-muted-foreground">{t('charges.table.impound')}</dt>
                          <dd className="mt-1">{charge.impoundDisplay}</dd>
                        </div>
                        <div>
                          <dt className="text-xs font-semibold uppercase text-muted-foreground">{t('charges.table.suspension')}</dt>
                          <dd className="mt-1">{charge.suspensionDisplay}</dd>
                        </div>
                        <div>
                          <dt className="text-xs font-semibold uppercase text-muted-foreground">{t('charges.table.autoBail')}</dt>
                          <dd className="mt-1">
                            <BailStatusBadge bailInfo={{ auto: charge.bailAuto }} />
                          </dd>
                        </div>
                        <div>
                          <dt className="text-xs font-semibold uppercase text-muted-foreground">{t('charges.table.bail')}</dt>
                          <dd className="mt-1">{charge.bailCostDisplay}</dd>
                        </div>
                    </dl>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {showStipulations && extras && extras.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>{t('stipulations.title')}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="w-full overflow-x-auto">
                <Table className="w-full sm:min-w-[480px]">
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t('stipulations.charge')}</TableHead>
                      <TableHead>{t('stipulations.stipulation')}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {extras.map((item, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{item.title}</TableCell>
                        <TableCell className="whitespace-pre-wrap">{item.extra}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}

        {showSummary && (
          <Card>
            <CardHeader>
              <CardTitle>{t('summary.title')}</CardTitle>
            </CardHeader>
            <CardContent>
               {isCapped && (
                <Alert variant="warning" className="mb-4">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>{t('summary.alerts.sentence.title')}</AlertTitle>
                  <AlertDescription>
                    {t('summary.alerts.sentence.description', { maxDays: config.MAX_SENTENCE_DAYS })}
                    <br />
                    <b>{t('summary.alerts.sentence.originalMinLabel')}</b> {modifiedMinDisplay.detailed}
                    <br />
                    <b>{t('summary.alerts.sentence.originalMaxLabel')}</b> {modifiedMaxDisplay.detailed}
                  </AlertDescription>
                </Alert>
              )}
               {isImpoundCapped && (
                 <Alert variant="warning" className="mb-4">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>{t('summary.alerts.impound.title')}</AlertTitle>
                  <AlertDescription>
                    {t('summary.alerts.impound.description', { maxDays: config.MAX_IMPOUND_DAYS, value: formatDaysOrNone(totals.modified.impound) })}
                  </AlertDescription>
                </Alert>
              )}
               {isSuspensionCapped && (
                 <Alert variant="warning" className="mb-4">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertTitle>{t('summary.alerts.suspension.title')}</AlertTitle>
                  <AlertDescription>
                     {t('summary.alerts.suspension.description', { maxDays: config.MAX_SUSPENSION_DAYS, value: formatDaysOrNone(totals.modified.suspension) })}
                  </AlertDescription>
                </Alert>
              )}
              <div className="grid gap-3 sm:hidden">
                <div className="rounded-lg border bg-card p-4 text-center shadow-sm">
                  <p className="text-xs font-semibold uppercase text-muted-foreground">{t('summary.mobile.minTime')}</p>
                  <div className="mt-1 flex items-center justify-center gap-1 text-sm font-medium">
                    {minTimeCappedDisplay.label}
                    {hasAnyModifiers && (
                      <Tooltip>
                        <TooltipTrigger>
                          <Asterisk className="h-3 w-3 text-yellow-500" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{t('charges.tooltip.originalTime', { value: originalMinDisplay.detailed })}</p>
                          <p>{t('charges.tooltip.modifiedTime', { value: modifiedMinDisplay.detailed })}</p>
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </div>
                </div>
                <div className="rounded-lg border bg-card p-4 text-center shadow-sm">
                  <p className="text-xs font-semibold uppercase text-muted-foreground">{t('summary.mobile.maxTime')}</p>
                  <div className="mt-1 flex items-center justify-center gap-1 text-sm font-medium">
                    {maxTimeCappedDisplay.label}
                    {hasAnyModifiers && (
                      <Tooltip>
                        <TooltipTrigger>
                          <Asterisk className="h-3 w-3 text-yellow-500" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{t('charges.tooltip.originalTime', { value: originalMaxDisplay.detailed })}</p>
                          <p>{t('charges.tooltip.modifiedTime', { value: modifiedMaxDisplay.detailed })}</p>
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </div>
                </div>
                <div className="rounded-lg border bg-card p-4 text-center shadow-sm">
                  <p className="text-xs font-semibold uppercase text-muted-foreground">{t('summary.mobile.points')}</p>
                  <div className="mt-1 flex items-center justify-center gap-1 text-sm font-medium">
                    {Math.round(totals.modified.points)}
                    {hasAnyModifiers && (
                      <Tooltip>
                        <TooltipTrigger>
                          <Asterisk className="h-3 w-3 text-yellow-500" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{t('charges.tooltip.originalPoints', { value: totals.original.points })}</p>
                          <p>{t('charges.tooltip.modifiedPoints', { value: Math.round(totals.modified.points) })}</p>
                        </TooltipContent>
                      </Tooltip>
                    )}
                  </div>
                </div>
                <div className="rounded-lg border bg-card p-4 text-center shadow-sm">
                  <p className="text-xs font-semibold uppercase text-muted-foreground">{t('summary.mobile.fine')}</p>
                  <p className="mt-1 text-sm font-medium">{totalFineDisplay}</p>
                </div>
                <div className="rounded-lg border bg-card p-4 text-center shadow-sm">
                  <p className="text-xs font-semibold uppercase text-muted-foreground">{t('summary.mobile.impound')}</p>
                  <p className="mt-1 text-sm font-medium">{formatDaysOrNone(impoundCapped)}</p>
                </div>
                <div className="rounded-lg border bg-card p-4 text-center shadow-sm">
                  <p className="text-xs font-semibold uppercase text-muted-foreground">{t('summary.mobile.suspension')}</p>
                  <p className="mt-1 text-sm font-medium">{formatDaysOrNone(suspensionCapped)}</p>
                </div>
                <div className="rounded-lg border bg-card p-4 text-center shadow-sm">
                  <p className="text-xs font-semibold uppercase text-muted-foreground">{t('summary.mobile.bailStatus')}</p>
                  <div className="mt-2 flex justify-center">
                    {renderOverallBailStatus()}
                  </div>
                </div>
                <div className="rounded-lg border bg-card p-4 text-center shadow-sm">
                  <p className="text-xs font-semibold uppercase text-muted-foreground">{t('summary.mobile.highestBail')}</p>
                  <p className="mt-1 text-sm font-medium">{highestBailDisplay}</p>
                </div>
              </div>
              <div className="hidden w-full overflow-x-auto sm:block">
                <Table className="w-full sm:min-w-[720px]">
                  <TableHeader>
                  <TableRow>
                    <TableHead>{t('summary.table.minTime')}</TableHead>
                    <TableHead>{t('summary.table.maxTime')}</TableHead>
                    <TableHead>{t('summary.table.points')}</TableHead>
                    <TableHead>{t('summary.table.fine')}</TableHead>
                    <TableHead>{t('summary.table.impound')}</TableHead>
                    <TableHead>{t('summary.table.suspension')}</TableHead>
                    <TableHead>{t('summary.table.bailStatus')}</TableHead>
                    <TableHead>{t('summary.table.highestBail')}</TableHead>
                  </TableRow>
                  </TableHeader>
                  <TableBody>
                  <TableRow>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {minTimeCappedDisplay.label}
                        {hasAnyModifiers && (
                          <Tooltip>
                            <TooltipTrigger>
                              <Asterisk className="h-3 w-3 text-yellow-500" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{t('charges.tooltip.originalTime', { value: originalMinDisplay.detailed })}</p>
                              <p>{t('charges.tooltip.modifiedTime', { value: modifiedMinDisplay.detailed })}</p>
                            </TooltipContent>
                          </Tooltip>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {maxTimeCappedDisplay.label}
                        {hasAnyModifiers && (
                          <Tooltip>
                            <TooltipTrigger>
                              <Asterisk className="h-3 w-3 text-yellow-500" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{t('charges.tooltip.originalTime', { value: originalMaxDisplay.detailed })}</p>
                              <p>{t('charges.tooltip.modifiedTime', { value: modifiedMaxDisplay.detailed })}</p>
                            </TooltipContent>
                          </Tooltip>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {Math.round(totals.modified.points)}
                        {hasAnyModifiers && (
                          <Tooltip>
                            <TooltipTrigger>
                              <Asterisk className="h-3 w-3 text-yellow-500" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>{t('charges.tooltip.originalPoints', { value: totals.original.points })}</p>
                              <p>{t('charges.tooltip.modifiedPoints', { value: Math.round(totals.modified.points) })}</p>
                            </TooltipContent>
                          </Tooltip>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{totalFineDisplay}</TableCell>
                    <TableCell>{formatDaysOrNone(impoundCapped)}</TableCell>
                    <TableCell>{formatDaysOrNone(suspensionCapped)}</TableCell>
                    <TableCell>{renderOverallBailStatus()}</TableCell>
                    <TableCell>{highestBailDisplay}</TableCell>
                  </TableRow>
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        )}

        {showCopyables && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <CopyableCard
              label={t('copyables.minMinutes')}
              value={Math.round(minTimeCapped)}
              tooltipContent={hasAnyModifiers ? t('copyables.originalValue', { value: Math.round(totals.original.minTime) }) : undefined}
            />
            <CopyableCard
              label={t('copyables.maxMinutes')}
              value={Math.round(maxTimeCapped)}
              tooltipContent={hasAnyModifiers ? t('copyables.originalValue', { value: Math.round(totals.original.maxTime) }) : undefined}
            />
            <CopyableCard label={t('copyables.totalImpound')} value={Math.round(impoundCapped)} />
            <CopyableCard label={t('copyables.totalSuspension')} value={Math.round(suspensionCapped)} />
            <CopyableCard label={t('copyables.bailCost')} value={totals.highestBail} />
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}
