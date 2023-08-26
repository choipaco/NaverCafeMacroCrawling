import ExcelJS from 'exceljs';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import { Stream } from 'stream';
import type { NextApiRequest, NextApiResponse } from 'next';

const pipeline = promisify(Stream.pipeline);


interface ExcelData {
    제목: string | null;
    내용: string | null;
}


const writeExel = async (req: NextApiRequest, res: NextApiResponse) => {
  try {
    const data: ExcelData[] = req.body.exelArr;

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Sheet 1');
    worksheet.columns = [{ header: '제목', key: '제목' }, { header: '내용', key: '내용' }];
    data.forEach((item) => {
      worksheet.addRow(item);
    });

    const excelBuffer = await workbook.xlsx.writeBuffer();

    const excelFilePath = path.join(process.cwd(), 'example.xlsx');
    await fs.promises.writeFile(excelFilePath, Buffer.from(excelBuffer)); // 변환된 Buffer 사용
    const fileName = 'downloaded.xlsx'
    const downloadFilePath = path.join(process.cwd(), fileName);

    await pipeline(
      fs.createReadStream(excelFilePath),
      fs.createWriteStream(downloadFilePath)
    );

    res.setHeader('Content-Disposition', `attachment; filename=${fileName}`);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');

    await pipeline(
      fs.createReadStream(downloadFilePath),
      res
    );

    console.log('엑셀 파일 생성 및 다운로드 완료');
    await fs.promises.unlink(excelFilePath);
    await fs.promises.unlink(downloadFilePath);
    console.log('엑셀 파일 삭제 완료');
  } catch (error) {
    console.error('오류 발생:', error);
    res.status(500).send('서버 오류');
  }
};

export default writeExel;
