"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "convex/react";
import { SlidersHorizontal, X } from "lucide-react";
import RecipeGrid from "~/components/RecipeGrid";
import { api } from "~/convex/_generated/api";
import { cn } from "~/lib/utils";
import { useIsMobile } from "~/hooks/use-mobile";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "~/components/ui/breadcrumb";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { Separator } from "~/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "~/components/ui/sheet";
import { ToggleGroup, ToggleGroupItem } from "~/components/ui/toggle-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";

const DIFFICULTY_OPTIONS = [
  { label: "Easy", value: "easy" },
  { label: "Medium", value: "medium" },
  { label: "Hard", value: "hard" },
] as const;

const TIME_RANGES = [
  { label: "< 15 min", value: "lt15" },
  { label: "15–30 min", value: "15to30" },
  { label: "30–60 min", value: "30to60" },
  { label: "> 1 hr", value: "gt60" },
] as const;

interface FilterPanelProps {
  availableTags: string[];
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
  availableCuisines: string[];
  difficulty: string;
  onDifficultyChange: (v: string) => void;
  timeRange: string;
  onTimeRangeChange: (v: string) => void;
  cuisine: string;
  onCuisineChange: (v: string) => void;
  activeFilters: number;
  onClearAll: () => void;
}

function FilterPanel({
  availableTags,
  selectedTags,
  onTagsChange,
  availableCuisines,
  difficulty,
  onDifficultyChange,
  timeRange,
  onTimeRangeChange,
  cuisine,
  onCuisineChange,
  activeFilters,
  onClearAll,
}: FilterPanelProps) {
  function toggleTag(tag: string) {
    if (selectedTags.includes(tag)) {
      onTagsChange(selectedTags.filter((t) => t !== tag));
    } else {
      onTagsChange([...selectedTags, tag]);
    }
  }

  return (
    <div className="flex flex-col gap-5">
      {activeFilters > 0 && (
        <button
          onClick={onClearAll}
          className="text-muted-foreground hover:text-foreground self-start text-xs transition-colors"
        >
          Clear all filters
        </button>
      )}

      {/* Tags */}
      <div>
        <p className="text-foreground mb-2.5 text-sm font-semibold">Tags</p>
        {availableTags.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {availableTags.map((tag) => {
              const active = selectedTags.includes(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors",
                    active
                      ? "bg-primary border-primary text-primary-foreground"
                      : "border-border text-muted-foreground hover:border-foreground/40 hover:text-foreground bg-transparent",
                  )}
                >
                  {tag}
                  {active && <X className="size-2.5" />}
                </button>
              );
            })}
          </div>
        ) : (
          <p className="text-muted-foreground text-sm italic">
            No tags added yet
          </p>
        )}
      </div>

      <Separator />

      {/* Difficulty */}
      <div>
        <p className="text-foreground mb-2.5 text-sm font-semibold">
          Difficulty
        </p>
        <ToggleGroup
          type="single"
          variant="outline"
          value={difficulty}
          onValueChange={onDifficultyChange}
          className="w-full"
        >
          {DIFFICULTY_OPTIONS.map((opt) => (
            <ToggleGroupItem
              key={opt.value}
              value={opt.value}
              className="flex-1"
            >
              {opt.label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>

      <Separator />

      {/* Total Time */}
      <div>
        <p className="text-foreground mb-2.5 text-sm font-semibold">
          Total Time
        </p>
        <ToggleGroup
          type="single"
          variant="outline"
          value={timeRange}
          onValueChange={onTimeRangeChange}
          className="w-full flex-wrap"
        >
          {TIME_RANGES.map((opt) => (
            <ToggleGroupItem
              key={opt.value}
              value={opt.value}
              className="flex-1 basis-[calc(50%-4px)]"
            >
              {opt.label}
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      </div>

      <Separator />

      {/* Cuisine */}
      <div>
        <p className="text-foreground mb-2.5 text-sm font-semibold">Cuisine</p>
        {availableCuisines.length > 0 ? (
          <Select
            value={cuisine || "all"}
            onValueChange={(v) => onCuisineChange(v === "all" ? "" : v)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="All cuisines" />
            </SelectTrigger>
            <SelectContent className="p-1">
              <SelectItem value="all">All cuisines</SelectItem>
              {availableCuisines.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        ) : (
          <p className="text-muted-foreground text-sm italic">
            No cuisines added yet
          </p>
        )}
      </div>
    </div>
  );
}

export default function RecipesPage() {
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [difficulty, setDifficulty] = useState<string>("");
  const [timeRange, setTimeRange] = useState<string>("");
  const [cuisine, setCuisine] = useState<string>("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [sheetOpen, setSheetOpen] = useState(false);

  const availableTags = useQuery(api.tags.list) ?? [];
  const availableCuisines = useQuery(api.recipes.listCuisines) ?? [];
  const isMobile = useIsMobile();

  const activeFilters =
    selectedTags.length +
    (difficulty ? 1 : 0) +
    (timeRange ? 1 : 0) +
    (cuisine ? 1 : 0);

  function clearAllFilters() {
    setSelectedTags([]);
    setDifficulty("");
    setTimeRange("");
    setCuisine("");
  }

  function handleFilterToggle() {
    if (isMobile) {
      setSheetOpen(true);
    } else {
      setSidebarOpen((v) => !v);
    }
  }

  const filterPanelProps: FilterPanelProps = {
    availableTags,
    selectedTags,
    onTagsChange: setSelectedTags,
    availableCuisines,
    difficulty,
    onDifficultyChange: setDifficulty,
    timeRange,
    onTimeRangeChange: setTimeRange,
    cuisine,
    onCuisineChange: setCuisine,
    activeFilters,
    onClearAll: clearAllFilters,
  };

  return (
    <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
      <div className="mx-auto max-w-6xl px-6 py-6 md:py-12">
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href="/">Home</Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage>Recipes</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        {/* Title row with filter toggle */}
        <div className="mb-8 flex items-center justify-between">
          <h1 className="font-heading text-foreground text-3xl font-bold">
            All Recipes
          </h1>
          <Button
            variant="outline"
            size="sm"
            onClick={handleFilterToggle}
            aria-label="Toggle filters"
            className="flex items-center gap-1.5"
          >
            <SlidersHorizontal className="size-4" />
            <span className="hidden sm:inline">Filters</span>
            {activeFilters > 0 && (
              <Badge className="flex size-5 items-center justify-center rounded-full p-0 text-[10px] leading-none">
                {activeFilters}
              </Badge>
            )}
          </Button>
        </div>

        {/* Desktop: collapsible sidebar + recipe grid */}
        <div className="hidden items-start gap-8 md:flex">
          <div
            className={cn(
              "shrink-0 overflow-hidden transition-[width,opacity] duration-300 ease-in-out",
              sidebarOpen ? "w-60 opacity-100" : "w-0 opacity-0",
            )}
          >
            <div className="border-border w-60 border-r pr-8 pb-6">
              <FilterPanel {...filterPanelProps} />
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <RecipeGrid
              selectedTags={selectedTags}
              difficulty={difficulty}
              timeRange={timeRange}
              cuisine={cuisine}
            />
          </div>
        </div>

        {/* Mobile: grid only — filters live in the Sheet */}
        <div className="md:hidden">
          <RecipeGrid
            selectedTags={selectedTags}
            difficulty={difficulty}
            timeRange={timeRange}
            cuisine={cuisine}
          />
        </div>
      </div>

      {/* Mobile filter sheet */}
      <SheetContent side="left" className="w-80 overflow-y-auto">
        <SheetHeader className="mb-2">
          <SheetTitle>Filters</SheetTitle>
        </SheetHeader>
        <div className="px-6 pb-8">
          <FilterPanel {...filterPanelProps} />
        </div>
      </SheetContent>
    </Sheet>
  );
}
