#!/usr/bin/env python3
"""
LaTeX Live Preview Server
Automatically compiles LaTeX and serves live-updating preview
"""

import http.server
import socketserver
import os
import time
import threading
import subprocess
from pathlib import Path
import json
import hashlib

PORT = 8082
LATEX_FILE = "main.tex"
PDF_FILE = "NormalResume.pdf"

class LiveReloadHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        if self.path == '/status':
            # Send thte last modified time of the PDF
            try:
                mtime = os.path.getmtime(PDF_FILE)
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(json.dumps({'mtime': mtime}).encode())
            except:
                self.send_response(404)
                self.end_headers()
        else:
            # Serve files normally
            super().do_GET()
    
    def end_headers(self):
        # Add CORS headers for all requests
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        self.send_header('Pragma', 'no-cache')
        self.send_header('Expires', '0')
        super().end_headers()

class LaTeXWatcher:
    def __init__(self):
        self.last_mtime = 0
        self.last_hash = ""
        self.force_initial_compile = True
        
    def get_file_hash(self, filepath):
        """Get MD5 hash of file content for more reliable change detection"""
        try:
            with open(filepath, 'rb') as f:
                return hashlib.md5(f.read()).hexdigest()
        except:
            return ""
            
    def watch_and_compile(self):
        """Watch for LaTeX file changes and compile automatically"""
        print(f"🔍 Starting file watcher for {LATEX_FILE}...")
        
        # Initial compilation
        if os.path.exists(LATEX_FILE) and self.force_initial_compile:
            print(f"📝 Initial compilation of {LATEX_FILE}...")
            self.compile_latex()
            self.last_mtime = os.path.getmtime(LATEX_FILE)
            self.last_hash = self.get_file_hash(LATEX_FILE)
            self.force_initial_compile = False
            
        while True:
            try:
                if not os.path.exists(LATEX_FILE):
                    time.sleep(0.2)
                    continue
                    
                current_mtime = os.path.getmtime(LATEX_FILE)
                current_hash = self.get_file_hash(LATEX_FILE)
                
                # Check both mtime and content hash for more reliable detection
                if (current_mtime > self.last_mtime) or (current_hash != self.last_hash):
                    print(f"📝 Change detected in {LATEX_FILE} (mtime: {current_mtime:.2f}, hash changed: {current_hash != self.last_hash})")
                    self.last_mtime = current_mtime
                    self.last_hash = current_hash
                    self.compile_latex()
                    
            except Exception as e:
                print(f"Error watching file: {e}")
            time.sleep(0.2)  # Check every 200ms for faster detection
            
    def compile_latex(self):
        """Compile the LaTeX file"""
        try:
            result = subprocess.run(
                ['pdflatex', '-interaction=nonstopmode', LATEX_FILE],
                capture_output=True,
                text=True,
                cwd='.'
            )
            if result.returncode == 0:
                print(f"✅ Successfully compiled to {PDF_FILE}")
            else:
                print(f"⚠️ Compilation had warnings/errors:")
                # Print first few lines of error for debugging
                error_lines = result.stdout.split('\n')[:5]
                for line in error_lines:
                    if line.strip():
                        print(f"   {line}")
        except Exception as e:
            print(f"❌ Compilation failed: {e}")

def create_html():
    """Create the live preview HTML"""
    html_content = '''<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>LaTeX Live Preview</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #1a1a1a;
            height: 100vh;
            display: flex;
            flex-direction: column;
            overflow: hidden;
        }
        
        .header {
            background: #2d2d2d;
            color: white;
            padding: 12px 20px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            box-shadow: 0 2px 10px rgba(0,0,0,0.3);
        }
        
        .header h1 {
            font-size: 18px;
            font-weight: 400;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .status {
            display: flex;
            align-items: center;
            gap: 10px;
            font-size: 13px;
            color: #aaa;
        }
        
        .pulse {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: #4ade80;
            animation: pulse 1.5s infinite;
        }
        
        @keyframes pulse {
            0%, 100% { opacity: 1; transform: scale(1); }
            50% { opacity: 0.6; transform: scale(1.1); }
        }
        
        .pdf-container {
            flex: 1;
            position: relative;
            background: #f5f5f5;
            overflow: hidden;
        }
        
        #pdf-embed {
            width: 100%;
            height: 100%;
            border: none;
        }
        
        .update-flash {
            position: absolute;
            top: 10px;
            right: 10px;
            background: #4ade80;
            color: white;
            padding: 6px 12px;
            border-radius: 4px;
            font-size: 12px;
            opacity: 0;
            transition: opacity 0.2s;
            pointer-events: none;
        }
        
        .update-flash.show {
            opacity: 1;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>
            <span>📄</span>
            <span>LaTeX Live Preview - main.tex</span>
        </h1>
        <div class="status">
            <div class="pulse"></div>
            <span>Live • Auto-updating</span>
        </div>
    </div>
    
    <div class="pdf-container">
        <embed id="pdf-embed" src="main.pdf" type="application/pdf">
        <div class="update-flash" id="flash">Updated!</div>
    </div>
    
    <script>
        let lastMtime = null;
        let isFirstLoad = true;
        const pdfEmbed = document.getElementById('pdf-embed');
        const flash = document.getElementById('flash');
        
        async function checkForUpdates() {
            try {
                const response = await fetch('http://localhost:8081/status');
                const data = await response.json();
                
                if (lastMtime && data.mtime !== lastMtime) {
                    // PDF has been updated, reload it
                    updatePDF();
                }
                lastMtime = data.mtime;
            } catch (error) {
                console.log('Checking for updates...');
            }
        }
        
        function updatePDF() {
            // Store scroll position if possible
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            
            // Force reload by changing src
            const timestamp = new Date().getTime();
            pdfEmbed.src = `main.pdf?t=${timestamp}`;
            
            // Flash update indicator
            if (!isFirstLoad) {
                flash.classList.add('show');
                setTimeout(() => {
                    flash.classList.remove('show');
                }, 500);
            }
            isFirstLoad = false;
            
            // Restore scroll position
            setTimeout(() => {
                window.scrollTo(0, scrollTop);
            }, 100);
        }
        
        // Check for updates frequently
        setInterval(checkForUpdates, 250); // Check 4 times per second
        
        // Initial check
        checkForUpdates();
    </script>
</body>
</html>'''
    
    with open('live_preview.html', 'w') as f:
        f.write(html_content)
    print(f"📄 Created live_preview.html")

def main():
    # Create HTML file
    create_html()
    
    # Start LaTeX watcher in background thread
    watcher = LaTeXWatcher()
    watcher_thread = threading.Thread(target=watcher.watch_and_compile, daemon=True)
    watcher_thread.start()
    
    # Start HTTP server
    with socketserver.TCPServer(("", PORT), LiveReloadHandler) as httpd:
        print(f"\n🚀 LaTeX Live Preview Server running!")
        print(f"📍 Open: http://localhost:{PORT}/live_preview.html")
        print(f"� Normal Resume Server - Port {PORT}")
        print(f"�📝 Watching: {LATEX_FILE}")
        print(f"⚡ The preview will update automatically when you save changes")
        print(f"\nPress Ctrl+C to stop the server\n")
        
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n👋 Server stopped")

if __name__ == "__main__":
    main()
