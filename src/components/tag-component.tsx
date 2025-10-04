'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Tag } from '@/lib/types';

// Color options for tags
const TAG_COLORS = [
  { value: 'red', label: 'Vermelho', preview: 'bg-red-100 text-red-800 border-red-200' },
  { value: 'blue', label: 'Azul', preview: 'bg-blue-100 text-blue-800 border-blue-200' },
  { value: 'green', label: 'Verde', preview: 'bg-green-100 text-green-800 border-green-200' },
  { value: 'yellow', label: 'Amarelo', preview: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
  { value: 'purple', label: 'Roxo', preview: 'bg-purple-100 text-purple-800 border-purple-200' },
  { value: 'pink', label: 'Rosa', preview: 'bg-pink-100 text-pink-800 border-pink-200' },
  { value: 'orange', label: 'Laranja', preview: 'bg-orange-100 text-orange-800 border-orange-200' },
  { value: 'teal', label: 'Ciano', preview: 'bg-teal-100 text-teal-800 border-teal-200' },
];

// Get tag color styling
const getTagColor = (color?: string) => {
  if (!color) return "bg-gray-100 text-gray-800 border-gray-200";

  const colorMap: Record<string, string> = {
    red: "bg-red-100 text-red-800 border-red-200",
    blue: "bg-blue-100 text-blue-800 border-blue-200",
    green: "bg-green-100 text-green-800 border-green-200",
    yellow: "bg-yellow-100 text-yellow-800 border-yellow-200",
    purple: "bg-purple-100 text-purple-800 border-purple-200",
    pink: "bg-pink-100 text-pink-800 border-pink-200",
    orange: "bg-orange-100 text-orange-800 border-orange-200",
    teal: "bg-teal-100 text-teal-800 border-teal-200",
  };

  return colorMap[color] || "bg-gray-100 text-gray-800 border-gray-200";
};

// Get tag color for inline styling (legacy approach)
const getTagInlineColor = (color?: string) => {
  if (!color) return { backgroundColor: '#f3f4f6', borderColor: '#d1d5db', color: '#374151' };

  const colorMap: Record<string, { backgroundColor: string; borderColor: string; color: string }> = {
    red: { backgroundColor: '#fee2e2', borderColor: '#fecaca', color: '#991b1b' },
    blue: { backgroundColor: '#dbeafe', borderColor: '#bfdbfe', color: '#1e40af' },
    green: { backgroundColor: '#dcfce7', borderColor: '#bbf7d0', color: '#166534' },
    yellow: { backgroundColor: '#fef3c7', borderColor: '#fde68a', color: '#854d0e' },
    purple: { backgroundColor: '#f3e8ff', borderColor: '#e9d5ff', color: '#6b21a8' },
    pink: { backgroundColor: '#fce7f3', borderColor: '#fbcfe8', color: '#9f1239' },
    orange: { backgroundColor: '#fed7aa', borderColor: '#fdba74', color: '#9a3412' },
    teal: { backgroundColor: '#ccfbf1', borderColor: '#99f6e4', color: '#134e4a' },
  };

  return colorMap[color] || { backgroundColor: '#f3f4f6', borderColor: '#d1d5db', color: '#374151' };
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

  if (useInlineStyle) {
    const inlineColors = getTagInlineColor(tagColor);

    return (
      <Badge
        variant="outline"
        className={baseClasses}
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

  if (variant === 'outline') {
    return (
      <Badge
        variant="outline"
        className={`${baseClasses} ${getTagColor(tagColor)}`}
      >
        {tagName}
      </Badge>
    );
  }

  return (
    <Badge
      variant={variant}
      className={`${baseClasses} ${getTagColor(tagColor)}`}
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