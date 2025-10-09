
'use client';

import * as React from 'react';
import { useSearchParams } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { PageHeader } from '@/components/dashboard/page-header';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Download } from 'lucide-react';
import html2canvas from 'html2canvas';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent } from '@/components/ui/card';

type TextField = {
  name: string;
  label: string;
  type?: 'textfield' | 'textarea';
  placeholder?: string;
  x: number;
  y: number;
  width: number;
  height: number;
  fontSize: number;
  color: string;
  fontWeight?: 'normal' | 'bold';
  textAlign?: 'left' | 'center' | 'right' | 'justify';
};

type FormStampConfig = {
  id: string;
  title: string;
  description: string;
  image: string;
  font?: string;
  fields: TextField[];
};

function FormStampFormComponent({ config }: { config: FormStampConfig }) {
  const { register, watch } = useForm();
  const formData = watch();
  const { toast } = useToast();
  const previewRef = React.useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = React.useState(false);

  const handleDownload = () => {
    if (!previewRef.current) return;
    setIsDownloading(true);

    html2canvas(previewRef.current, {
        backgroundColor: null, // Transparent background
        useCORS: true,
    }).then(canvas => {
        const link = document.createElement('a');
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        link.download = `${config.id}-${timestamp}.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
        toast({ title: "Image downloaded." });
    }).catch(err => {
        console.error("Failed to download image:", err);
        toast({ title: "Download failed.", variant: "destructive" });
    }).finally(() => {
        setIsDownloading(false);
    });
  };

  return (
    <div className="grid md:grid-cols-2 gap-8">
      <div className="space-y-4">
        {config.fields.map((field) => (
          <div key={field.name}>
            <Label htmlFor={field.name}>{field.label}</Label>
            {field.type === 'textarea' ? (
              <Textarea
                id={field.name}
                {...register(field.name)}
                placeholder={field.placeholder}
                className="mt-1"
                rows={4}
              />
            ) : (
              <Input
                id={field.name}
                {...register(field.name)}
                placeholder={field.placeholder}
                className="mt-1"
              />
            )}
          </div>
        ))}
        <Button onClick={handleDownload} disabled={isDownloading}>
          <Download className="mr-2 h-4 w-4" />
          {isDownloading ? 'Downloading...' : 'Download Stamp'}
        </Button>
      </div>

      <Card>
        <CardContent className="p-4">
            <div
                ref={previewRef}
                className="relative"
                style={{
                    fontFamily: config.font || 'sans-serif',
                    width: '100%',
                    aspectRatio: '1',
                }}
            >
                <img src={`/data/form-stamps/img/${config.image}`} alt={config.title} className="w-full h-full object-contain" />
                {config.fields.map((field) => (
                    <div
                        key={field.name}
                        style={{
                            position: 'absolute',
                            left: `${field.x}%`,
                            top: `${field.y}%`,
                            width: `${field.width}%`,
                            height: `${field.height}%`,
                            fontSize: `${field.fontSize}px`,
                            lineHeight: `${field.fontSize * 1.2}px`,
                            color: field.color,
                            fontWeight: field.fontWeight || 'normal',
                            textAlign: field.textAlign || 'left',
                            display: 'flex',
                            alignItems: 'flex-start',
                            overflowWrap: 'break-word',
                            wordWrap: 'break-word',
                            wordBreak: 'break-word',
                        }}
                    >
                        {formData[field.name] || field.placeholder}
                    </div>
                ))}
            </div>
        </CardContent>
      </Card>
    </div>
  );
}

function FormStampPageContent() {
  const searchParams = useSearchParams();
  const id = searchParams.get('id');
  const type = searchParams.get('type');
  const groupId = searchParams.get('group_id');
  const [config, setConfig] = React.useState<FormStampConfig | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (!id || !type) {
      setLoading(false);
      return;
    }
    
    let url = `/api/paperwork-generators/${id}?type=${type}&id=${id}`;
    if (groupId) {
        url += `&group_id=${groupId}`;
    }

    fetch(url.replace('paperwork-generators', 'form-stamps'))
      .then((res) => res.json())
      .then((data) => {
        setConfig(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id, type, groupId]);
  
  if (loading) {
    return <Skeleton className="h-96 w-full" />;
  }

  if (!config) {
    return <div>Form Stamp not found.</div>;
  }

  return (
    <div className="container mx-auto p-4 md:p-6 lg:p-8 space-y-8">
      <PageHeader title={config.title} description={config.description} />
      <FormStampFormComponent config={config} />
    </div>
  );
}


export default function FormStampPage() {
    return (
        <React.Suspense fallback={<Skeleton className="h-screen w-full" />}>
            <FormStampPageContent />
        </React.Suspense>
    )
}
