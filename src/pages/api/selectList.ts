import puppeteer from 'puppeteer'
import type { NextApiRequest, NextApiResponse } from 'next'

interface ExtractedValue {
    id: string; // id 값은 문자열로 가정
    value: string;
}

const selectList = async (req: NextApiRequest, res: NextApiResponse) => {
    const { url } = req.body;
    const browser = await puppeteer.launch({
        headless: false,
    });

    const page = await browser.newPage();
    await page.setViewport({
        width: 1920,
        height: 1080  
    });
    
    await page.goto(url);
    await page.waitForSelector('.cafe-menu-list'); // 해당 요소가 로드될 때까지 대기
    
    // .cafe-menu-list 안에 있는 모든 <a> 태그를 추출
    const aElements = await page.$$('.cafe-menu-list li a');
    
    const extractedValues: ExtractedValue[] = []; // 추출한 값을 저장할 객체 배열
    
    if (aElements.length > 0) {
        await Promise.all(aElements.map(async aElement => {
            const extractedValue = await page.evaluate(el => el.textContent, aElement);
            const id = await page.evaluate(el => el.getAttribute('id'), aElement); // id 속성 추출
            if (extractedValue) {
                extractedValues.push({
                    id: id || '', // id 값이 없으면 빈 문자열
                    value: extractedValue.trim()
                });
            }
        }));
        await browser.close();
        await browser.close();
        if (extractedValues.length > 0) {
            return res.json({
              success: true,
              list: extractedValues
            })
        } else {
          return res.json({
            success: true,
            list: '실패'
          })
        }
    } else {
        console.log('No <a> elements found');
    }
    
    
}

export default selectList;
