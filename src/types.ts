export type TabId = 
  | 'vision' 
  | 'gdd' 
  | 'architecture' 
  | 'structure' 
  | 'backlog' 
  | 'prototype'
  | 'game';

export interface TabInfo {
  id: TabId;
  label: string;
  icon: string;
}
