#!/usr/bin/env python3
"""学习平台服务端：静态托管 + 学习数据记忆（/api/state）
零依赖，纯标准库。启动: python3 server.py  （默认 0.0.0.0:8000）
数据文件: data/state.json；每次覆盖前自动备份到 data/backups/（保留最近 20 份）
"""
import json
import os
import time
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

ROOT = Path(__file__).resolve().parent
DATA = ROOT / "data"
STATE = DATA / "state.json"
BACKUPS = DATA / "backups"
PORT = int(os.environ.get("PORT", "8000"))
KEEP_BACKUPS = 20


class Handler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    # ---------- API ----------
    def _json(self, code, payload):
        body = payload if isinstance(payload, bytes) else json.dumps(payload, ensure_ascii=False).encode("utf-8")
        self.send_response(code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Cache-Control", "no-store")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def do_GET(self):
        if self.path.split("?")[0] == "/api/state":
            try:
                self._json(200, STATE.read_bytes())
            except FileNotFoundError:
                self._json(200, b"null")
            except Exception as e:  # 磁盘问题等
                self._json(500, {"error": str(e)})
            return
        super().do_GET()

    def do_POST(self):
        if self.path.split("?")[0] != "/api/state":
            self._json(404, {"error": "not found"})
            return
        try:
            length = int(self.headers.get("Content-Length") or 0)
            raw = self.rfile.read(length)
            json.loads(raw.decode("utf-8"))  # 只收合法 JSON
        except Exception:
            self._json(400, {"error": "bad json"})
            return
        try:
            DATA.mkdir(exist_ok=True)
            if STATE.exists():  # 覆盖前备份
                BACKUPS.mkdir(exist_ok=True)
                ts = time.strftime("%Y%m%d-%H%M%S")
                (BACKUPS / f"state-{ts}.json").write_bytes(STATE.read_bytes())
                olds = sorted(BACKUPS.glob("state-*.json"))
                for old in olds[:-KEEP_BACKUPS]:
                    old.unlink()
            tmp = STATE.with_suffix(".tmp")
            tmp.write_bytes(raw)
            os.replace(tmp, STATE)  # 原子写入，断电也不损坏
            self._json(200, {"ok": True})
        except Exception as e:
            self._json(500, {"error": str(e)})

    def log_message(self, fmt, *args):
        pass  # 安静模式


if __name__ == "__main__":
    print(f"📚 学习平台已启动 → http://0.0.0.0:{PORT}  (局域网设备也可访问)")
    print(f"   数据记忆: {STATE}")
    ThreadingHTTPServer(("0.0.0.0", PORT), Handler).serve_forever()
