const express = require('express');
const bodyParser = require('body-parser');
const net = require('net'); // Для отправки данных на принтер
const path = require('path');
const app = express();
const port = 3000;

app.use(bodyParser.json());

// Обработчик GET-запроса для отдачи HTML-страницы
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Функция для генерации ZPL-кода
function generateZPL(customer_name, order_number, boxNumber, total_boxes) {
    return `
^XA
^LL1200
^PW1000
^FO680,50^A0R,100,100^FDDelayed delivery^FS
^FO550,50^A0R,90,90^FDName: ${customer_name}^FS
^FO400,50^A0R,90,90^FDOrder: ${order_number}^FS
^FO350,50^A0R,40,40^FD_______________________^FS
^FO150,50^A0R,70,70^FDBox ${boxNumber} from ${total_boxes}^FS
^XZ
    `;
}

// Маршрут для генерации ZPL
app.post('/print', (req, res) => {
    const { customer_name, order_number, total_boxes, boxes_in_order, current_box } = req.body;

    let zpl = '';

    if (current_box) {
        zpl += generateZPL(customer_name, order_number, current_box, total_boxes);
    } else {
        for (let i = 1; i <= boxes_in_order; i++) {
            zpl += generateZPL(customer_name, order_number, i, total_boxes);
        }
    }

    res.setHeader('Content-Type', 'text/plain');
    res.send(zpl);
});

// Маршрут для отправки ZPL на принтер
app.post('/send-to-printer', (req, res) => {
    const { zpl, printer_host, printer_port } = req.body;

    const PRINTER_HOST = printer_host || '192.168.0.100'; // Значение по умолчанию
    const PRINTER_PORT = printer_port || 9100; // Значение по умолчанию

    const client = new net.Socket();
    client.connect(PRINTER_PORT, PRINTER_HOST, () => {
        console.log(`Соединение с принтером ${PRINTER_HOST}:${PRINTER_PORT} установлено`);
        client.write(zpl);
        client.end();
        res.status(200).send('Данные успешно отправлены на принтер');
    });

    client.on('error', (err) => {
        console.error('Ошибка при отправке на принтер:', err.message);
        res.status(500).send(`Ошибка отправки на принтер: ${err.message}`);
    });
});

// Запуск сервера
app.listen(port, () => {
    console.log(`Сервер запущен на http://localhost:${port}`);
});
