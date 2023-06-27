import type React from 'react';

type ComponentDocStarterProps = {
  title: string;
  desc?: React.ReactNode;
  preview: { title: string; demo: React.ReactNode }[];
  usage?: React.ReactNode;
  props?: React.ReactNode;
  styles?: React.ReactNode;
  notes?: React.ReactNode;
};

/**
 * component doc and demo page
 */
export const ComponentDocStarter = (props: ComponentDocStarterProps) => {
  // return ()
};
