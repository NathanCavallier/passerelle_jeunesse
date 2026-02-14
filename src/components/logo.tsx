import Image from 'next/image';
import { cn } from '@/lib/utils';

type LogoProps = {
  className?: string;
  isFooter?: boolean;
  showText?: boolean;
  size?: 'sm' | 'md' | 'lg';
};

const sizes = {
  sm: { width: 'w-8', height: 'h-8', text: 'text-base' },
  md: { width: 'w-10', height: 'h-10', text: 'text-xl' },
  lg: { width: 'w-14', height: 'h-14', text: 'text-2xl' },
};

export default function Logo({ 
  className, 
  isFooter = false, 
  showText = true,
  size = 'md' 
}: LogoProps) {
  const sizeConfig = sizes[size];
  
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <div className={cn('relative', sizeConfig.width, sizeConfig.height)}>
        <Image
          src="/images/logo.png"
          alt="Passerelle Jeunesse"
          fill
          className="object-contain"
          priority
        />
      </div>
      {showText && (
        <span className={cn(
          'font-headline font-bold',
          sizeConfig.text,
          isFooter ? 'text-background' : 'text-foreground'
        )}>
          Passerelle Jeunesse
        </span>
      )}
    </div>
  );
}
