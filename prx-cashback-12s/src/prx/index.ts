/**
 * PRX design system components, mounted from the system's own bundle.
 * bundle.js, bundle.css and tokens.css are copied verbatim from
 * https://claude.ai/artifact/FB83WbhhUxmDv8ZZGogGz5 (project/components, project/tokens.css).
 */
import './setup-react';
import './bundle.js';
import './tokens.css';
import './bundle.css';
import type { ComponentType, ReactNode } from 'react';

type PRXNamespace = {
  Button: ComponentType<{ variant?: 'primary' | 'secondary'; size?: 'large' | 'compact'; className?: string; children?: ReactNode }>;
  CategoryChip: ComponentType<{ color?: string; label?: string; className?: string }>;
  OfferCard: ComponentType<{ state?: 'filled' | 'loading'; merchant?: string; category?: string; earnLabel?: string }>;
};

export const PRX = (window as unknown as { PRX: PRXNamespace }).PRX;
