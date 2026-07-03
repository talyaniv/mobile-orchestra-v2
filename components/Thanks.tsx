export default function Thanks({ show }: { show: boolean }) {
  if (!show) return null;

  return (
    <div className="thanks">
      <div>תודה רבה!</div>
      <div>Thanks!</div>
      <div>⬇</div>
      <ul className="social">
        <li><a href="https://www.youtube.com/" aria-label="YouTube">▶</a></li>
        <li><a href="https://www.facebook.com/" aria-label="Facebook">f</a></li>
        <li><a href="https://www.instagram.com/" aria-label="Instagram">◎</a></li>
        <li><a href="https://soundcloud.com/" aria-label="SoundCloud">☁</a></li>
      </ul>
    </div>
  );
}
