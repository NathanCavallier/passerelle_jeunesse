import { Leaf } from 'lucide-react';
import { cn } from '@/lib/utils';

type LogoProps = {
  className?: string;
  isFooter?: boolean;
};

export default function Logo({ className, isFooter = false }: LogoProps) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Leaf className={cn('h-6 w-6', isFooter ? 'text-background' : 'text-primary')} />
      <span className={cn('font-headline text-xl font-bold', isFooter ? 'text-background' : 'text-foreground')}>
        Passerelle Jeunesse
      </span>
    </div>
  );
}
