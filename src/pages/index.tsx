import styles from '@/styles/Home.module.css'
import {useState,useEffect, ChangeEvent} from 'react';
import axios from 'axios';
interface ListItem {
  id: string;
  value: string;
}
interface ExcelData {
    제목: string | null;
    내용: string | null;
}
export default function Home() {
  const [id, setId] = useState<string>('');
  const [pw, setPw] = useState<string>('');
  const [url, setUrl] = useState<string>('');
  const [num, setNum] = useState<number>(0);
  const [list, setList] = useState<ListItem[]>([]);
  const [listId, setListId] = useState<string>('');
  const [listValue, setListValue] = useState<string>('');
  const [listMax, setListMax] = useState<number>(10);
  let data: ExcelData[] = [];
  let isSubmit = false;
  const handleIdChange = (e: ChangeEvent<HTMLInputElement>) => {
    setId(e.target.value);
  };

  const handlePwChange = (e: ChangeEvent<HTMLInputElement>) => {
    setPw(e.target.value);
  };

  const handleUrlChange = (e: ChangeEvent<HTMLInputElement>) => {
    setUrl(e.target.value);
  };

  const handleNumChange = (e: ChangeEvent<HTMLInputElement>) => {
    setNum(parseInt(e.target.value));
  };
  const handleListMaxChange = (e: ChangeEvent<HTMLInputElement>) => {
    setListMax(parseInt(e.target.value));
  };

  const onClickListId = (e: React.MouseEvent<HTMLLIElement, MouseEvent>) => {
    const targetElement = e.target as HTMLLIElement;
    setListId(targetElement.id);


  };
  useEffect(()=>{
    const clickedItem = list.find(item => item.id === listId);
    if(clickedItem){
      setListValue(clickedItem.value);
    }else{
      setListValue('');
    }
  },[listId]);


  const onSelectList = () => {
    axios.post('/api/selectList',{
      url: url
    }).then((res) => {
      if(res.data.success){
        setList(res.data.list); 
        setListValue('');
        setListId('');
        
      }
    })
  }

  const onExtractExel = async () => {
    try {
      const response = await axios.post('/api/extractExel', {
        id: id,
        pw: pw,
        url: url,
        listId: listId,
        likes: num,
        listMax: listMax
      });
  
      if (response.data.success) {
        setListValue('');
        setListId('');
        data = response.data.exelArr;
  
        const downloadResponse = await axios.post('/api/writeExel', {
          exelArr: data
        }, {
          responseType: 'blob' // Important: specify response type as 'blob'
        });
  
        // Create a Blob with the response data
        const blob = new Blob([downloadResponse.data], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  
        // Create a temporary URL for the Blob
        const url = window.URL.createObjectURL(blob);
  
        // Create a link and simulate a click to download the file
        const a = document.createElement('a');
        a.href = url;
        a.download = 'downloaded.xlsx';
        a.click();
  
        // Clean up the temporary URL
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('다운로드 오류:', error);
    }
  };
  
  return (
    <>
      <div>
        <div>
          <input type='text' value={id} onChange={handleIdChange} placeholder='naver id'/>
          <input type='password' value={pw} onChange={handlePwChange} placeholder='naver password'/>
        </div>
        <input type='text' value={url} onChange={handleUrlChange} placeholder='naver cafe URL'/>
        <button onClick={onSelectList}>리스트</button>
        <div>
          <div>{listValue}</div>
          <ul>
            {list.map((listItem:ListItem)=>{
              return(
                <li onClick={onClickListId} id={`${listItem.id}`}>{listItem.value}</li>
              )
            })}
          </ul>
        </div>
        <div>
          조회수<input type='number' min={0} value={num} onChange={handleNumChange} />
        </div>
        <div>
          최대 개수<input type='number' min={0} value={listMax} onChange={handleListMaxChange} />
        </div>

        <button onClick={onExtractExel}>값 추출하기</button>
      </div>
    </>
  )
}
