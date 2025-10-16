export function LoadingScreen() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center" suppressHydrationWarning={true}>
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-white/30 border-t-white mx-auto mb-4"></div>
        <p className="text-white text-lg">Loading game...</p>
      </div>
    </div>
  );
}
