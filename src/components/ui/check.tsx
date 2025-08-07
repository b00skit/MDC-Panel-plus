import * as React from "react"
import { Check } from "lucide-react"

import { cn } from "@/lib/utils"

const CheckIcon = React.forwardRef<
    React.ElementRef<typeof Check>,
    React.ComponentPropsWithoutRef<typeof Check>
>(({ className, ...props }, ref) => (
    <Check
        ref={ref}
        className={cn("h-4 w-4", className)}
        {...props}
    />
))
CheckIcon.displayName = "CheckIcon"

export { CheckIcon as Check }
