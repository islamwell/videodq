"use client";

import React from 'react';
import Link from 'next/link';
import { useTheme } from '../contexts/ThemeContext';
import { List, ListInput, Block, BlockTitle } from 'framework7-react';

export const Sidebar: React.FC = () => {
  const { theme, setTheme } = useTheme();

  return (
    <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 h-screen sticky top-0">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">
          NurulQuran Video
        </h1>

        <nav className="space-y-2">
          <Link href="/" className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <span className="font-medium">Home</span>
          </Link>
          <Link href="/ramadan" className="flex items-center gap-3 px-4 py-3 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
            <span className="font-medium">Ramadan</span>
          </Link>
        </nav>

        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
          <BlockTitle>Theme</BlockTitle>
          <List noHairlines>
            <ListInput
              type="select"
              value={theme}
              onInput={(e:any) => setTheme(e.target.value)}
            >
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="blue">Blue</option>
              <option value="red">Red</option>
              <option value="green">Green</option>
              <option value="sepia">Sepia</option>
            </ListInput>
          </List>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-200 dark:border-gray-700">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            <p className="font-medium mb-1">NurulQuran Video</p>
            <p className="text-xs">Islamic Educational Videos</p>
            <p className="text-xs mt-2">Version 1.0.0</p>
          </div>
        </div>
      </div>
    </aside>
  );
};
