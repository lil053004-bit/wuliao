export default function ProcessStepsSection() {
  const steps = [
    {
      number: '01',
      title: '公開データの収集',
      description: '各証券取引所や金融機関が公開している銘柄情報、株価データ、企業の財務情報などを収集します。過去のデータも含めて幅広く情報を集めます。'
    },
    {
      number: '02',
      title: '前提の評価・レポート',
      description: '収集したデータを元に、前日との比較や市場全体の動向を分析します。AIが複数の指標を組み合わせて総合的な評価を行い、投資判断の参考となる情報をレポートとしてまとめます。'
    },
    {
      number: '03',
      title: 'データ出力・提供',
      description: '分析結果を見やすい形式で出力し、ユーザーの皆様に提供します。グラフや表を用いて視覚的にも理解しやすい形で情報をお届けします。'
    }
  ];

  return (
    <div id="process" className="w-full px-3 py-6">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-white mb-2">
          データ認証・詳細化の仕組み
        </h2>
      </div>

      <div className="space-y-4">
        {steps.map((step, index) => (
          <div
            key={step.number}
            className="bg-dark-secondary/60 backdrop-blur-sm border border-border-blue/20 rounded-xl p-4"
          >
            <div className="flex gap-3">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-tech-blue/30 rounded-lg flex items-center justify-center">
                  <span className="text-sm font-bold text-tech-blue-light">{step.number}</span>
                </div>
              </div>

              <div className="flex-1">
                <h3 className="text-base font-bold text-white mb-2">
                  {step.title}
                </h3>

                <p className="text-xs text-text-muted leading-relaxed">
                  {step.description}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 bg-red-900/20 border border-red-500/30 rounded-xl p-4">
        <p className="text-xs text-red-200 leading-relaxed">
          ※ 当サービスで提供する情報は、公開されている市場データや企業情報をもとにAIが分析した参考情報です。投資判断を行う際の一つの材料としてご活用ください。投資の最終的な判断はご自身の責任で行っていただきますようお願いいたします。
        </p>
      </div>

      <div className="mt-4 text-center">
        <p className="text-xs text-text-muted leading-relaxed">
          ※ 本サービスは公開情報をもとにした参考データの提供を目的としています。<br />
          投資判断は必ずご自身の責任で行ってください。
        </p>
      </div>
    </div>
  );
}
