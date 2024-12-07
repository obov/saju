import { useState } from "react";
import classNames from "classnames";
import useSajuData from "./hooks/useSajuData";

function App() {
  const sajuData = useSajuData();
  const [timeGan, setTimeGan] = useState(""); // 시간 천간
  const [timeZhi, setTimeZhi] = useState(""); // 시간 지지
  const [yearGan, setYearGan] = useState(""); // 년간
  const [yearZhi, setYearZhi] = useState(""); // 년지
  const [monthGan, setMonthGan] = useState(""); // 월간
  const [monthZhi, setMonthZhi] = useState(""); // 월지
  const [dayGan, setDayGan] = useState(""); // 일간
  const [dayZhi, setDayZhi] = useState(""); // 일지

  // // 개발용 초기값 설정
  // useEffect(() => {
  //   const nameInput = document.querySelector('input[name="name"]');
  //   const maleRadio = document.querySelector('input[value="male"]');
  //   const birthdateInput = document.querySelector('input[name="birthdate"]');
  //   const hourInput = document.querySelector('input[name="hour"]');

  //   if (nameInput) nameInput.value = "홍길동";
  //   if (maleRadio) maleRadio.checked = true;
  //   if (birthdateInput) birthdateInput.value = "880305";
  //   if (hourInput) hourInput.value = "23";
  // }, []); // 컴포넌트 마운트 시 한 번만 실행

  const handleSubmit = (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const gender = formData.get("gender");

    if (!gender) {
      alert("성별을 선택해주세요.");
      return;
    }

    // 생년월일 검증
    const birthdate = e.target.birthdate.value;
    if (birthdate.length !== 6) {
      alert("생년월일을 6자리로 입력해주세요.");
      return;
    }

    // YYMMDD 형식을 YYYY-MM-DD로 변환
    const fullDate = `19${birthdate.slice(0, 2)}-${birthdate.slice(
      2,
      4
    )}-${birthdate.slice(4, 6)}`;

    // 데이터 존재 여부 검증
    if (!sajuData || !sajuData[fullDate]) {
      alert("해당 날짜의 사주 데이터가 없습니다.");
      return;
    }

    // 사주 데이터 설정
    const data = sajuData[fullDate];
    setYearGan(data.yearGan);
    setYearZhi(data.yearZhi);
    setMonthGan(data.monthGan);
    setMonthZhi(data.monthZhi);
    setDayGan(data.dayGan);
    setDayZhi(data.dayZhi);

    // 시간 처리
    const hour = parseInt(e.target.hour.value);
    if (isNaN(hour)) {
      setTimeGan(""); // 시간 천간 초기화
      setTimeZhi(""); // 시간 지지 초기화
      return;
    }

    // 시주 계산
    const timeZhi = getTimeZhi(hour);
    const timeGan = getTimeGan(data.dayGan, timeZhi);
    setTimeZhi(timeZhi);
    setTimeGan(timeGan);
  };

  // 시간에 따른 지지(地支) 결정
  const getTimeZhi = (hour) => {
    const timeRanges = [
      { start: 23, end: 1, zhi: "子" },
      { start: 1, end: 3, zhi: "丑" },
      { start: 3, end: 5, zhi: "寅" },
      { start: 5, end: 7, zhi: "卯" },
      { start: 7, end: 9, zhi: "辰" },
      { start: 9, end: 11, zhi: "巳" },
      { start: 11, end: 13, zhi: "午" },
      { start: 13, end: 15, zhi: "未" },
      { start: 15, end: 17, zhi: "申" },
      { start: 17, end: 19, zhi: "酉" },
      { start: 19, end: 21, zhi: "戌" },
      { start: 21, end: 23, zhi: "亥" },
    ];

    // 23-1시 처리를 위한 특별 케이스
    if (hour >= 23 || hour < 1) return "子";

    const timeSlot = timeRanges.find(
      (range) => hour >= range.start && hour < range.end
    );
    return timeSlot ? timeSlot.zhi : "";
  };

  // 일간에 따른 시간 천간(天干) 결정
  const getTimeGan = (dailyGan, timeZhi) => {
    if (!dailyGan || !timeZhi) return "";

    // 일간별 시간 천간의 시작값 매핑
    const startingGan = {
      甲: "甲",
      乙: "丙",
      丙: "戊",
      丁: "庚",
      戊: "壬",
      己: "甲",
      庚: "丙",
      辛: "戊",
      壬: "庚",
      癸: "壬",
    };

    // 지지의 순서에 따라 천간의 순서
    const zhiOrder = [
      "子",
      "丑",
      "寅",
      "卯",
      "辰",
      "巳",
      "午",
      "未",
      "申",
      "酉",
      "戌",
      "亥",
    ];
    const ganOrder = [
      "甲",
      "乙",
      "丙",
      "丁",
      "戊",
      "己",
      "庚",
      "辛",
      "壬",
      "癸",
    ];

    // 일간에 해당하는 시작 천간 찾기
    const startGan = startingGan[dailyGan];
    if (!startGan) return "";

    // 지지의 인덱스 찾기
    const zhiIndex = zhiOrder.indexOf(timeZhi);
    if (zhiIndex === -1) return "";

    // 시작 천간의 인덱스 찾기
    const startGanIndex = ganOrder.indexOf(startGan);

    // 최종 천간 계산
    const finalGanIndex = (startGanIndex + zhiIndex) % 10;
    return ganOrder[finalGanIndex];
  };

  // 시간 초기화 핸들러 추가
  const handleClearTime = () => {
    const hourInput = document.querySelector('input[name="hour"]');
    if (hourInput) hourInput.value = "";
  };

  const earthlyBranchesClasses = {
    子: "bg-gray-800 text-gray-200 border-gray-600", // 흑색 (수)
    丑: "bg-yellow-300 text-gray-700 border-yellow-600", // 황색 (토)
    寅: "bg-green-300 text-gray-700 border-green-600", // 녹색 (목)
    卯: "bg-green-300 text-gray-700 border-green-600", // 녹색 (목)
    辰: "bg-yellow-300 text-gray-700 border-yellow-600", // 황색 (토)
    巳: "bg-red-300 text-gray-700 border-red-600", // 적색 (화)
    午: "bg-red-300 text-gray-700 border-red-600", // 적색 (화)
    未: "bg-yellow-300 text-gray-700 border-yellow-600", // 황황색 (토)
    申: "bg-gray-50 text-gray-700 border-gray-300", // 백색 (금)
    酉: "bg-gray-50 text-gray-700 border-gray-300", // 백색 (금)
    戌: "bg-yellow-300 text-gray-700 border-yellow-600", // 황색 (토)
    亥: "bg-gray-800 text-gray-200 border-gray-600", // 수
  };

  const heavenlyStemsClasses = {
    甲: "bg-green-300 text-gray-700 border-green-600", // 녹색 (목녹색)
    乙: "bg-green-300 text-gray-700 border-green-600", // 목 (녹색)
    丙: "bg-red-300 text-gray-700 border-red-600", // 화 (적색)
    丁: "bg-red-300 text-gray-700 border-red-600", // 화 (적색)
    戊: "bg-yellow-300 text-gray-700 border-yellow-600", // 토 (황색)
    己: "bg-yellow-300 text-gray-700 border-yellow-600", // 토 (황색)
    庚: "bg-gray-50 text-gray-700 border-gray-300", // 금 (백색)
    辛: "bg-gray-50 text-gray-700 border-gray-300", // 금 (백색)
    壬: "bg-gray-800 text-gray-200 border-gray-600", // 수 (흑색)
    癸: "bg-gray-800 text-gray-200 border-gray-600", // 수 (흑흑색)
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col p-4">
      {/* 상단 섹션 */}
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-lg shadow-md p-6 mb-4"
      >
        <div className="mb-4">
          <h2 className="text-lg mb-4">이름</h2>
          <input
            type="text"
            name="name"
            required
            maxLength="20"
            className="w-full p-2 border rounded-lg"
          />
        </div>

        <div className="mb-4">
          <h2 className="text-lg mb-4">성별</h2>
          <div className="flex gap-4 mb-4">
            <label className="flex-1">
              <input
                type="radio"
                name="gender"
                value="male"
                className="peer hidden"
              />
              <div className="peer-checked:bg-blue-100 peer-checked:border-blue-200 bg-white border border-gray-300 text-gray-700 px-8 py-2 rounded-full cursor-pointer text-center">
                남자
              </div>
            </label>
            <label className="flex-1">
              <input
                type="radio"
                name="gender"
                value="female"
                className="peer hidden"
              />
              <div className="peer-checked:bg-blue-100 peer-checked:border-blue-200 bg-white border border-gray-300 text-gray-700 px-8 py-2 rounded-full cursor-pointer text-center">
                여자
              </div>
            </label>
          </div>
        </div>

        <div className="mb-4">
          <h2 className="text-lg mb-4">생년월일</h2>
          <input
            type="text"
            name="birthdate"
            placeholder="예시) 880305"
            maxLength="6"
            required
            className="w-full p-2 border rounded-lg"
            onInput={(e) => {
              let value = e.target.value;
              if (value) {
                value = value.replace(/[^0-9]/g, "");
                e.target.value = value;
              }
            }}
          />
        </div>

        <div className="mb-4">
          <h2 className="text-lg mb-4">시간</h2>
          <div className="relative">
            <input
              type="text"
              name="hour"
              placeholder="시 (0-23)"
              className="w-full p-2 border rounded-lg"
              onInput={handleHourInput}
            />
            <button
              type="button"
              onClick={handleClearTime}
              className="absolute rounded-full top-1/2 right-4 p-0.5 -translate-y-1/2 bg-gray-200 text-gray-700 hover:bg-gray-300"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2.5}
                stroke="currentColor"
                className="size-5"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18 18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        <button
          type="submit"
          className="mt-4 w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600"
        >
          사주팔자 보기
        </button>
      </form>

      {/* 사주팔자 섹션 */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg mb-4">사주팔자보기</h2>
        <div className="grid grid-cols-4 gap-4">
          <div>
            <h3 className="text-center mb-2">시주</h3>
            <div className="grid gap-2">
              <div
                className={classNames(
                  "aspect-square rounded-lg flex items-center justify-center text-3xl border transition-colors",
                  heavenlyStemsClasses[timeGan] || "border-gray-300"
                )}
              >
                {timeGan}
              </div>
              <div
                className={classNames(
                  "aspect-square rounded-lg flex items-center justify-center text-3xl border transition-colors",
                  earthlyBranchesClasses[timeZhi] || "border-gray-300"
                )}
              >
                {timeZhi}
              </div>
            </div>
          </div>
          <div>
            <h3 className="text-center mb-2">일주</h3>
            <div className="grid gap-2">
              <div
                className={classNames(
                  "aspect-square rounded-lg flex items-center justify-center text-3xl border transition-colors",
                  heavenlyStemsClasses[dayGan],
                  { "border-gray-300": !heavenlyStemsClasses[dayGan] }
                )}
              >
                {dayGan}
              </div>
              <div
                className={classNames(
                  "aspect-square rounded-lg flex items-center justify-center text-3xl border transition-colors",
                  earthlyBranchesClasses[dayZhi],
                  { "border-gray-300": !earthlyBranchesClasses[dayZhi] }
                )}
              >
                {dayZhi}
              </div>
            </div>
          </div>
          <div>
            <h3 className="text-center mb-2">월주</h3>
            <div className="grid gap-2">
              <div
                className={classNames(
                  "aspect-square rounded-lg flex items-center justify-center text-3xl border transition-colors",
                  heavenlyStemsClasses[monthGan],
                  { "border-gray-300": !heavenlyStemsClasses[monthGan] }
                )}
              >
                {monthGan}
              </div>
              <div
                className={classNames(
                  "aspect-square rounded-lg flex items-center justify-center text-3xl border transition-colors",
                  earthlyBranchesClasses[monthZhi],
                  { "border-gray-300": !earthlyBranchesClasses[monthZhi] }
                )}
              >
                {monthZhi}
              </div>
            </div>
          </div>
          <div>
            <h3 className="text-center mb-2">연주</h3>
            <div className="grid gap-2">
              <div
                className={classNames(
                  "aspect-square rounded-lg flex items-center justify-center text-3xl border transition-colors",
                  heavenlyStemsClasses[yearGan],
                  { "border-gray-300": !heavenlyStemsClasses[yearGan] }
                )}
              >
                {yearGan}
              </div>
              <div
                className={classNames(
                  "aspect-square rounded-lg flex items-center justify-center text-3xl border transition-colors",
                  earthlyBranchesClasses[yearZhi],
                  { "border-gray-300": !earthlyBranchesClasses[yearZhi] }
                )}
              >
                {yearZhi}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// 시간 입력 핸들러 함수
// 입력된 시간값을 검증하고 0-23 사이의 숫자만 허용하는 함수
const handleHourInput = (e) => {
  // 입력된 값을 가져옴
  let value = e.target.value;

  // 숫자가 아닌 모든 문자 제거 (정규식 사용)
  value = value.replace(/[^0-9]/g, "");

  // 빈 문자열이면 입력값 초기화
  if (!value) {
    e.target.value = "";
    return;
  }

  // 유효하지 않은 시간이면 마지막 입력 문자 제거
  if (parseInt(value) < 0 || parseInt(value) > 23) {
    e.target.value = value.slice(0, -1);
    return;
  }

  // 0으로 시작하는 경우 처리
  if (value.length > 1 && value[0] === "0") {
    e.target.value = value.slice(1);
    return;
  }

  // 유효한 시간이면 입력값 업데이트
  e.target.value = value;
};

export default App;
