
import { ReactNode } from 'react';

export interface NavItem {
  href: string;
  label: string;
}

export interface NavLink {
  name: string;
  path: string;
  icon: ReactNode;
}
