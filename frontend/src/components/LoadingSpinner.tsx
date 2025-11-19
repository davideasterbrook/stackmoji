interface LoadingSpinnerProps {
  message?: string;
}

export default function LoadingSpinner({ message = 'Loading...' }: LoadingSpinnerProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="relative">
        <div className="animate-spin rounded-full h-20 w-20 border-b-2 border-blue-600 absolute inset-0"></div>
        <div className="text-4xl flex items-center justify-center h-20 w-20">{message}</div>
      </div>
    </div>
  );
}