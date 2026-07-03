export default function TypingIndicator() {
  return (
    <div className="msg-row bot">
      <div className="msg-av bot-avatar-pulse">Y</div>
      <div>
        <div className="bubble typing-bubble" style={{ padding: 0 }}>
          <div className="typing">
            <span />
            <span />
            <span />
          </div>
        </div>
      </div>
    </div>
  );
}
