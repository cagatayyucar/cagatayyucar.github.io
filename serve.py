# Python ile yerel sunucu: python serve.py   ->  http://localhost:4173
# .glb / .js / .css / .html dosyalarini gzip ile sikistirarak gonderir (skid modeli ~1,7 MB iner).
import http.server, socketserver, os, webbrowser, gzip, io
ROOT = os.path.dirname(os.path.abspath(__file__))
os.chdir(ROOT)
GZ_EXT = {'.glb', '.js', '.css', '.html', '.svg', '.json'}
_cache = {}

class H(http.server.SimpleHTTPRequestHandler):
    extensions_map = {**http.server.SimpleHTTPRequestHandler.extensions_map,
        '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.html': 'text/html',
        '.glb': 'model/gltf-binary', '.png': 'image/png', '.webp': 'image/webp', '.svg': 'image/svg+xml', '': 'application/octet-stream'}

    def end_headers(self):
        self.send_header('Cache-Control', 'no-cache')
        super().end_headers()

    def do_GET(self):
        path = self.translate_path(self.path.split('?', 1)[0])
        if os.path.isdir(path):
            path = os.path.join(path, 'index.html')
        ext = os.path.splitext(path)[1].lower()
        if ext in GZ_EXT and os.path.isfile(path) and 'gzip' in self.headers.get('Accept-Encoding', ''):
            m = os.path.getmtime(path)
            hit = _cache.get(path)
            if not hit or hit[0] != m:
                raw = open(path, 'rb').read()
                buf = io.BytesIO()
                with gzip.GzipFile(fileobj=buf, mode='wb', compresslevel=6) as g:
                    g.write(raw)
                hit = _cache[path] = (m, buf.getvalue(), len(raw))
            self.send_response(200)
            self.send_header('Content-Type', self.extensions_map.get(ext, 'application/octet-stream'))
            self.send_header('Content-Encoding', 'gzip')
            self.send_header('Content-Length', str(len(hit[1])))
            self.send_header('X-File-Size', str(hit[2]))      # gercek boyut: yukleme yuzdesi icin
            self.send_header('Vary', 'Accept-Encoding')
            self.end_headers()
            self.wfile.write(hit[1])
            return
        super().do_GET()

    def log_message(self, *a):
        pass

socketserver.TCPServer.allow_reuse_address = True
with socketserver.ThreadingTCPServer(('', 4173), H) as s:
    print('Site: http://localhost:4173  (kapatmak icin Ctrl+C)')
    webbrowser.open('http://localhost:4173')
    s.serve_forever()
