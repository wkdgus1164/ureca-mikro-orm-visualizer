"use client"

import * as React from "react"
import * as DialogPrimitive from "@radix-ui/react-dialog"
import { XIcon } from "lucide-react"

import { cn } from "@/lib/utils"

/**
 * Renders the dialog root element with a data-slot of "dialog" and forwards all received props.
 *
 * @returns A React element representing the dialog root.
 */
function Dialog({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />
}

/**
 * Renders a dialog trigger element.
 *
 * @returns The rendered trigger element with `data-slot="dialog-trigger"` and any provided props forwarded to it.
 */
function DialogTrigger({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />
}

/**
 * Render a dialog portal element with a data-slot of "dialog-portal", forwarding all provided props.
 *
 * @returns The dialog portal React element.
 */
function DialogPortal({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Portal>) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />
}

/**
 * Renders a dialog close control with data-slot="dialog-close".
 *
 * @returns A DialogPrimitive.Close element with the `data-slot="dialog-close"` attribute and any passed props.
 */
function DialogClose({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Close>) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />
}

/**
 * Renders a semi-transparent fullscreen overlay for the dialog with data-slot="dialog-overlay".
 *
 * @param className - Additional CSS classes to merge with the default overlay styles.
 * @returns The dialog overlay element.
 */
function DialogOverlay({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
  return (
    <DialogPrimitive.Overlay
      data-slot="dialog-overlay"
      className={cn(
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50",
        className
      )}
      {...props}
    />
  )
}

/**
 * Renders the dialog content wrapped in a portal with an overlay and an optional close button.
 *
 * The component applies composed styling and forwards all other props to Radix's DialogPrimitive.Content.
 *
 * @param showCloseButton - Whether to render a close button in the top-right corner; defaults to `true`.
 * @returns A dialog content element wrapped in a portal and overlay.
 */
function DialogContent({
  className,
  children,
  showCloseButton = true,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content> & {
  showCloseButton?: boolean
}) {
  return (
    <DialogPortal data-slot="dialog-portal">
      <DialogOverlay />
      <DialogPrimitive.Content
        data-slot="dialog-content"
        className={cn(
          "bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border p-6 shadow-lg duration-200 outline-none sm:max-w-lg",
          className
        )}
        {...props}
      >
        {children}
        {showCloseButton && (
          <DialogPrimitive.Close
            data-slot="dialog-close"
            className="ring-offset-background focus:ring-ring data-[state=open]:bg-accent data-[state=open]:text-muted-foreground absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"
          >
            <XIcon />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DialogPortal>
  )
}

/**
 * Renders the header container for a dialog with consistent layout and slot attributes.
 *
 * The element applies vertical layout, spacing, and responsive text alignment, merges any
 * provided `className`, and forwards all other props to the underlying `div`.
 *
 * @returns A `div` element used as the dialog header with `data-slot="dialog-header"` and composed classes.
 */
function DialogHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-header"
      className={cn("flex flex-col gap-2 text-center sm:text-left", className)}
      {...props}
    />
  )
}

/**
 * Renders the footer container for a dialog's action controls.
 *
 * Applies a responsive layout (stacked on small screens, right-aligned on larger screens),
 * merges any provided `className`, and includes `data-slot="dialog-footer"` for styling hooks.
 *
 * @returns A `div` element that wraps dialog footer content with responsive layout and the `dialog-footer` data-slot.
 */
function DialogFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn(
        "flex flex-col-reverse gap-2 sm:flex-row sm:justify-end",
        className
      )}
      {...props}
    />
  )
}

/**
 * Renders a styled dialog title element.
 *
 * Applies default typographic classes and forwards all props to Radix UI's
 * DialogPrimitive.Title. Adds a `data-slot="dialog-title"` attribute for
 * styling and test hooks.
 *
 * @param className - Additional CSS class names appended to the default title classes
 * @returns The rendered dialog title element
 */
function DialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn("text-lg leading-none font-semibold", className)}
      {...props}
    />
  )
}

/**
 * Renders a dialog description element with muted foreground text styling and a `data-slot="dialog-description"` attribute.
 *
 * @param props - Props forwarded to the underlying DialogPrimitive.Description; `className` is merged with the component's default classes.
 * @returns The composed dialog description element with applied classes and data-slot attribute.
 */
function DialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  )
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
}