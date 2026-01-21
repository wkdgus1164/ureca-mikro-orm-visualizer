"use client"

import * as CollapsiblePrimitive from "@radix-ui/react-collapsible"

/**
 * Wraps the Collapsible root primitive and renders it with a `data-slot="collapsible"` attribute.
 *
 * @param props - Props forwarded to the underlying Collapsible root element
 * @returns The rendered Collapsible root element
 */
function Collapsible({
  ...props
}: React.ComponentProps<typeof CollapsiblePrimitive.Root>) {
  return <CollapsiblePrimitive.Root data-slot="collapsible" {...props} />
}

/**
 * Render a collapsible trigger element that forwards all received props and marks the element with a slot attribute.
 *
 * @param props - Props forwarded to the underlying CollapsibleTrigger element
 * @returns The collapsible trigger element with `data-slot="collapsible-trigger"`
 */
function CollapsibleTrigger({
  ...props
}: React.ComponentProps<typeof CollapsiblePrimitive.CollapsibleTrigger>) {
  return (
    <CollapsiblePrimitive.CollapsibleTrigger
      data-slot="collapsible-trigger"
      {...props}
    />
  )
}

/**
 * Renders Radix UI's CollapsibleContent element with a data-slot attribute and forwards all received props.
 *
 * @param props - Props forwarded to `CollapsiblePrimitive.CollapsibleContent`
 * @returns A `CollapsiblePrimitive.CollapsibleContent` element rendered with `data-slot="collapsible-content"` and the provided props
 */
function CollapsibleContent({
  ...props
}: React.ComponentProps<typeof CollapsiblePrimitive.CollapsibleContent>) {
  return (
    <CollapsiblePrimitive.CollapsibleContent
      data-slot="collapsible-content"
      {...props}
    />
  )
}

export { Collapsible, CollapsibleTrigger, CollapsibleContent }