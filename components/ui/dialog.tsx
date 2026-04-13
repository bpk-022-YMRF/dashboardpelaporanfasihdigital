"use client"

import * as React from "react"
import { motion, AnimatePresence } from "motion/react"
import { XIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface DialogProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  children: React.ReactNode
}

const DialogContext = React.createContext<{
  open: boolean
  setOpen: (open: boolean) => void
}>({
  open: false,
  setOpen: () => {},
})

function Dialog({ open: controlledOpen, onOpenChange, children }: DialogProps) {
  const [internalOpen, setInternalOpen] = React.useState(false)
  const open = controlledOpen ?? internalOpen
  const setOpen = onOpenChange ?? setInternalOpen

  return (
    <DialogContext.Provider value={{ open, setOpen }}>
      {children}
    </DialogContext.Provider>
  )
}

function DialogTrigger({ children, asChild, ...props }: any) {
  const { setOpen } = React.useContext(DialogContext)
  return (
    <div onClick={() => setOpen(true)} className="inline-block">
      {children}
    </div>
  )
}

function DialogPortal({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}

function DialogOverlay({ className, onClick }: { className?: string; onClick?: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClick}
      className={cn(
        "fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm",
        className
      )}
    />
  )
}

function DialogContent({
  className,
  children,
  showCloseButton = true,
  ...props
}: React.ComponentProps<"div"> & {
  showCloseButton?: boolean
}) {
  const { open, setOpen } = React.useContext(DialogContext)

  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }
    return () => {
      document.body.style.overflow = "unset"
    }
  }, [open])

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <DialogOverlay onClick={() => setOpen(false)} />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className={cn(
              "relative z-[101] w-full max-w-lg overflow-hidden rounded-xl bg-white p-6 text-slate-900 shadow-2xl ring-1 ring-slate-200 outline-none",
              className
            )}
            {...props}
          >
            {children}
            {showCloseButton && (
              <Button
                variant="ghost"
                className="absolute top-4 right-4 text-slate-500 hover:text-slate-900"
                size="icon-sm"
                onClick={() => setOpen(false)}
              >
                <XIcon className="h-4 w-4" />
                <span className="sr-only">Close</span>
              </Button>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}

function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("flex flex-col gap-2 mb-4", className)}
      {...props}
    />
  )
}

function DialogFooter({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

function DialogTitle({ className, ...props }: React.ComponentProps<"h3">) {
  return (
    <h3
      className={cn(
        "text-lg font-bold leading-none tracking-tight text-slate-900",
        className
      )}
      {...props}
    />
  )
}

function DialogDescription({
  className,
  ...props
}: React.ComponentProps<"p">) {
  return (
    <p
      className={cn(
        "text-sm text-slate-500",
        className
      )}
      {...props}
    />
  )
}

function DialogClose({ children, ...props }: any) {
  const { setOpen } = React.useContext(DialogContext)
  return (
    <div onClick={() => setOpen(false)} className="inline-block">
      {children}
    </div>
  )
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogPortal,
}
