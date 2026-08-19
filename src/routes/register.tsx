import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useGameStore } from "@/store/gameStore";

const title = "Player Registration — TECHFEST AR-VR Hunt";
const description =
  "Register your enrollment number and team to join the TECHFEST virtual AR/VR treasure hunt.";

export const Route = createFileRoute("/register")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
    ],
  }),
  component: RegisterPage,
});

function RegisterPage() {
  const navigate = useNavigate();
  const register = useGameStore((s) => s.register);
  const [form, setForm] = useState({ playerName: "", enrollmentNumber: "", team: "" });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.playerName.trim() || !form.enrollmentNumber.trim()) {
      setError("Player name and enrollment number are required.");
      return;
    }
    setBusy(true);
    await register({
      playerName: form.playerName.trim(),
      enrollmentNumber: form.enrollmentNumber.trim(),
      team: form.team.trim() || "Solo Operative",
    });
    setBusy(false);
    void navigate({ to: "/guidelines" });
  };

  return (
    <main className="holo-grid flex min-h-dvh items-center justify-center bg-background px-4 py-12">
      <form onSubmit={submit} className="holo-panel w-full max-w-md rounded-xl p-7">
        <p className="font-display text-[10px] tracking-[0.4em] text-primary">TECHFEST</p>
        <h1 className="mt-2 text-2xl text-foreground">PLAYER REGISTRATION</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Your session is tracked independently. Nothing is shared with other operatives.
        </p>

        <div className="mt-6 space-y-4">
          <Field
            id="playerName"
            label="Player name"
            value={form.playerName}
            onChange={(v) => setForm({ ...form, playerName: v })}
            placeholder="e.g. Aditi Sharma"
          />
          <Field
            id="enrollmentNumber"
            label="Enrollment number"
            value={form.enrollmentNumber}
            onChange={(v) => setForm({ ...form, enrollmentNumber: v })}
            placeholder="e.g. EN2026114"
          />
          <Field
            id="team"
            label="Team (optional)"
            value={form.team}
            onChange={(v) => setForm({ ...form, team: v })}
            placeholder="e.g. Null Pointers"
          />
        </div>

        {error && <p className="mt-4 text-xs text-destructive">{error}</p>}

        <Button type="submit" className="mt-6 w-full" disabled={busy}>
          {busy ? "Registering…" : "Continue to guidelines"}
        </Button>
      </form>
    </main>
  );
}

function Field({
  id,
  label,
  value,
  onChange,
  placeholder,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id} className="text-xs uppercase tracking-widest text-muted-foreground">
        {label}
      </Label>
      <Input
        id={id}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
}