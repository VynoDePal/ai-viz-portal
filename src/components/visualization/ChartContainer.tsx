interface ChartContainerProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
}

export function ChartContainer({ children, title, description }: ChartContainerProps) {
  return (
    <div className="bg-white shadow rounded-lg p-6">
      {title && (
        <h2 className="text-xl font-semibold text-gray-900 mb-2">{title}</h2>
      )}
      {description && (
        <p className="text-sm text-gray-600 mb-4">{description}</p>
      )}
      {children}
    </div>
  );
}
