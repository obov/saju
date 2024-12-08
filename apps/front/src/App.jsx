import { useState } from "react";
import classNames from "classnames";
import useSajuData from "./hooks/useSajuData";
import useScrollVisibility from "./hooks/useScrollVisibility";

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
  const [isFormVisible, setIsFormVisible] = useScrollVisibility(true); // 처음에는 열려있도록
  const [nameValue, setNameValue] = useState(""); // 이름 입력 값
  const [birthdateValue, setBirthdateValue] = useState(""); // 생년월일 입력 값
  const [hourValue, setHourValue] = useState(""); // 시간 입력 값

  const handleBirthdateChange = (e) => {
    let value = e.target.value.replace(/[^0-9-]/g, "");

    // 하이픈 제거
    value = value.replace(/-/g, "");

    // 8자리로 제한
    if (value.length > 8) {
      value = value.slice(0, 8);
    }

    if (value.length === 5 || value.length === 6) {
      e.target.value = `${value.slice(0, 4)}-${value.slice(4)}`;
      setBirthdateValue(`${value.slice(0, 4)}-${value.slice(4)}`);
      return;
    }

    if (value.length === 7 || value.length === 8) {
      e.target.value = `${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(
        6
      )}`;
      setBirthdateValue(
        `${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6)}`
      );
      return;
    }

    setBirthdateValue(e.target.value);
  };

  // 시간 입력 핸들러
  const handleHourChange = (e) => {
    let value = e.target.value.replace(/[^0-9:]/g, "");

    // 콜론 제거
    value = value.replace(/:/g, "");

    // 4자리로 제한
    if (value.length > 4) {
      value = value.slice(0, 4);
    }

    // 3자리 숫자인 경우 (예: 230 -> 02:30)
    if (value.length === 3) {
      const hour = value.slice(0, 2);
      const minute = value.slice(2);

      e.target.value = `${hour}:${minute}`;
      setHourValue(`${hour}:${minute}`);
      return;
    }

    // 4자리 숫자인 경우 (예: 1430 -> 14:30)
    if (value.length === 4) {
      const hour = value.slice(0, 2);
      const minute = value.slice(2);

      e.target.value = `${hour}:${minute}`;
      setHourValue(`${hour}:${minute}`);
      return;
    }

    setHourValue(value);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const formData = new FormData(e.target);
    const gender = formData.get("gender");

    if (!gender) {
      alert("성별을 선택해주세요.");
      return;
    }

    // 생년월일 검증
    const birthdateValidation = validateAndFormatBirthdate(birthdateValue);
    if (!birthdateValidation.isValid) {
      alert(birthdateValidation.error);
      return;
    }

    // 데이터 존재 여부 검증
    if (!sajuData || !sajuData[birthdateValidation.formattedDate]) {
      alert("해당 날짜의 사주 데이터가 없습니다.");
      return;
    }

    // 사주 데이터 설정
    const data = sajuData[birthdateValidation.formattedDate];
    setYearGan(data.yearGan);
    setYearZhi(data.yearZhi);
    setMonthGan(data.monthGan);
    setMonthZhi(data.monthZhi);
    setDayGan(data.dayGan);
    setDayZhi(data.dayZhi);

    // 시간 검증
    if (!hourValue) return;

    // 숫자만 추출하여 시간 포맷팅
    const numbers = hourValue.replace(/[^0-9]/g, "");
    if (numbers.length === 1) {
      const formattedTime = `0${numbers}:00`;
      setHourValue(formattedTime);
    } else if (numbers.length === 2) {
      const formattedTime = `${numbers}:00`;
      setHourValue(formattedTime);
    }

    const timeValidation = validateAndFormatTime(hourValue);
    if (!timeValidation.isValid) {
      alert(timeValidation.error);
      return;
    }

    // 시주 계산
    const timeZhi = getTimeZhi(timeValidation.hour);
    const timeGan = getTimeGan(data.dayGan, timeZhi);
    setTimeZhi(timeZhi);
    setTimeGan(timeGan);

    // 폼 제출 후 바로 닫기
    setIsFormVisible(false);
  };

  // 다시 입력하기 핸들러 추가
  const handleReset = (e) => {
    e.preventDefault();
    setIsFormVisible(true);
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

  // 간에 따른 시간 천간(天干) 결정
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

  // Input clear handler 개선
  const handleClearInput = (setter) => {
    setter(""); // 상태만 초기화하면 React가 DOM을 업데이트
  };

  // Input keydown handler 개선
  const handleKeyDown = (e, setter) => {
    if (e.key === "Escape") {
      handleClearInput(setter);
    }
  };

  // Input change handler (기존과 동일)
  const handleInputChange = (e, setter) => {
    setter(e.target.value);
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
    甲: "bg-green-300 text-gray-700 border-green-600", // 녹색 (목색)
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
    <div className="min-h-screen bg-gray-50 flex flex-col p-4 items-center">
      {/* 전체 컨텐츠를 감싸는 컨테이너 수정 */}
      <div className="w-full min-w-[300px] max-w-[600px]">
        {/* 폼 컨테이너 */}
        <div>
          <form
            onSubmit={handleSubmit}
            className="bg-white rounded-lg shadow-md p-6 mb-4"
            autoComplete="off"
          >
            <div
              className={classNames(
                "transition-all duration-300 ease-in-out overflow-hidden",
                isFormVisible
                  ? "max-h-[800px] opacity-100"
                  : "max-h-[0px] opacity-100"
              )}
            >
              <div className="mb-4">
                <h2 className="text-lg mb-4">이름</h2>
                <div className="relative">
                  <input
                    type="text"
                    name="name"
                    required
                    maxLength="20"
                    autoComplete="off"
                    className="w-full p-2 border rounded-lg"
                    value={nameValue}
                    onChange={(e) => handleInputChange(e, setNameValue)}
                    onKeyDown={(e) => handleKeyDown(e, setNameValue)}
                  />
                  {nameValue && (
                    <div
                      onClick={() => handleClearInput(setNameValue)}
                      className="absolute rounded-full top-1/2 right-4 p-0.5 -translate-y-1/2 bg-gray-200 text-gray-700 hover:bg-gray-300 cursor-pointer"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="size-4"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M6 18 18 6M6 6l12 12"
                        />
                      </svg>
                    </div>
                  )}
                </div>
              </div>

              <div className="mb-4">
                <h2 className="text-lg mb-4">성별</h2>
                <div className="flex gap-4 mb-4 px-4">
                  <label className="flex-1">
                    <input
                      type="radio"
                      name="gender"
                      value="male"
                      className="peer w-[1px] h-[1px] opacity-0 absolute"
                    />
                    <div className="peer-checked:bg-blue-100 peer-checked:border-blue-200 bg-white border border-gray-300 text-gray-700 px-8 py-2 rounded-full cursor-pointer text-center peer-focus:ring-2 peer-focus:ring-blue-600  peer-focus:ring-offset-0">
                      남자
                    </div>
                  </label>
                  <label className="flex-1">
                    <input
                      type="radio"
                      name="gender"
                      value="female"
                      className="peer w-[1px] h-[1px] opacity-0 absolute"
                    />
                    <div className="peer-checked:bg-blue-100 peer-checked:border-blue-200 bg-white border border-gray-300 text-gray-700 px-8 py-2 rounded-full cursor-pointer text-center peer-focus:ring-2 peer-focus:ring-blue-600 peer-focus:ring-offset-0">
                      여자
                    </div>
                  </label>
                </div>
              </div>

              <div className="mb-4">
                <h2 className="text-lg mb-4">생년월일</h2>
                <div className="relative">
                  <input
                    type="text"
                    name="birthdate"
                    placeholder="예시) 19880305"
                    maxLength="10"
                    required
                    autoComplete="off"
                    className="w-full p-2 border rounded-lg"
                    value={birthdateValue}
                    onChange={handleBirthdateChange}
                    onKeyDown={(e) => handleKeyDown(e, setBirthdateValue)}
                  />
                  {birthdateValue && (
                    <div
                      onClick={() => handleClearInput(setBirthdateValue)}
                      className="absolute rounded-full top-1/2 right-4 p-0.5 -translate-y-1/2 bg-gray-200 text-gray-700 hover:bg-gray-300 cursor-pointer"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="size-4"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M6 18 18 6M6 6l12 12"
                        />
                      </svg>
                    </div>
                  )}
                </div>
              </div>

              <div className="mb-8">
                <h2 className="text-lg mb-4">시간</h2>
                <div className="relative">
                  <input
                    type="text"
                    name="hour"
                    placeholder="시간 (예: 1430 또는 230)"
                    autoComplete="off"
                    className="w-full p-2 border rounded-lg"
                    value={hourValue}
                    onChange={handleHourChange}
                    onKeyDown={(e) => handleKeyDown(e, setHourValue)}
                  />
                  {hourValue && (
                    <div
                      onClick={() => handleClearInput(setHourValue)}
                      className="absolute rounded-full top-1/2 right-4 p-0.5 -translate-y-1/2 bg-gray-200 text-gray-700 hover:bg-gray-300 cursor-pointer"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="size-4"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M6 18 18 6M6 6l12 12"
                        />
                      </svg>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 사주팔자 제출 버튼 */}
            <button
              type={isFormVisible ? "submit" : "button"}
              onClick={!isFormVisible ? handleReset : undefined}
              className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 flex items-center justify-center gap-2"
            >
              {isFormVisible ? "사주팔자 보기" : "다시 입력하기"}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className={classNames(
                  "w-4 h-4 transform transition-transform",
                  {
                    "rotate-180": isFormVisible,
                  }
                )}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
          </form>
        </div>

        {/* 사주팔자 섹션 */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="grid grid-cols-4 gap-4">
            <div>
              <h3 className="text-center mb-2">시주</h3>
              <div className="grid gap-2">
                <div
                  className={classNames(
                    "aspect-square rounded-lg flex items-center justify-center text-2xl xs:text-3xl border transition-colors",
                    heavenlyStemsClasses[timeGan] || "border-gray-300"
                  )}
                >
                  {timeGan}
                </div>
                <div
                  className={classNames(
                    "aspect-square rounded-lg flex items-center justify-center text-2xl xs:text-3xl border transition-colors",
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
                    "aspect-square rounded-lg flex items-center justify-center text-2xl xs:text-3xl border transition-colors",
                    heavenlyStemsClasses[dayGan],
                    { "border-gray-300": !heavenlyStemsClasses[dayGan] }
                  )}
                >
                  {dayGan}
                </div>
                <div
                  className={classNames(
                    "aspect-square rounded-lg flex items-center justify-center text-2xl xs:text-3xl border transition-colors",
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
                    "aspect-square rounded-lg flex items-center justify-center text-2xl xs:text-3xl border transition-colors",
                    heavenlyStemsClasses[monthGan],
                    { "border-gray-300": !heavenlyStemsClasses[monthGan] }
                  )}
                >
                  {monthGan}
                </div>
                <div
                  className={classNames(
                    "aspect-square rounded-lg flex items-center justify-center text-2xl xs:text-3xl border transition-colors",
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
                    "aspect-square rounded-lg flex items-center justify-center text-2xl xs:text-3xl border transition-colors",
                    heavenlyStemsClasses[yearGan],
                    { "border-gray-300": !heavenlyStemsClasses[yearGan] }
                  )}
                >
                  {yearGan}
                </div>
                <div
                  className={classNames(
                    "aspect-square rounded-lg flex items-center justify-center text-2xl xs:text-3xl border transition-colors",
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
    </div>
  );
}

export default App;

const validateAndFormatTime = (value) => {
  if (!value) return { isValid: false, hour: null };

  // 콜론 제거하고 숫자만 추출
  const numbers = value.replace(/[^0-9]/g, "");

  // 시간 형식 검증
  if (numbers.length <= 2) {
    // 1-2자리 숫자인 경우
    if (!/^\d{1,2}$/.test(numbers)) {
      return { isValid: false, error: "올바른 시간을 입력해주세요. (0-23)" };
    }
    const hour = parseInt(numbers);
    if (hour < 0 || hour > 23) {
      return { isValid: false, error: "올바른 시간을 입력해주세요. (0-23)" };
    }
    return { isValid: true, hour };
  }

  // 3-4자리 숫자인 경우
  const hour = parseInt(
    numbers.length === 3 ? numbers.slice(0, 1) : numbers.slice(0, 2)
  );
  const minute = parseInt(
    numbers.length === 3 ? numbers.slice(1) : numbers.slice(2)
  );

  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) {
    return {
      isValid: false,
      error: "올바른 시간을 입력해주세요. (00:00-23:59)",
    };
  }

  return { isValid: true, hour };
};

const validateAndFormatBirthdate = (value) => {
  if (!value) return { isValid: false, error: "생년월일을 입력해주세요." };

  // 숫자만 추출
  const numbers = value.replace(/[^0-9]/g, "");

  // 길이 검증
  if (numbers.length < 4) {
    return { isValid: false, error: "연도를 4자리로 입력해주세요." };
  }

  // 연도 검증 (1900-2050)
  const year = parseInt(numbers.slice(0, 4));
  if (year < 1900 || year > 2050) {
    return { isValid: false, error: "연도는 1900-2050 사이여야 합니다." };
  }

  if (numbers.length === 5) {
    return { isValid: false, error: "월을 2자리로 입력해주세요." };
  }

  if (numbers.length >= 6) {
    // 월 검증 (1-12)
    const month = parseInt(numbers.slice(4, 6));
    if (month < 1 || month > 12) {
      return { isValid: false, error: "월은 01-12 사이여야 합니다." };
    }
  }

  if (numbers.length === 7) {
    return { isValid: false, error: "일을 2자리로 입력해주세요." };
  }

  if (numbers.length === 8) {
    // 일 검증 (1-31)
    const day = parseInt(numbers.slice(6, 8));
    if (day < 1 || day > 31) {
      return { isValid: false, error: "일은 01-31 사이여야 합니다." };
    }
  }

  // 모든 검증 통과
  if (numbers.length === 8) {
    return {
      isValid: true,
      formattedDate: `${numbers.slice(0, 4)}-${numbers.slice(
        4,
        6
      )}-${numbers.slice(6, 8)}`,
    };
  }

  return { isValid: false, error: "생년월일을 8자리로 입력해주세요." };
};
