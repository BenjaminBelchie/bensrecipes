---
name: ui-primitives
description: "Evaluate any UI feature or component request and map it to existing primitive components in src/components/ui before writing any markup. Use when building UI, writing React components, creating pages, adding forms, displaying data, building navigation, showing modals/dialogs, or writing any JSX. Invoke before writing custom HTML structure."
user-invocable: false
---

# UI Primitives — Component Reuse Checker

Before writing any JSX or custom markup, evaluate the requested UI against the available primitive components below. Always prefer composing from primitives over writing raw HTML elements — this keeps design tokens, styles, and interactions consistent across the app.

## Evaluation Process

1. **Identify UI patterns** in the feature request (buttons, forms, lists, overlays, navigation, etc.)
2. **Map each pattern** to the closest primitive(s) from the catalog below
3. **Import from** `@/components/ui/<file>` using the listed named exports
4. **Compose** primitives together; only write raw elements for layout glue (divs, spans for spacing/flex) that has no primitive equivalent

---

## Component Catalog

### Buttons & Actions

| Need | Component | Import |
|------|-----------|--------|
| Any clickable button | `Button` | `@/components/ui/button` |
| Group of related buttons | `ButtonGroup`, `ButtonGroupItem` | `@/components/ui/button-group` |
| On/off toggle button | `Toggle` | `@/components/ui/toggle` |
| Mutually exclusive option set (2–7 choices) | `ToggleGroup`, `ToggleGroupItem` | `@/components/ui/toggle-group` |

### Forms & Inputs

| Need | Component | Import |
|------|-----------|--------|
| Text input | `Input` | `@/components/ui/input` |
| Multi-line text | `Textarea` | `@/components/ui/textarea` |
| Checkbox | `Checkbox` | `@/components/ui/checkbox` |
| Radio buttons | `RadioGroup`, `RadioGroupItem` | `@/components/ui/radio-group` |
| Dropdown select | `Select`, `SelectTrigger`, `SelectContent`, `SelectItem`, `SelectGroup`, `SelectValue` | `@/components/ui/select` |
| Native HTML select | `NativeSelect`, `NativeSelectOption`, `NativeSelectOptGroup` | `@/components/ui/native-select` |
| Searchable dropdown / autocomplete | `Combobox` and friends | `@/components/ui/combobox` |
| Toggle switch | `Switch` | `@/components/ui/switch` |
| Range / numeric slider | `Slider` | `@/components/ui/slider` |
| Date picker | `Calendar`, `CalendarDayButton` | `@/components/ui/calendar` |
| OTP / PIN code input | `InputOTP`, `InputOTPGroup`, `InputOTPSlot`, `InputOTPSeparator` | `@/components/ui/input-otp` |
| Input with icon/button prefix or suffix | `InputGroup`, `InputGroupInput`, `InputGroupTextarea`, `InputGroupAddon` | `@/components/ui/input-group` |
| Form field with label + validation | `Field`, `FieldGroup`, `FieldSet`, `FieldLegend` | `@/components/ui/field` |
| Field label | `Label` | `@/components/ui/label` |
| Keyboard shortcut display | `Kbd`, `KbdGroup` | `@/components/ui/kbd` |

### Layout & Structure

| Need | Component | Import |
|------|-----------|--------|
| Content card / panel | `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`, `CardFooter` | `@/components/ui/card` |
| Horizontal or vertical divider | `Separator` | `@/components/ui/separator` |
| Scrollable overflow container | `ScrollArea`, `ScrollBar` | `@/components/ui/scroll-area` |
| Resizable split panes | `ResizablePanelGroup`, `ResizablePanel`, `ResizableHandle` | `@/components/ui/resizable` |
| Fixed aspect ratio wrapper | `AspectRatio` | `@/components/ui/aspect-ratio` |
| App sidebar / nav rail | `Sidebar` and related exports | `@/components/ui/sidebar` |

### Navigation

| Need | Component | Import |
|------|-----------|--------|
| Breadcrumb trail | `Breadcrumb`, `BreadcrumbList`, `BreadcrumbItem`, `BreadcrumbLink`, `BreadcrumbPage`, `BreadcrumbSeparator`, `BreadcrumbEllipsis` | `@/components/ui/breadcrumb` |
| Page tabs | `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent` | `@/components/ui/tabs` |
| Top-level navigation bar | `NavigationMenu`, `NavigationMenuList`, `NavigationMenuItem`, `NavigationMenuTrigger`, `NavigationMenuContent`, `NavigationMenuLink` | `@/components/ui/navigation-menu` |
| Paginator (prev/next/page numbers) | `Pagination`, `PaginationContent`, `PaginationItem`, `PaginationLink`, `PaginationPrevious`, `PaginationNext`, `PaginationEllipsis` | `@/components/ui/pagination` |

### Overlays & Floating UI

| Need | Component | Import |
|------|-----------|--------|
| Modal dialog (important action) | `Dialog`, `DialogTrigger`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogDescription`, `DialogFooter`, `DialogClose` | `@/components/ui/dialog` |
| Destructive confirmation dialog | `AlertDialog`, `AlertDialogTrigger`, `AlertDialogContent`, `AlertDialogHeader`, `AlertDialogTitle`, `AlertDialogDescription`, `AlertDialogFooter`, `AlertDialogAction`, `AlertDialogCancel` | `@/components/ui/alert-dialog` |
| Slide-in panel from edge | `Sheet`, `SheetTrigger`, `SheetContent`, `SheetHeader`, `SheetTitle`, `SheetDescription`, `SheetFooter`, `SheetClose` | `@/components/ui/sheet` |
| Bottom sheet / modal drawer | `Drawer`, `DrawerTrigger`, `DrawerContent`, `DrawerHeader`, `DrawerTitle`, `DrawerDescription`, `DrawerFooter`, `DrawerClose` | `@/components/ui/drawer` |
| Anchored floating panel | `Popover`, `PopoverTrigger`, `PopoverContent` | `@/components/ui/popover` |
| Hover preview card | `HoverCard`, `HoverCardTrigger`, `HoverCardContent` | `@/components/ui/hover-card` |
| Tooltip on hover | `Tooltip`, `TooltipTrigger`, `TooltipContent`, `TooltipProvider` | `@/components/ui/tooltip` |

### Menus & Commands

| Need | Component | Import |
|------|-----------|--------|
| Dropdown menu from a trigger | `DropdownMenu`, `DropdownMenuTrigger`, `DropdownMenuContent`, `DropdownMenuItem`, `DropdownMenuGroup`, `DropdownMenuSeparator`, `DropdownMenuLabel`, `DropdownMenuCheckboxItem`, `DropdownMenuRadioGroup`, `DropdownMenuRadioItem`, `DropdownMenuSub`, `DropdownMenuSubTrigger`, `DropdownMenuSubContent`, `DropdownMenuShortcut` | `@/components/ui/dropdown-menu` |
| Right-click context menu | `ContextMenu` and friends | `@/components/ui/context-menu` |
| Application menu bar | `Menubar` and friends | `@/components/ui/menubar` |
| Search / command palette | `Command`, `CommandInput`, `CommandList`, `CommandEmpty`, `CommandGroup`, `CommandItem`, `CommandSeparator`, `CommandShortcut` | `@/components/ui/command` |

### Data Display

| Need | Component | Import |
|------|-----------|--------|
| Data table | `Table`, `TableHeader`, `TableBody`, `TableRow`, `TableHead`, `TableCell`, `TableCaption`, `TableFooter` | `@/components/ui/table` |
| Status / category label | `Badge` | `@/components/ui/badge` |
| User avatar / image fallback | `Avatar`, `AvatarImage`, `AvatarFallback` | `@/components/ui/avatar` |
| Charts / graphs | `ChartContainer`, `ChartTooltip`, `ChartLegend` + recharts | `@/components/ui/chart` |
| Progress bar | `Progress` | `@/components/ui/progress` |
| Loading placeholder | `Skeleton` | `@/components/ui/skeleton` |
| Loading spinner | `Spinner` | `@/components/ui/spinner` |
| Image slideshow | `Carousel`, `CarouselContent`, `CarouselItem`, `CarouselPrevious`, `CarouselNext` | `@/components/ui/carousel` |
| List item with icon/label/action | `Item`, `ItemIndicator`, `ItemIcon`, `ItemContent`, `ItemLabel`, `ItemCaption`, `ItemActions`, `ItemAction` | `@/components/ui/item` |
| Empty / zero state | `Empty`, `EmptyImage`, `EmptyTitle`, `EmptyDescription`, `EmptyActions` | `@/components/ui/empty` |

### Disclosure & Accordion

| Need | Component | Import |
|------|-----------|--------|
| Expandable FAQ / sections | `Accordion`, `AccordionItem`, `AccordionTrigger`, `AccordionContent` | `@/components/ui/accordian` |
| Single expand/collapse section | `Collapsible`, `CollapsibleTrigger`, `CollapsibleContent` | `@/components/ui/collapsible` |

### Feedback & Notifications

| Need | Component | Import |
|------|-----------|--------|
| Inline alert / status banner | `Alert`, `AlertTitle`, `AlertDescription`, `AlertAction` | `@/components/ui/alert` |
| Toast notifications | `Toaster` (render once in layout); call `toast()` from `sonner` | `@/components/ui/sonner` |

---

## Composition Rules

- **Cards for content groupings.** Any block of related content (recipe info, form section, stats) → `Card` with full sub-component composition (`CardHeader`, `CardContent`, etc.).
- **`Field` + `FieldGroup` for forms.** Never use bare `div` wrappers with manual spacing for form layout.
- **`InputGroup` for inputs with affixed controls.** Icon prefix, button suffix, or text prefix → `InputGroup` + `InputGroupAddon`.
- **`ToggleGroup` for option sets.** 2–7 mutually exclusive options → `ToggleGroup`, not a row of buttons with manual `active` state.
- **`Dialog` vs `Sheet` vs `Drawer`.** Confirmation / focused action → `Dialog`. Side panel / detail view → `Sheet`. Mobile-first bottom sheet → `Drawer`.
- **`Tooltip` always needs `TooltipProvider`.** Wrap the page or layout with `TooltipProvider` once.
- **`Avatar` always needs `AvatarFallback`.** Required for when the image fails to load.
- **`Empty` for zero states.** Any "no results" or empty list state → `Empty` component, not custom markup.
- **`Skeleton` for loading states.** Replacing a component while data loads → match the shape with `Skeleton` blocks.

---

## Import Path Convention

All primitives live in `src/components/ui/`. Always import using the `@/` alias:

```tsx
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
```
