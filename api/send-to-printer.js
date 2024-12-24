import net from 'net';

export default async function handler(req, res) {
    if (req.method === 'POST') {
        const { zpl, printer_host, printer_port } = req.body;

        const PRINTER_HOST = printer_host || '100.102.217.25';
        const PRINTER_PORT = printer_port || 9100;

        const client = new net.Socket();

        // Устанавливаем таймаут для подключения
        client.setTimeout(5000); // Таймаут 5 секунд

        client.connect(PRINTER_PORT, PRINTER_HOST, () => {
            console.log(`Connected to printer at ${PRINTER_HOST}:${PRINTER_PORT}`);
            client.write(zpl, () => {
                client.end();
                res.status(200).send('ZPL successfully sent to the printer');
            });
        });

        // Обработка таймаута
        client.on('timeout', () => {
            console.error('Connection to printer timed out');
            client.destroy();
            res.status(504).send('Error: Connection to printer timed out');
        });

        // Обработка ошибок
        client.on('error', (err) => {
            console.error('Printer error:', err.message);
            client.destroy();
            res.status(500).send(`Error: Unable to connect to printer at ${PRINTER_HOST}:${PRINTER_PORT}.`);
        });
    } else {
        res.status(405).send('Method Not Allowed');
    }
}
