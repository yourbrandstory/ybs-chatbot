import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

export default function SettingsView() {
  const [prompt, setPrompt] = useState("");
  const [chips, setChips] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    async function load() {
      const { data: promptRow } = await supabase
        .from("settings")
        .select("value")
        .eq("key", "system_prompt")
        .single();
      const { data: chipsRow } = await supabase
        .from("settings")
        .select("value")
        .eq("key", "quick_chips")
        .single();
      if (promptRow) setPrompt(promptRow.value);
      if (chipsRow) setChips(chipsRow.value);
    }
    load();
  }, []);

  async function savePrompt() {
    await supabase
      .from("settings")
      .upsert({ key: "system_prompt", value: prompt, updated_at: new Date().toISOString() });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  async function saveChips() {
    await supabase
      .from("settings")
      .upsert({ key: "quick_chips", value: chips, updated_at: new Date().toISOString() });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <>
      <div className="settings-block">
        <h3>AI system prompt</h3>
        <p>How the assistant introduces itself, what it can talk about, and its tone of voice.</p>
        <textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} />
        <button className="save-b" onClick={savePrompt}>
          Save prompt
        </button>
      </div>

      <div className="settings-block">
        <h3>Quick chips</h3>
        <p>Pipe-separated suggestions shown under the chat before the conversation starts.</p>
        <textarea
          style={{ minHeight: 100 }}
          value={chips}
          onChange={(e) => setChips(e.target.value)}
        />
        <button className="save-b" onClick={saveChips}>
          Save chips
        </button>
      </div>

      {saved && <p style={{ color: "var(--sage)", fontSize: 12 }}>Saved!</p>}
    </>
  );
}
