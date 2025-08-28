
'use client';
import React from 'react';
import * as Icons from 'lucide-react';

type AllIconNames = keyof typeof Icons;

type IconProps = {
  name: string; // e.g. "car", "file-search", "FileSearch"
  className?: string;
  size?: number; // Lucide size prop
  color?: string;
  strokeWidth?: number;
  title?: string;
  ariaLabel?: string;
};

const ALIASES: Record<string, AllIconNames> = {
  searchfile: 'FileSearch',
};

function normalize(name: string): AllIconNames | null {
  if (!name) return null;

  // If the exact name exists, return it directly
  if (name in Icons) {
    return name as AllIconNames;
  }

  // Clean and camel-case as fallback
  const cleaned = name.toLowerCase().replace(/[^a-z0-9]+/g, ' ');
  const camel = cleaned
    .replace(/(^|\s)([a-z0-9])/g, (_, __, c) => c.toUpperCase())
    .replace(/\s+/g, '');
  const aliased = ALIASES[camel] ?? camel;

  return aliased in Icons ? (aliased as AllIconNames) : null;
}


export const Icon: React.FC<IconProps> = ({
  name,
  className = 'w-5 h-5',
  size,
  color,
  strokeWidth,
  title,
  ariaLabel,
}) => {
  const normalized = normalize(name);
  const LucideIcon = normalized ? Icons[normalized] : Icons.Puzzle; // fallback

  // prefer title/aria-label for a11y; hide if none provided
  const a11yProps =
    title || ariaLabel
      ? { role: 'img', 'aria-label': ariaLabel ?? title }
      : { 'aria-hidden': true };

  return (
    <LucideIcon
      className={className}
      size={size}
      color={color}
      strokeWidth={strokeWidth}
      {...a11yProps}
    />
  );
};
