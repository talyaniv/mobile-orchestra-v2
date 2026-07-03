export default function Grid({ show }: { show: boolean }) {
  if (!show) return null;

  return (
    <div className="lds-grid">
      {Array.from({ length: 9 }).map((_, index) => (
        <div key={index} />
      ))}
    </div>
  );
}
