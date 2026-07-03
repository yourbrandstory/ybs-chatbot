import { Link } from "react-router-dom";

interface Props {
  onMenuClick: () => void;
  title?: string;
}

export default function MobileTopBar({ onMenuClick, title }: Props) {
  return (
    <div className="mobile-top-bar">
      {title ? (
        <span className="mobile-top-title">{title}</span>
      ) : (
        <Link to="/chat" className="mobile-top-brand">
          TeamMap <em>by YBS</em>
        </Link>
      )}
      <button className="mobile-hamburger" onClick={onMenuClick} aria-label="Menu">
        <i className="ti ti-menu-2" />
      </button>
    </div>
  );
}
