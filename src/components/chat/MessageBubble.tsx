interface Props {
  role: "user" | "assistant";
  content: string;
  time?: string;
  isBotTyping?: boolean;
}

export default function MessageBubble({ role, content, time, isBotTyping }: Props) {
  const isBot = role === "assistant";
  return (
    <div className={`msg-row ${isBot ? "bot" : "user"}`}>
      <div className={`msg-av ${isBot && isBotTyping ? "bot-avatar-pulse" : ""}`}>
        {isBot ? "Y" : "P"}
      </div>
      <div>
        <div className="bubble">{content}</div>
        {time && <div className="msg-time">{time}</div>}
      </div>
    </div>
  );
}
