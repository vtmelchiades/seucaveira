"""Launcher for cyber-doctor (赛博华佗).

Runs the original app.py Gradio demo but with settings that work in a
container / remote-preview environment:

* binds to 0.0.0.0 so the preview proxy can reach it
* uses the PORT env var (default 10032)
* keeps gradio's own host/origin checks permissive for proxied hosts
"""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import app  # noqa: E402  (builds the Gradio Blocks as `app.demo`)

if __name__ == "__main__":
    port = int(os.environ.get("PORT", "10032"))
    app.demo.launch(
        server_name="0.0.0.0",
        server_port=port,
        share=False,
        show_api=False,
    )
