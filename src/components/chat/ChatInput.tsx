import { useState } from "react";

interface Props {
  onSend: (text: string) => void;
  disabled?: boolean;
  onFocusChange?: (focused: boolean) => void;
}

export default function ChatInput({ onSend, disabled, onFocusChange }: Props) {
  const [value, setValue] = useState("");

  function handleSend() {
    const text = value.trim();
    if (!text || disabled) return;
    setValue("");
    onSend(text);
  }

  return (
    <div className="chat-foot">
      <div className="inp-row">
        <input
          type="text"
          placeholder="Ask me anything about TeamMap..."
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSend();
          }}
          onFocus={() => onFocusChange?.(true)}
          onBlur={() => onFocusChange?.(false)}
          disabled={disabled}
        />
        <button
          className="send-b"
          onClick={handleSend}
          disabled={!value.trim() || disabled}
          aria-label="Send"
        >
          <i className="ti ti-send" aria-hidden="true" />
        </button>
      </div>
      <div className="chat-copyright">Powered by YBS &middot; Your data is private</div>
    </div>
  );
}
