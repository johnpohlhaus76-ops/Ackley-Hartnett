import { writeFileSync, existsSync, readFileSync } from 'fs';
import { join } from 'path';

function getMachinesPath() {
  const paths = [
    join(process.cwd(), 'public', 'data', 'machines-sold.json'),
    '/Users/ptg/Ackley-Hartnett/public/data/machines-sold.json',
  ];
  return paths.find((p) => existsSync(p)) || paths[0];
}

function csvToJson(csv: string) {
  const lines = csv.trim().split('\n');
  const headers = lines[0].split(',').map((h) => h.trim().replace(/^"|"$/g, ''));
  const data = [];

  for (let i = 1; i < lines.length; i++) {
    const obj: any = {};
    const currentLine = lines[i].split(',').map((v) => v.trim().replace(/^"|"$/g, ''));

    for (let j = 0; j < headers.length; j++) {
      obj[headers[j]] = currentLine[j];
    }
    data.push(obj);
  }

  return data;
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const mode = formData.get('mode') || 'merge'; // merge or replace

    if (!file) {
      return Response.json({ success: false, error: 'No file provided' }, { status: 400 });
    }

    const content = await file.text();
    let importedData = [];

    // Parse based on file type
    if (file.name.endsWith('.csv')) {
      importedData = csvToJson(content);
    } else if (file.name.endsWith('.json')) {
      importedData = JSON.parse(content);
    } else {
      return Response.json(
        { success: false, error: 'File must be CSV or JSON' },
        { status: 400 }
      );
    }

    const machinesPath = getMachinesPath();
    let orders = JSON.parse(readFileSync(machinesPath, 'utf-8'));

    if (mode === 'merge') {
      // Merge: add new records, update existing ones
      for (const newOrder of importedData) {
        const sn = newOrder['Serial Number'] || newOrder.serialNumber;
        const index = orders.findIndex((o: any) => o['Serial Number'] === sn);
        if (index >= 0) {
          orders[index] = { ...orders[index], ...newOrder };
        } else {
          orders.push(newOrder);
        }
      }
    } else {
      // Replace: overwrite entire dataset
      orders = importedData;
    }

    writeFileSync(machinesPath, JSON.stringify(orders, null, 2));

    return Response.json({
      success: true,
      message: `Imported ${importedData.length} orders`,
      mode,
      totalOrders: orders.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    return Response.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  return Response.json({
    success: true,
    message: 'Order Import API',
    usage: {
      method: 'POST (multipart/form-data)',
      parameters: {
        file: 'CSV or JSON file',
        mode: 'merge (default) or replace',
      },
      supportedFormats: ['CSV', 'JSON'],
      example: 'POST /api/import/orders with file + mode',
    },
  });
}
