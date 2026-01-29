import { ReactNode } from 'react';

interface FormContainerProps {
  children: ReactNode;
}

export default function FormContainer({ children }: FormContainerProps) {
  return (
    <div className="w-[95%] mx-auto">
      <div className="bg-gray-900/80 backdrop-blur-sm rounded-t-[32px] px-5 py-6 shadow-2xl border border-white/10">
        <div className="max-w-md mx-auto">
          <div className="mb-4">
            <h2 className="text-xl font-bold text-white text-center mb-2">
              対象銘柄の公開データを確認
            </h2>
            <p className="text-xs text-gray-300 text-center">
              銘柄名または一銘柄コードを入力してください
            </p>
          </div>

          {children}
        </div>
      </div>
    </div>
  );
}
