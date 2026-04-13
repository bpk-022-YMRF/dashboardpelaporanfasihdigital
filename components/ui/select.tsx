"use client"

import * as React from "react"
import { ChevronDown, Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface SelectProps {
  value?: string
  onValueChange?: (value: string) => void
  children: React.ReactNode
}

const SelectContext = React.createContext<{
  value: string
  onValueChange: (value: string) => void
  open: boolean
  setOpen: (open: boolean) => void
}>({
  value: "",
  onValueChange: () => {},
  open: false,
  setOpen: () => {},
})

function Select({ value = "", onValueChange = () => {}, children }: SelectProps) {
  const [open, setOpen] = React.useState(false)
  
  return (
    <SelectContext.Provider value={{ value, onValueChange, open, setOpen }}>
      <div className="relative w-full">
        {children}
      </div>
    </SelectContext.Provider>
  )
}

function SelectTrigger({ className, children, ...props }: React.ComponentProps<"button">) {
  const { open, setOpen } = React.useContext(SelectContext)
  
  return (
    <button
      type="button"
      onClick={() => setOpen(!open)}
      className={cn(
        "flex h-10 w-full items-center justify-between rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    >
      {children}
      <ChevronDown className={cn("h-4 w-4 opacity-50 transition-transform", open && "rotate-180")} />
    </button>
  )
}

function SelectValue({ placeholder }: { placeholder?: string }) {
  const { value } = React.useContext(SelectContext)
  return <span>{value || placeholder}</span>
}

function SelectContent({ className, children }: { className?: string; children: React.ReactNode }) {
  const { open, setOpen } = React.useContext(SelectContext)
  
  React.useEffect(() => {
    if (!open) return
    const handleClickOutside = (e: MouseEvent) => {
      if (!(e.target as HTMLElement).closest(".relative")) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [open, setOpen])

  if (!open) return null

  return (
    <div
      className={cn(
        "absolute top-full left-0 z-[110] mt-1 max-h-60 w-full overflow-auto rounded-md border border-slate-200 bg-white p-1 text-slate-900 shadow-xl ring-1 ring-black/5",
        className
      )}
    >
      {children}
    </div>
  )
}

function SelectItem({ value: itemValue, children, className, ...props }: { value: string; children: React.ReactNode; className?: string } & React.ComponentProps<"div">) {
  const { value, onValueChange, setOpen } = React.useContext(SelectContext)
  const isSelected = value === itemValue

  return (
    <div
      onClick={() => {
        onValueChange(itemValue)
        setOpen(false)
      }}
      className={cn(
        "relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-slate-100 focus:bg-slate-100",
        isSelected && "bg-slate-50 font-medium text-blue-600",
        className
      )}
      {...props}
    >
      <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
        {isSelected && <Check className="h-4 w-4" />}
      </span>
      {children}
    </div>
  )
}

export {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
}
