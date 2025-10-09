import * as React from "react";
import { HslColorPicker } from "react-colorful";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Pipette } from "lucide-react";
import { parseHsl, formatHsl, hslToHex, hexToHsl, colorPresets, type HslColor } from "@/lib/colorUtils";

interface ColorPickerProps {
  value: string; // HSL format "160 84% 39%"
  onChange: (value: string) => void;
  label?: string;
  showInput?: boolean;
}

export function ColorPicker({ value, onChange, label, showInput = true }: ColorPickerProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [hslColor, setHslColor] = React.useState<HslColor>(() => {
    try {
      return parseHsl(value);
    } catch {
      return { h: 160, s: 84, l: 39 };
    }
  });

  const hexValue = React.useMemo(() => hslToHex(hslColor), [hslColor]);
  const hslString = React.useMemo(() => formatHsl(hslColor), [hslColor]);

  React.useEffect(() => {
    try {
      const parsed = parseHsl(value);
      setHslColor(parsed);
    } catch {
      // Invalid format, ignore
    }
  }, [value]);

  const handleHslChange = (newHsl: HslColor) => {
    setHslColor(newHsl);
    onChange(formatHsl(newHsl));
  };

  const handleHexInputChange = (hex: string) => {
    if (/^#[0-9A-Fa-f]{6}$/.test(hex)) {
      try {
        const hsl = hexToHsl(hex);
        handleHslChange(hsl);
      } catch {
        // Invalid hex
      }
    }
  };

  const handleHslInputChange = (hsl: string) => {
    try {
      const parsed = parseHsl(hsl);
      handleHslChange(parsed);
    } catch {
      // Invalid format
    }
  };

  const handlePresetClick = (presetValue: string) => {
    try {
      const parsed = parseHsl(presetValue);
      handleHslChange(parsed);
    } catch {
      // Invalid preset
    }
  };

  return (
    <div className="space-y-2">
      {label && <Label>{label}</Label>}
      
      <div className="flex gap-2 items-center">
        <Popover open={isOpen} onOpenChange={setIsOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              className="w-12 h-10 p-0 relative group"
              style={{ backgroundColor: `hsl(${hslString})` }}
              aria-label="Escolher cor"
            >
              <Pipette className="w-4 h-4 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow-md" />
            </Button>
          </PopoverTrigger>
          
          <PopoverContent className="w-80" align="start">
            <Tabs defaultValue="picker" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="picker">Picker</TabsTrigger>
                <TabsTrigger value="input">Manual</TabsTrigger>
              </TabsList>
              
              <TabsContent value="picker" className="space-y-4">
                <div className="space-y-3">
                  <HslColorPicker color={hslColor} onChange={handleHslChange} />
                  
                  <div className="space-y-2">
                    <Label className="text-xs">Presets</Label>
                    <div className="flex gap-1.5 flex-wrap">
                      {colorPresets.map((preset) => (
                        <button
                          key={preset.value}
                          onClick={() => handlePresetClick(preset.value)}
                          className="w-8 h-8 rounded border-2 border-border hover:border-foreground transition-colors"
                          style={{ backgroundColor: `hsl(${preset.value})` }}
                          title={preset.name}
                          aria-label={preset.name}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="input" className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor="hex-input" className="text-xs">HEX</Label>
                  <Input
                    id="hex-input"
                    value={hexValue}
                    onChange={(e) => handleHexInputChange(e.target.value)}
                    placeholder="#10b981"
                    className="font-mono text-sm"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="hsl-input" className="text-xs">HSL</Label>
                  <Input
                    id="hsl-input"
                    value={hslString}
                    onChange={(e) => handleHslInputChange(e.target.value)}
                    placeholder="160 84% 39%"
                    className="font-mono text-sm"
                  />
                </div>
                
                <div 
                  className="w-full h-12 rounded border"
                  style={{ backgroundColor: `hsl(${hslString})` }}
                />
              </TabsContent>
            </Tabs>
          </PopoverContent>
        </Popover>
        
        {showInput && (
          <div className="flex-1">
            <Input
              value={hslString}
              onChange={(e) => handleHslInputChange(e.target.value)}
              className="font-mono"
              placeholder="160 84% 39%"
              title="Formato HSL: matiz saturação% luminosidade%"
            />
          </div>
        )}
      </div>
    </div>
  );
}
