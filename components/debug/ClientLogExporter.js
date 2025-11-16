import React, { useEffect, useState } from 'react';

const installClientLogger = () => {
  if (typeof window === 'undefined') return;
  if (window.__clientLogsInstalled) return;
  window.__clientLogsInstalled = true;
  window.__clientLogs = window.__clientLogs || [];
  const methods = ['log', 'info', 'warn', 'error', 'debug'];
  methods.forEach((m) => {
    const orig = console[m] ? console[m].bind(console) : (...a) => {};
    console[`__orig_${m}`] = orig;
    console[m] = function (...args) {
      try {
        const payload = { ts: new Date().toISOString(), level: m, args: args.map((a) => {
          try { return typeof a === 'string' ? a : JSON.stringify(a); } catch(e) { return String(a); }
        }) };
        window.__clientLogs.push(payload);
        if (window.__clientLogs.length > 2000) window.__clientLogs.shift();
      } catch (e) {}
      orig(...args);
    };
  });
};

const downloadTextFile = (filename, text) => {
  const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
};

const ClientLogExporter = () => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    installClientLogger();
    const interval = setInterval(() => {
      setCount((window.__clientLogs || []).length);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleDownload = () => {
    const logs = window.__clientLogs || [];
    const lines = logs.map((l) => `${l.ts} [${l.level}] ${l.args.join(' ')}\n`).join('');
    downloadTextFile(`client-logs-${new Date().toISOString()}.txt`, lines);
  };

  return (
    <div style={{display: 'flex', gap: 8, alignItems: 'center'}}>
      <button type="button" onClick={handleDownload} style={{padding: '6px 10px', borderRadius: 6}}>
        Download client logs ({count})
      </button>
    </div>
  );
};

export default ClientLogExporter;
