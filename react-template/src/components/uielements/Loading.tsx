interface LoadingProps {
  loading?: boolean;
  fullPage?: boolean;
}

/**
 * Simple Loading component with spinner
 */
export const Loading = ({ loading = true, fullPage = false }: LoadingProps) => {
  if (!loading) return null;

  const spinner = (
    <div className="flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-gray-200 border-t-2 border-t-primary-500 rounded-full animate-spin" />
    </div>
  );

  if (fullPage) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-20 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8">
          {spinner}
        </div>
      </div>
    );
  }

  return spinner;
};

export default Loading; 