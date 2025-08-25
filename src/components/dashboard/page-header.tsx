type PageHeaderProps = {
  title: string;
  description?: string;
  actions?: React.ReactNode;
};

export function PageHeader({ title, description, actions }: PageHeaderProps) {
  return (
    <header className="mb-6">
       <div className="flex items-center justify-between">
            <div>
                <h1 className="text-3xl font-bold tracking-tight text-foreground font-headline">{title}</h1>
                {description && <p className="mt-2 text-lg text-muted-foreground">{description}</p>}
            </div>
            {actions && <div className="flex-shrink-0">{actions}</div>}
       </div>
    </header>
  );
}
