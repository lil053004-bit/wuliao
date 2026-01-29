import { Link } from 'react-router-dom';
import { Shield, Scale } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative z-10 border-t-2 border-border-blue/30 mt-12 bg-dark-secondary/50 backdrop-blur-sm">
      <div className="max-w-[1400px] mx-auto px-6 sm:px-8 lg:px-12 py-8">
        {/* Legal Disclosure Section - Desktop */}
        <div className="hidden md:block bg-dark-tertiary/90 backdrop-blur-sm border-2 border-tech-blue/50 rounded-lg p-6 mb-8 shadow-xl">
          <div className="flex items-start gap-4">
            <div className="bg-tech-blue/30 p-3 rounded-lg flex-shrink-0">
              <Shield className="w-6 h-6 text-tech-blue-light" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-tech-blue-light mb-3 flex items-center gap-2">
                <Scale className="w-5 h-5" />
                金融商品取引法に基づく重要事項
              </h3>

              <div className="space-y-3 text-sm leading-relaxed text-slate-200">
                <div className="bg-dark-card/70 rounded p-3 border-l-4 border-tech-blue">
                  <p className="font-bold text-tech-blue-light mb-2">【サービスの性質】</p>
                  <p>
                    本サービスは、株式情報の提供および分析ツールです。
                    <strong className="text-red-700">投資助言業務、投資一任業務、金融商品仲介業務には該当せず、特定の金融商品の売買を推奨・勧誘するものではありません。</strong>
                  </p>
                </div>

                <div className="bg-dark-card/70 rounded p-3 border-l-4 border-orange-500">
                  <p className="font-bold text-orange-300 mb-2">【投資リスクに関する警告】</p>
                  <p>
                    株式投資には価格変動リスク、信用リスク、流動性リスク等が伴い、
                    <strong className="text-red-700">投資元本を割り込む可能性があります。</strong>
                    過去の運用実績は将来の運用成果を保証するものではありません。
                    市場環境の変化により、予想外の損失が発生する可能性があります。
                  </p>
                </div>

                <div className="bg-dark-card/70 rounded p-3 border-l-4 border-tech-blue">
                  <p className="font-bold text-blue-300 mb-2">【情報の正確性について】</p>
                  <p>
                    提供される情報は、信頼できると判断した情報源から取得していますが、
                    その正確性、完全性、適時性を保証するものではありません。
                    分析結果は参考情報として提供されるものであり、絶対的な投資判断基準ではありません。
                  </p>
                </div>

                <div className="bg-dark-card/70 rounded p-3 border-l-4 border-border-subtle">
                  <p className="font-bold text-slate-300 mb-2">【投資判断の責任】</p>
                  <p>
                    <strong className="text-red-700">最終的な投資判断は、利用者ご自身の責任において行ってください。</strong>
                    本サービスの利用により生じたいかなる損害についても、当社は一切の責任を負いません。
                    投資を行う際は、証券会社等の金融商品取引業者にご相談ください。
                  </p>
                </div>

                <div className="bg-dark-card/50 rounded p-3 mt-4">
                  <p className="font-bold text-slate-200 mb-1">【登録情報】</p>
                  <p className="text-xs text-slate-300">
                    当サービス提供者は金融商品取引業者（投資助言・代理業、投資運用業等）ではありません。
                    金融商品取引法第29条の登録を受けた事業者ではないため、個別の投資助言を行うことはできません。
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Important Notice - Mobile */}
        <div className="md:hidden bg-tech-blue/10 backdrop-blur-md border border-tech-blue/50 rounded-xl p-4 text-center mb-6">
          <p className="text-sm text-tech-blue-light font-semibold mb-1">⚠️ 重要なお知らせ</p>
          <p className="text-xs text-text-muted leading-relaxed">
            当サービスは情報提供のみを目的としており、投資助言や投資勧誘を行うものではありません。投資判断は必ずご自身の責任で行ってください。
          </p>
        </div>

        {/* Footer Links Section */}
        <div className="border-t-2 border-white/30 pt-6">
          <div className="mb-6">
            {/* Legal Documents - Horizontal Layout */}
            <div className="flex flex-wrap items-center justify-center gap-2 text-xs sm:text-sm">
              <Link
                to="/terms"
                className="text-white drop-shadow-lg hover:text-yellow-300 hover:underline transition-colors"
              >
                利用規約
              </Link>
              <span className="text-white/50">|</span>
              <Link
                to="/privacy"
                className="text-white drop-shadow-lg hover:text-yellow-300 hover:underline transition-colors"
              >
                プライバシーポリシー
              </Link>
              <span className="text-white/50">|</span>
              <Link
                to="/specified-commercial-transaction-act"
                className="text-white drop-shadow-lg hover:text-yellow-300 hover:underline transition-colors"
              >
                特定商取引法表記
              </Link>
            </div>
          </div>

          {/* Copyright Section */}
          <div className="border-t border-white/30 pt-4 text-center">
            <p className="text-xs sm:text-sm text-white drop-shadow-lg mb-3 font-medium">
              &copy; {currentYear} Shueisha International Co., Ltd. All rights reserved.
            </p>

            {/* Enhanced Disclaimer for Google Compliance */}
            <div className="max-w-4xl mx-auto mb-4">
              <p className="text-[10px] sm:text-xs text-white/90 drop-shadow-lg leading-relaxed">
                本サイトは株式市場の情報提供を目的としたプラットフォームです。掲載情報は参考情報であり、投資勧誘ではありません。投資判断は必ずご自身の責任で行ってください。株式投資には価格変動リスクが伴い、元本割れの可能性があります。当サービスは金融商品取引業者ではありません。
              </p>
            </div>

          </div>
        </div>
      </div>
    </footer>
  );
}
