export default function FormAlert({
  type,
  message,
}: {
  type: "error" | "success" | "info";
  message: string;
}) {
  const styles = {
    error: "bg-error-50 text-error-700 dark:bg-error-500/10 dark:text-error-400",
    success: "bg-success-50 text-success-700 dark:bg-success-500/10 dark:text-success-400",
    info: "bg-accent-50 text-accent-700 dark:bg-accent-500/10 dark:text-accent-300",
  }[type];

  return (
    <div className={`rounded-xl px-4 py-3 font-mono text-[13px] ${styles}`} role="alert">
      {message}
    </div>
  );
}
