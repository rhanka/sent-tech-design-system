import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { createServer } from 'node:http';
import { fileURLToPath } from 'node:url';

// Dependencies resolve by name/version, as they do on npm. Consumers install
// only their Vue/dataviz tarballs; no file overrides replace transitive pins.
export async function packedRegistry(packages) {
  const requests = new Set();
  const server = createServer(async (request, response) => {
    try {
      const path = decodeURIComponent(new URL(request.url, 'http://localhost').pathname.slice(1));
      const name = path.replace(/^tarballs\//, '');
      const packed = packages.get(name);
      if (packed && path.startsWith('tarballs/')) {
        response.setHeader('content-type', 'application/octet-stream');
        response.end(readFileSync(fileURLToPath(packed.url)));
      } else if (packed) {
        requests.add(name);
        const { manifest, url } = packed;
        const integrity = 'sha512-' + createHash('sha512').update(readFileSync(fileURLToPath(url))).digest('base64');
        response.setHeader('content-type', 'application/json');
        response.end(JSON.stringify({ name, 'dist-tags': { latest: manifest.version }, versions: {
          [manifest.version]: { ...manifest, dist: { integrity, tarball: `${address}/tarballs/${name}` } },
        } }));
      } else {
        const upstream = await fetch(`https://registry.npmjs.org/${request.url.slice(1)}`);
        response.writeHead(upstream.status, { 'content-type': upstream.headers.get('content-type') ?? 'application/json' });
        response.end(Buffer.from(await upstream.arrayBuffer()));
      }
    } catch (error) {
      response.writeHead(500); response.end(String(error));
    }
  });
  await new Promise((resolve, reject) => { server.once('error', reject); server.listen(0, '127.0.0.1', resolve); });
  const address = `http://127.0.0.1:${server.address().port}`;
  return { address, requests, close: () => new Promise(resolve => server.close(resolve)) };
}
