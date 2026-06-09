import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

// ============================================
// CinemaFlow Badge 组件
// ============================================

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors',
  {
    variants: {
      variant: {
        default:
          'bg-accent/15 text-accent border-accent/20',
        secondary:
          'bg-surface-6 text-text-secondary border-transparent',
        destructive:
          'bg-red-500/15 text-red-400 border-red-500/20',
        outline:
          'text-text-secondary border-border-strong',
        success:
          'bg-green-500/15 text-green-400 border-green-500/20',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Badge, badgeVariants }
