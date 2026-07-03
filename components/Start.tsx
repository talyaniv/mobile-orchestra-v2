export default function Start({ show, callback }: { show: boolean; callback: () => void }) {
  if (!show) return null;

  return (
    <button className="start-button" onClick={callback}>
      Click to start
      <br />
      לחצו להתחלה
    </button>
  );
}
