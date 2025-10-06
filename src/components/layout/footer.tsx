
import { promises as fs } from 'fs';
import path from 'path';
import Image from 'next/image';
import Link from 'next/link';
import { Separator } from '../ui/separator';
import { getDictionary } from '@/i18n/get-dictionary';
import { createTranslator } from '@/i18n/translator';
import type { Locale } from '@/i18n/config';

export async function Footer({ locale }: { locale: Locale }) {
    const file = await fs.readFile(path.join(process.cwd(), 'data/config.json'), 'utf8');
    const config = JSON.parse(file);
    const dictionary = await getDictionary(locale);
    const t = createTranslator(dictionary);

    return (
      <footer className="relative z-10 py-4 mt-auto">
        <div className="container mx-auto flex flex-col items-center justify-center gap-2">
            <Image
                src={config.SITE_LOGO}
                width={60}
                height={30}
                alt="MDC Panel Logo"
            />
          <p className="text-center text-sm text-muted-foreground">
            &copy; 2025-{new Date().getFullYear() + 1} {config.SITE_NAME}. {t('footer.rights')} {t('footer.versionLabel')}: <Link href={`/${locale}/changelog`} className="hover:text-primary transition-colors">{config.SITE_VERSION}</Link>
          </p>
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <Link href={`/${locale}/about`} className="hover:text-primary transition-colors">{t('footer.about')}</Link>
              <Separator orientation="vertical" className="h-4" />
              <Link href={`/${locale}/credits`} className="hover:text-primary transition-colors">{t('footer.credits')}</Link>
          </div>
        </div>
      </footer>
    );
}
