import net from 'net';

export default function handler(req, res) {
    if (req.method === 'POST') {
        const { zpl, printer_host, printer_port } = req.body;

        const PRINTER_HOST = printer_host || '192.168.0.100';
        const PRINTER_PORT = printer_port || 9100;

        const client = new net.Socket();

        client.connect(PRINTER_PORT, PRINTER_HOST, () => {
            console.log(`Connected to printer at ${PRINTER_HOST}:${PRINTER_PORT}`);
            client.write(zpl);
            client.end();
            res.status(200).send('ZPL successfully sent to the printer');
        });

        client.on('error', (err) => {
            console.error('Printer error:', err.message);
            res.status(500).send(`Error: Unable to connect to printer at ${PRINTER_HOST}:${PRINTER_PORT}.`);
        });
    } else {
        res.status(405).send('Method Not Allowed');
    }
}