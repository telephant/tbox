export const inputStyles = {
  base: "flex h-9 w-full rounded-md bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 px-3 py-1.5 text-sm transition-all",
  focus: "focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-none",
  hover: "hover:border-indigo-300 dark:hover:border-indigo-700",
  disabled: "disabled:opacity-50 disabled:cursor-not-allowed",
  placeholder: "placeholder:text-gray-500 dark:placeholder:text-gray-400",
};

export const cardStyles = {
  base: "bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 shadow-lg border-0 rounded-lg",
  header: "pb-4",
  title: "text-xl font-medium bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent",
  icon: "text-indigo-500",
};

export const buttonStyles = {
  base: "inline-flex items-center justify-center rounded-md text-sm font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed",
  primary: "bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white shadow-md hover:shadow-lg",
  secondary: "bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-700 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-indigo-200 dark:hover:border-indigo-800 hover:shadow-sm",
};

export const accordionStyles = {
  base: "border rounded-lg px-3 py-1.5 relative before:absolute before:inset-0 before:rounded-lg before:border before:border-transparent before:bg-gradient-to-r before:from-gray-100 before:via-indigo-50 before:to-gray-100 dark:before:from-gray-800/50 dark:before:via-indigo-900/30 dark:before:to-gray-800/50 before:-z-10 hover:before:from-indigo-50 hover:before:via-purple-50 hover:before:to-indigo-50 dark:hover:before:from-indigo-900/30 dark:hover:before:via-purple-900/30 dark:hover:before:to-indigo-900/30 transition-all duration-200 border-gray-200/80 dark:border-gray-700/80",
  trigger: "text-base font-medium text-gray-700 dark:text-gray-300 hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors data-[state=open]:text-indigo-500 dark:data-[state=open]:text-indigo-400",
  content: "pt-2",
  icon: "text-gray-400 dark:text-gray-500 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors",
};

export const textStyles = {
  label: "block text-sm font-medium text-gray-700 dark:text-gray-300",
  error: "text-sm text-red-500 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-2 rounded",
};

export const progressStyles = {
  base: "relative h-2.5 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800",
  indicator: "h-full w-full flex-1 transition-all duration-300",
}; 