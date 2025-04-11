import { useState } from "react";
import { Palette } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function ThemeSelector() {
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);

  const themes = [
    { value: "light", label: "Light Theme", color: "#3b82f6" },
    { value: "dark", label: "Dark Theme", color: "#818cf8" },
    { value: "princess", label: "Princess Theme", color: "#f9a8d4" },
    { value: "villain", label: "Villain Theme", color: "#ef4444" },
  ];

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger className="p-2 rounded-full hover:bg-primary/10 transition-colors">
        <Palette className="h-5 w-5" />
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {themes.map((t) => (
          <DropdownMenuItem
            key={t.value}
            className="flex items-center gap-2 cursor-pointer"
            onClick={() => {
              setTheme(t.value as any);
              setOpen(false);
            }}
          >
            <span
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: t.color }}
            />
            <span>{t.label}</span>
            {theme === t.value && (
              <span className="ml-auto text-primary">✓</span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
