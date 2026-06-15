"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "convex/react";
import { SlidersHorizontal, X, Search } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
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
import { Input } from "~/components/ui/input";
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
      <AnimatePresence initial={false}>
        {activeFilters > 0 && (
          <motion.div
            key="clear-all"
            initial={{ opacity: 0, height: 0, marginBottom: -8 }}
            animate={{ opacity: 1, height: "auto", marginBottom: 0 }}
            exit={{ opacity: 0, height: 0, marginBottom: -8 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            style={{ overflow: "hidden" }}
          >
            <button
              onClick={onClearAll}
              className="text-muted-foreground hover:text-foreground text-xs transition-colors"
            >
              Clear all filters
            </button>
          </motion.div>
        )}
      </AnimatePresence>

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
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [desktopSearchOpen, setDesktopSearchOpen] = useState(false);

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
    <>
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
        <div className="mb-8">
          {/* Desktop: title + search icon/bar + filter button on one row */}
          <div className="hidden items-center gap-3 md:flex">
            <h1 className="font-heading text-foreground shrink-0 text-3xl font-bold">
              All Recipes
            </h1>
            <div className="flex flex-1 items-center justify-end gap-2">
              {/* Animated search bar + icon toggle */}
              <div className="flex items-center gap-1">
                <AnimatePresence initial={false}>
                  {desktopSearchOpen && (
                    <motion.div
                      key="desktop-search"
                      initial={{ width: 0, opacity: 0 }}
                      animate={{ width: 260, opacity: 1 }}
                      exit={{ width: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: [0.2, 0, 0, 1] }}
                      style={{ overflow: "hidden" }}
                    >
                      <Input
                        type="search"
                        placeholder="Search recipes…"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        autoFocus
                        className="w-full appearance-none focus-visible:ring-0"
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => {
                    setDesktopSearchOpen((v) => !v);
                    if (desktopSearchOpen) setSearchQuery("");
                  }}
                  aria-label={desktopSearchOpen ? "Close search" : "Search recipes"}
                >
                  <AnimatePresence mode="wait" initial={false}>
                    {desktopSearchOpen ? (
                      <motion.span
                        key="close"
                        initial={{ rotate: -90, opacity: 0 }}
                        animate={{ rotate: 0, opacity: 1 }}
                        exit={{ rotate: 90, opacity: 0 }}
                        transition={{ duration: 0.15 }}
                      >
                        <X className="size-4" />
                      </motion.span>
                    ) : (
                      <motion.span
                        key="search"
                        initial={{ rotate: 90, opacity: 0 }}
                        animate={{ rotate: 0, opacity: 1 }}
                        exit={{ rotate: -90, opacity: 0 }}
                        transition={{ duration: 0.15 }}
                      >
                        <Search className="size-4" />
                      </motion.span>
                    )}
                  </AnimatePresence>
                </Button>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleFilterToggle}
                aria-label="Toggle filters"
                className="flex shrink-0 items-center gap-1.5"
              >
                <SlidersHorizontal className="size-4" />
                <span>Filters</span>
                {activeFilters > 0 && (
                  <Badge className="flex size-5 items-center justify-center rounded-full p-0 text-[10px] leading-none">
                    {activeFilters}
                  </Badge>
                )}
              </Button>
            </div>
          </div>

          {/* Mobile: title + search icon + filter button on one row */}
          <div className="flex items-center justify-between md:hidden">
            <h1 className="font-heading text-foreground text-3xl font-bold">
              All Recipes
            </h1>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => {
                  setMobileSearchOpen((v) => !v);
                  if (mobileSearchOpen) setSearchQuery("");
                }}
                aria-label={mobileSearchOpen ? "Close search" : "Search recipes"}
              >
                <AnimatePresence mode="wait" initial={false}>
                  {mobileSearchOpen ? (
                    <motion.span
                      key="close"
                      initial={{ rotate: -90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: 90, opacity: 0 }}
                      transition={{ duration: 0.15 }}
                    >
                      <X className="size-4" />
                    </motion.span>
                  ) : (
                    <motion.span
                      key="search"
                      initial={{ rotate: 90, opacity: 0 }}
                      animate={{ rotate: 0, opacity: 1 }}
                      exit={{ rotate: -90, opacity: 0 }}
                      transition={{ duration: 0.15 }}
                    >
                      <Search className="size-4" />
                    </motion.span>
                  )}
                </AnimatePresence>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleFilterToggle}
                aria-label="Toggle filters"
                className="flex items-center gap-1.5"
              >
                <SlidersHorizontal className="size-4" />
                {activeFilters > 0 && (
                  <Badge className="flex size-5 items-center justify-center rounded-full p-0 text-[10px] leading-none">
                    {activeFilters}
                  </Badge>
                )}
              </Button>
            </div>
          </div>

          {/* Mobile: animated search bar row */}
          <AnimatePresence initial={false}>
            {mobileSearchOpen && (
              <motion.div
                key="mobile-search"
                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                animate={{ opacity: 1, height: "auto", marginTop: 12 }}
                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
                style={{ overflow: "hidden" }}
                className="md:hidden"
              >
                <Input
                  type="search"
                  placeholder="Search recipes…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoFocus
                  className="w-full appearance-none focus-visible:ring-0"
                />
              </motion.div>
            )}
          </AnimatePresence>
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
              searchQuery={searchQuery}
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
            searchQuery={searchQuery}
          />
        </div>
      </div>

      {/* Mobile filter sheet */}
      <AnimatePresence>
        {sheetOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              className="fixed inset-0 z-50 bg-black/30 supports-backdrop-filter:backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setSheetOpen(false)}
            />
            {/* Panel */}
            <motion.div
              key="panel"
              className="bg-popover text-popover-foreground fixed inset-y-0 left-0 z-50 w-80 overflow-y-auto shadow-xl"
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <div className="flex items-center justify-between px-6 pt-6 pb-2">
                <h2 className="font-heading text-foreground text-lg font-semibold">
                  Filters
                </h2>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  onClick={() => setSheetOpen(false)}
                  aria-label="Close filters"
                >
                  <X className="size-4" />
                </Button>
              </div>
              <div className="px-6 pb-8">
                <FilterPanel {...filterPanelProps} />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
