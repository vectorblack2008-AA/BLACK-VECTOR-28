export default function AdminLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary">
      <div className="terminal-window max-w-sm">
        <div className="terminal-window-header">
          <span className="terminal-dot terminal-dot-red" />
          <span className="terminal-dot terminal-dot-yellow" />
          <span className="terminal-dot terminal-dot-green" />
          <span className="text-text-muted text-xs font-mono mr-auto">root@bv-admin:~# systemctl status</span>
        </div>
        <div className="p-8 text-center">
          <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-text-muted font-mono text-sm">loading admin panel...</p>
        </div>
      </div>
    </div>
  );
}
