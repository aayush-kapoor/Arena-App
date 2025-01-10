import { cn } from './utils';

export const formFieldClasses = {
  input: cn(
    "w-full px-4 py-2 rounded-lg transition-colors",
    "dark:bg-gray-700 dark:text-white dark:border-0",
    "bg-gray-50 text-gray-900 border border-gray-200",
    "focus:ring-2 focus:ring-blue-500 focus:border-transparent"
  ),
  label: "block text-sm font-medium dark:text-gray-200 text-gray-700 mb-1",
  sportCard: (selected: boolean) => cn(
    "flex items-center gap-2 p-4 rounded-lg cursor-pointer transition-colors",
    selected
      ? "dark:bg-blue-900/50 dark:text-blue-400 bg-blue-50 text-blue-700"
      : "dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 bg-gray-50 text-gray-700 hover:bg-gray-100"
  )
};