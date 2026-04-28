import fs from 'fs';
import forge from 'node-forge';

const certDir = './cert';
if (!fs.existsSync(certDir)) {
  fs.mkdirSync(certDir, { recursive: true });
}

const keys = forge.pki.rsa.generateKeyPair(2048);

const cert = forge.pki.createCertificate();
cert.publicKey = keys.publicKey;
cert.serialNumber = '01';
cert.validity.notBefore = new Date();
cert.validity.notAfter = new Date();
cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 1);

const attrs = [{
  name: 'commonName',
  value: 'localhost'
}, {
  name: 'countryName',
  value: 'CN'
}, {
  shortName: 'ST',
  value: 'Beijing'
}, {
  name: 'localityName',
  value: 'Beijing'
}, {
  name: 'organizationName',
  value: 'Localhost'
}, {
  shortName: 'OU',
  value: 'Development'
}];

cert.setSubject(attrs);
cert.setIssuer(attrs);
cert.setExtensions([{
  name: 'basicConstraints',
  cA: true
}, {
  name: 'keyUsage',
  keyCertSign: true,
  digitalSignature: true,
  nonRepudiation: true,
  keyEncipherment: true,
  dataEncipherment: true
}, {
  name: 'extKeyUsage',
  serverAuth: true,
  clientAuth: true
}, {
  name: 'subjectAltName',
  altNames: [{
    type: 2,
    value: 'localhost'
  }, {
    type: 7,
    ip: '127.0.0.1'
  }]
}]);

cert.sign(keys.privateKey, forge.md.sha256.create());

const pemKey = forge.pki.privateKeyToPem(keys.privateKey);
const pemCert = forge.pki.certificateToPem(cert);

fs.writeFileSync('./cert/localhost.key', pemKey);
fs.writeFileSync('./cert/localhost.crt', pemCert);

console.log('证书生成成功！');
console.log('Key: cert/localhost.key');
console.log('Cert: cert/