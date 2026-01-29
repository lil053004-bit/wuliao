import { ReactNode } from 'react';

interface FormContainerProps {
  children: ReactNode;
}

export default function FormContainer({ children }: FormContainerProps) {
  return (
    <div className="w-[95%] mx-auto">
      <div className="bg-gray-900/80 backdrop-blur-sm rounded-t-[32px] px-5 py-6 shadow-2xl border border-white/10">
        <div className="max-w-md mx-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
