'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Tag } from '@/lib/types';

// Theme-aware color helper
const useThemeColors = () => {
  // Check if we're in dark mode using Tailwind's dark mode class
  const isDarkMode = typeof document !== 'undefined' && document.documentElement.classList.contains('dark');

  return {
    isDarkMode,
    getColors: (color: string) => {
      const baseColors = {
        red: { light: '#ef4444', dark: '#f87171' },
        blue: { light: '#3b82f6', dark: '#60a5fa' },
        green: { light: '#22c55e', dark: '#4ade80' },
        yellow: { light: '#eab308', dark: '#facc15' },
        purple: { light: '#a855f7', dark: '#c084fc' },
        pink: { light: '#ec4899', dark: '#f472b6' },
        orange: { light: '#f97316', dark: '#fb923c' },
        teal: { light: '#14b8a6', dark: '#2dd4bf' },
      };

      const selectedColor = baseColors[color as keyof typeof baseColors] || baseColors.blue;
      return selectedColor[isDarkMode ? 'dark' : 'light'];
    }
  };
};

// Color options for tags
const TAG_COLORS = [
  { value: 'red', label: 'Vermelho', preview: 'bg-red-500/20 text-red-400 border-red-500/50' },
  { value: 'blue', label: 'Azul', preview: 'bg-blue-500/20 text-blue-400 border-blue-500/50' },
  { value: 'green', label: 'Verde', preview: 'bg-green-500/20 text-green-400 border-green-500/50' },
  { value: 'yellow', label: 'Amarelo', preview: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50' },
  { value: 'purple', label: 'Roxo', preview: 'bg-purple-500/20 text-purple-400 border-purple-500/50' },
  { value: 'pink', label: 'Rosa', preview: 'bg-pink-500/20 text-pink-400 border-pink-500/50' },
  { value: 'orange', label: 'Laranja', preview: 'bg-orange-500/20 text-orange-400 border-orange-500/50' },
  { value: 'teal', label: 'Ciano', preview: 'bg-teal-500/20 text-teal-400 border-teal-500/50' },
];

// Get tag color styling (translucent like forms)
const getTagColor = (color?: string) => {
  if (!color) return "bg-muted text-muted-foreground border-border";

  const colorMap: Record<string, string> = {
    red: "bg-red-500/20 text-red-400 border-red-500/50",
    blue: "bg-blue-500/20 text-blue-400 border-blue-500/50",
    green: "bg-green-500/20 text-green-400 border-green-500/50",
    yellow: "bg-yellow-500/20 text-yellow-400 border-yellow-500/50",
    purple: "bg-purple-500/20 text-purple-400 border-purple-500/50",
    pink: "bg-pink-500/20 text-pink-400 border-pink-500/50",
    orange: "bg-orange-500/20 text-orange-400 border-orange-500/50",
    teal: "bg-teal-500/20 text-teal-400 border-teal-500/50",
  };

  return colorMap[color] || "bg-muted text-muted-foreground border-border";
};

// Get theme-aware tag colors
const getTagInlineColor = (color?: string) => {
  const { isDarkMode, getColors } = useThemeColors();

  if (!color) {
    return isDarkMode
      ? { backgroundColor: 'rgba(55, 65, 81, 0.5)', borderColor: 'rgba(75, 85, 99, 0.8)', color: 'rgba(209, 213, 219, 0.9)' }
      : { backgroundColor: 'rgba(243, 244, 246, 0.8)', borderColor: 'rgba(209, 213, 219, 0.8)', color: 'rgba(55, 65, 81, 0.9)' };
  }

  const themeColor = getColors(color);

  return {
    backgroundColor: isDarkMode
      ? `${themeColor}15` // More transparent in dark mode
      : `${themeColor}20`, // Standard transparency in light mode
    borderColor: themeColor,
    color: themeColor
  };
};

interface TagComponentProps {
  tag: string | Tag;
  variant?: 'default' | 'secondary' | 'outline' | 'destructive';
  size?: 'sm' | 'default' | 'lg';
  maxTags?: number;
  showMore?: boolean;
  useInlineStyle?: boolean;
  className?: string;
}

export function TagComponent({
  tag,
  variant = 'default',
  size = 'sm',
  maxTags,
  showMore = true,
  useInlineStyle = false,
  className = '',
}: TagComponentProps) {
  // Handle both string tags and Tag objects
  const tagName = typeof tag === 'string' ? tag : tag.name;
  const tagColor = typeof tag === 'object' && tag.color ? tag.color : undefined;

  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    default: 'text-sm px-2.5 py-0.5',
    lg: 'text-base px-3 py-1'
  };

  const baseClasses = `inline-flex items-center rounded-full font-medium ${sizeClasses[size]} ${className}`;

  // Default to theme-aware inline style for consistency across the app
  const inlineColors = getTagInlineColor(tagColor);

  return (
    <Badge
      variant="outline"
      className={`${baseClasses} border-2`}
      style={{
        backgroundColor: inlineColors.backgroundColor,
        borderColor: inlineColors.borderColor,
        color: inlineColors.color,
      }}
    >
      {tagName}
    </Badge>
  );
}

interface TagListProps {
  tags: (string | Tag)[];
  variant?: 'default' | 'secondary' | 'outline' | 'destructive';
  size?: 'sm' | 'default' | 'lg';
  maxTags?: number;
  showMore?: boolean;
  useInlineStyle?: boolean;
  className?: string;
}

export function TagList({
  tags,
  variant = 'default',
  size = 'sm',
  maxTags = 3,
  showMore = true,
  useInlineStyle = false,
  className = '',
}: TagListProps) {
  if (!tags || tags.length === 0) {
    return null;
  }

  const displayedTags = tags.slice(0, maxTags);
  const remainingTags = tags.length > maxTags ? tags.length - maxTags : 0;

  return (
    <div className={`flex flex-wrap gap-1 ${className}`}>
      {displayedTags.map((tag, index) => {
        const key = typeof tag === 'string' ? `legacy-${index}` : tag.id;
        return (
          <TagComponent
            key={key}
            tag={tag}
            variant={variant}
            size={size}
            useInlineStyle={useInlineStyle}
          />
        );
      })}

      {showMore && remainingTags > 0 && (
        <Badge
          variant="outline"
          className={`text-xs px-2 py-0.5 ${size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-base' : 'text-sm'}`}
        >
          +{remainingTags}
        </Badge>
      )}
    </div>
  );
}

export { TAG_COLORS, getTagColor, getTagInlineColor };