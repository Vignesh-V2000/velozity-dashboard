export function Spinner({ size = 'sm' }: { size?: 'sm' | 'lg' }) {
  return <div className={`spinner ${size === 'lg' ? 'spinner-lg' : ''}`} />;
}

export function LoadingCenter() {
  return (
    <div className="loading-center">
      <Spinner size="lg" />
    </div>
  );
}
