export default function ModernGradientBackground() {
  return (
    <div className="fixed inset-0 w-full h-full z-0">
      <div
        className="absolute inset-0 w-full h-full"
        style={{
          background: 'linear-gradient(180deg, #0F1E3A 0%, #0A1628 100%)'
        }}
      />
      <div
        className="absolute inset-0 w-full h-full opacity-30"
        style={{
          background: 'radial-gradient(circle at 50% 0%, rgba(37, 99, 235, 0.15), transparent 60%)'
        }}
      />
    </div>
  );
}
