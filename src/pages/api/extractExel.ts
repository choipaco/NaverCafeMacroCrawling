import puppeteer from 'puppeteer';
import clipboardy from 'clipboardy';
import type { NextApiRequest, NextApiResponse } from 'next'



const extractExel = async (req: NextApiRequest, res: NextApiResponse) => {

    const { id,pw,listId,likes,url,listMax } = await req.body;
    let cnt = 1;
    let listCnt = 2;
    const max = 10;
    let maxCnt = 1;
    let isroof = false;
    let exelArr: { 제목: string | null, 내용: string | null }[] = [];
    let exelObj:{제목: string | null, 내용: string | null} = {제목:"", 내용:""}
    
    const numbers = async (lookText: string | null) => {
        let looTexts = 0;
        if (lookText) { // lookText가 null이 아닐 때만 실행
          if (lookText.includes('만')) {
            lookText = await lookText.slice(0, -1); // 수정된 문자열을 다시 lookText에 할당해야 함
            if (lookText.includes('.')) {
              lookText = await lookText.replace(/[.]/g, ''); // 수정된 문자열을 다시 lookText에 할당해야 함
            }
            const parsedNumber = await parseInt(lookText);
            looTexts = await isNaN(parsedNumber) ? 0 : parsedNumber;
            looTexts *=await 10000;
          } else if (lookText.includes(',')) {
            lookText =await lookText.replace(/[,]/g, ''); // 수정된 문자열을 다시 lookText에 할당해야 함
            const parsedNumber =await parseInt(lookText);
            looTexts =await isNaN(parsedNumber) ? 0 : parsedNumber;
          }else{
            const parsedNumber =await parseInt(lookText);
            looTexts =await isNaN(parsedNumber) ? 0 : parsedNumber;
          }
        }
        return await looTexts;
      }
      
    const loginId = async () => {
        clipboardy.writeSync(id);
        await page.click("#id");
        await page.keyboard.down('Control'); // Ctrl 키 누름
        await page.keyboard.press('KeyV'); // V 키 입력 (붙여넣기)
        await page.keyboard.up('Control'); // Ctrl 키 뗌
    }

    const loginPw = async () => {
        clipboardy.writeSync(pw);
        await page.click("#pw");
        await page.keyboard.down('Control'); // Ctrl 키 누름
        await page.keyboard.press('KeyV'); // V 키 입력 (붙여넣기)
        await page.keyboard.up('Control'); // Ctrl 키 뗌
    }

    const browser = await puppeteer.launch({
        headless: false,
    });

    const page = await browser.newPage();
    await page.setViewport({
        width: 1920,
        height: 1080  
    });
    


// 로그인
    await page.goto("https://nid.naver.com/nidlogin.login?mode=form&url=https://www.naver.com/");
    await page.waitForSelector('#id'); // 해당 요소가 로드될 때까지 대기

    await loginId();

    await loginPw();
    
    await page.waitForTimeout(1000);
    page.click(".btn_login");
    await page.waitForNavigation();
    
//카페 진입
    await page.goto(url);
    await page.waitForSelector('.cafe-menu-list'); 
    
    await page.click(`#${listId}`);

    //게시판을 list형태로 변경
    const sortList = async() => {
        const frames = page.frames(); // 페이지의 모든 프레임 가져오기

        for (const frame of frames) {
            if (frame.name() === 'cafe_main') { // 내부 프레임의 이름을 확인하여 필요한 프레임을 선택
                const aTagSelector = 'a.sort_list'; // 대상 <a> 태그의 선택자로 변경
                await frame.waitForSelector(aTagSelector);
                await frame.click(aTagSelector); // <a> 태그 클릭
                break;
            }
        }
    }
    await sortList();
    await page.waitForTimeout(1000);
    //게시판 탐색
    isroof = await true;
    while(isroof){
      if(maxCnt > listMax){
        isroof = await false;
        break;
      }
        const frames = await page.frames();
        for (const frame of frames) {
            if (frame.name() === 'cafe_main') {
              const look = await frame.$(`#main-area div:nth-child(4) table tbody tr:nth-child(${cnt}) td.td_view`);

              if (look) {
                const lookText = await look.evaluate(element => element.textContent);

                const lookValue = await numbers(lookText);

                if (lookValue >= likes) {
                  const isListName = await frame.$(`#main-area div:nth-child(4) table tbody tr:nth-child(${cnt}) td.td_article div.board-list div.inner_list a.article`);

                  if (isListName) {
                    const listName = await isListName.evaluate(element => element.textContent); // 제목
                    const listTitle = listName === null ? '' : listName.replace(/\s+/g, ' ').trim();
                    //await console.log(listTitle); // 제목출력
                    exelObj.제목 = await listTitle;

                    await frame.click(`#main-area div:nth-child(4) table tbody tr:nth-child(${cnt}) td.td_article div.board-list div.inner_list a.article`);
                    await page.waitForTimeout(1000);
                    const contentFrames = await page.frames();
                    for(const conFrame of contentFrames){
                        if(conFrame.name() === 'cafe_main'){
                            const content = await conFrame.$(`#app > div > div > div.ArticleContentBox > div.article_container > div.article_viewer > div > div.content.CafeViewer > div > div`);
                            if(content){
                                const contents = await content.evaluate(element => element.textContent); // 내용
                                const listContents = contents;
                                //await console.log(listContents); // 내용 출력
                                exelObj.내용 = await listContents;

                                exelArr.push({ ...exelObj });

                                maxCnt += await 1;
                            }
                        }
                    }
                    await frame.evaluate(() => {
                        history.back();
                    });
                    await page.waitForTimeout(500);

                  }
                }
                cnt += await 1; // look 요소가 있을 때만 cnt 증가
                
              } else {
                listCnt+= await 1;
                if(listCnt > max){
                  listCnt = await 2;
                  await frame.click(`#main-area > div.prev-next > a.pgR`);
                }else{
                  await frame.click(`#main-area > div.prev-next > a:nth-child(${listCnt})`);
                }
                await page.waitForTimeout(500);
                cnt = await 1;
              }
            }
          }
    }
    await page.close();
    return res.json({
      success: true,
      exelArr: exelArr
    });
  }
  export default extractExel;