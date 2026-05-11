const { spawn } = require('child_process');
const os = require('os');

const host = process.env.WEB_HOST || '0.0.0.0';
const port = process.env.PORT || process.env.WEB_PORT || '3000';
const extraArgs = process.argv.slice(2);

function getNetworkUrls() {
  return Object.values(os.networkInterfaces())
    .flat()
    .filter((network) => network && network.family === 'IPv4' && !network.internal)
    .map((network) => `http://${network.address}:${port}`);
}

const networkUrls = getNetworkUrls();

console.log('');
console.log('M3 Bank frontend');
console.log(`- Local:   http://localhost:${port}`);

if (networkUrls.length > 0) {
  networkUrls.forEach((url) => {
    console.log(`- Celular: ${url}`);
  });
} else {
  console.log('- Celular: nenhum IP de rede local encontrado');
}

console.log('');
console.log('Use o link "Celular" em dispositivos conectados na mesma rede.');
console.log('');

const nextBin = require.resolve('next/dist/bin/next');
const child = spawn(process.execPath, [nextBin, 'dev', '-H', host, '-p', port, ...extraArgs], {
  stdio: 'inherit'
});

child.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal);
    return;
  }

  process.exit(code ?? 0);
});
