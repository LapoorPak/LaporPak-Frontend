export function formatMachineText(value?: string | null) {
  if (!value) return "";

  return value.replace(/\b[a-zA-Z]+(?:_[a-zA-Z0-9]+)+\b/g, (match) =>
    match.replace(/_/g, " "),
  );
}
