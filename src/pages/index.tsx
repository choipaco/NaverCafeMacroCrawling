import styles from "@/styles/Home.module.css";
import { useState, useEffect, ChangeEvent } from "react";
import axios from "axios";
interface ListItem {
  id: string;
  value: string;
}
interface ExcelData {
  제목: string | null;
  내용: string | null;
}
export default function Home() {
  const [id, setId] = useState<string>("");
  const [pw, setPw] = useState<string>("");
  const [url, setUrl] = useState<string>("");
  const [num, setNum] = useState<number>(0);
  const [list, setList] = useState<ListItem[]>([]);
  const [listId, setListId] = useState<string>("");
  const [listValue, setListValue] = useState<string>("");
  const [listMax, setListMax] = useState<number>(10);
  let data: ExcelData[] = [];

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
  useEffect(() => {
    const clickedItem = list.find((item) => item.id === listId);
    if (clickedItem) {
      setListValue(clickedItem.value);
    } else {
      setListValue("");
    }
  }, [listId]);

  const onSelectList = () => {
    if (!id) {
      return alert("네이버 아이디를 입력해주세요!");
    }
    if (!pw) {
      return alert("네이버 비밀번호를 입력해주세요!");
    }
    if (!url) {
      return alert("네이버카페 URL를 입력해주세요!");
    }

    axios
      .post("/api/selectList", {
        url: url,
      })
      .then((res) => {
        if (res.data.success) {
          setList(res.data.list);
          setListValue("");
          setListId("");
        }
      });
  };

  const onExtractExel = async () => {
    try {
      const response = await axios.post("/api/extractExel", {
        id: id,
        pw: pw,
        url: url,
        listId: listId,
        likes: num,
        listMax: listMax,
      });

      if (response.data.success) {
        setListValue("");
        setListId("");
        data = response.data.exelArr;

        const downloadResponse = await axios.post(
          "/api/writeExel",
          {
            exelArr: data,
          },
          {
            responseType: "blob",
          }
        );

        const blob = new Blob([downloadResponse.data], {
          type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });

        const url = window.URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = "downloaded.xlsx";
        a.click();

        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error("다운로드 오류:", error);
    }
  };

  return (
    <div className={styles.main}>
      <div className={styles.right}>
        <div className={styles.naverAuth}>
          <div>naverID</div>
          <input
            className={styles.inputStyles}
            type="text"
            value={id}
            onChange={handleIdChange}
            placeholder="naver id"
          />
          <div>naverPW</div>
          <input
            className={styles.inputStyles}
            type="password"
            value={pw}
            onChange={handlePwChange}
            placeholder="naver password"
          />
          <div>naverURL</div>
          <input
            className={styles.inputStyles}
            type="text"
            value={url}
            onChange={handleUrlChange}
            placeholder="naver cafe URL"
          />
          <button className={styles.naverBtn} onClick={onSelectList}>
            리스트
          </button>
        </div>
        <div className={styles.naverContainer}>
          <div className={styles.naverCon}>
            <div>조회수</div>
            <input
              type="number"
              min={0}
              value={num}
              onChange={handleNumChange}
              className={styles.inputStyles}
            />
          </div>
          <div className={styles.naverCon}>
            최대 개수
            <input
              type="number"
              min={0}
              value={listMax}
              onChange={handleListMaxChange}
              className={styles.inputStyles}
            />
          </div>

          <button onClick={onExtractExel} className={styles.naverBtn}>값 추출하기</button>
        </div>
      </div>
      <div className={styles.left}>
        <h3 className={styles.ListTitle}>📖{listValue}</h3>
        <ul className={styles.over}>
          {list.map((listItem: ListItem) => {
            return (
              <li onClick={onClickListId} id={`${listItem.id}`}>
                {listItem.value}
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
