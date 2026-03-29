import { useState, useEffect } from "react";
import { Button } from "./Button";
import { Input } from "./Input";
import { vi } from "../constants/i18n";

const CONDITIONS = [">", "<", ">=", "<=", "=="];

export function AlertForm({ metricOptions, onSubmit, submitting }) {
  const [metric_name, setMetricName] = useState(metricOptions[0] || "");
  const [condition, setCondition] = useState(">");
  const [threshold, setThreshold] = useState("");
  const [message, setMessage] = useState(vi.alertForm.defaultMessage);

  useEffect(() => {
    if (metricOptions?.length && !metricOptions.includes(metric_name)) {
      setMetricName(metricOptions[0]);
    }
  }, [metricOptions, metric_name]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const t = parseFloat(threshold, 10);
    if (Number.isNaN(t) || !metric_name) return;
    onSubmit({
      metric_name,
      condition,
      threshold: t,
      message: message.trim() || vi.alertForm.fallbackMessage,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">
          {vi.alertForm.metric}
        </label>
        <select
          className="input-box"
          value={metric_name}
          onChange={(e) => setMetricName(e.target.value)}
          disabled={!metricOptions?.length}
        >
          {metricOptions?.length ? (
            metricOptions.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))
          ) : (
            <option value="">{vi.alertForm.noMetrics}</option>
          )}
        </select>
      </div>
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">
          {vi.alertForm.condition}
        </label>
        <select
          className="input-box"
          value={condition}
          onChange={(e) => setCondition(e.target.value)}
        >
          {CONDITIONS.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>
      <Input
        label={vi.alertForm.threshold}
        type="number"
        step="any"
        required
        value={threshold}
        onChange={(e) => setThreshold(e.target.value)}
      />
      <Input
        label={vi.alertForm.message}
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <Button
        className="cursor-pointer"
        type="submit"
        disabled={submitting || !metricOptions?.length}
      >
        {submitting ? vi.common.saving : vi.alertRules.createRuleBtn}
      </Button>
    </form>
  );
}
