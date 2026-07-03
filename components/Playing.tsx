export default function Playing({ show }: { show: boolean }) {
  if (!show) return null;

  return (
    <div className="lds-ripple">
      <div />
      <div />
    </div>
  );
}
