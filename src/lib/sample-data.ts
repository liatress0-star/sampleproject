// 차트 샘플 데이터
export const monthlySalesData = [
  { month: "1월", sales: 4200, target: 4000, profit: 1200 },
  { month: "2월", sales: 3800, target: 4200, profit: 980 },
  { month: "3월", sales: 5100, target: 4500, profit: 1560 },
  { month: "4월", sales: 4700, target: 4800, profit: 1340 },
  { month: "5월", sales: 5300, target: 5000, profit: 1780 },
  { month: "6월", sales: 6200, target: 5200, profit: 2100 },
  { month: "7월", sales: 5800, target: 5500, profit: 1920 },
  { month: "8월", sales: 6500, target: 5800, profit: 2340 },
  { month: "9월", sales: 5900, target: 6000, profit: 1850 },
  { month: "10월", sales: 6800, target: 6200, profit: 2560 },
  { month: "11월", sales: 7200, target: 6500, profit: 2800 },
  { month: "12월", sales: 7800, target: 7000, profit: 3100 },
];

export const categoryData = [
  { name: "전자제품", value: 35, color: "#3b82f6" },
  { name: "의류", value: 25, color: "#10b981" },
  { name: "식품", value: 20, color: "#f59e0b" },
  { name: "가구", value: 12, color: "#ef4444" },
  { name: "기타", value: 8, color: "#8b5cf6" },
];

export const weeklyVisitorData = [
  { day: "월", visitors: 1200, pageViews: 3400 },
  { day: "화", visitors: 1350, pageViews: 3800 },
  { day: "수", visitors: 1100, pageViews: 3100 },
  { day: "목", visitors: 1450, pageViews: 4200 },
  { day: "금", visitors: 1600, pageViews: 4800 },
  { day: "토", visitors: 800, pageViews: 2100 },
  { day: "일", visitors: 650, pageViews: 1800 },
];

// 그리드 샘플 데이터
export interface Employee {
  id: number;
  name: string;
  department: string;
  position: string;
  email: string;
  joinDate: string;
  salary: number;
  status: "재직" | "휴직" | "퇴직";
}

export const employeeData: Employee[] = [
  { id: 1, name: "김철수", department: "개발팀", position: "시니어 개발자", email: "kim.cs@company.com", joinDate: "2020-03-15", salary: 6500, status: "재직" },
  { id: 2, name: "이영희", department: "디자인팀", position: "리드 디자이너", email: "lee.yh@company.com", joinDate: "2019-07-22", salary: 6000, status: "재직" },
  { id: 3, name: "박민수", department: "개발팀", position: "주니어 개발자", email: "park.ms@company.com", joinDate: "2023-01-10", salary: 4000, status: "재직" },
  { id: 4, name: "정수진", department: "마케팅팀", position: "마케팅 매니저", email: "jung.sj@company.com", joinDate: "2018-11-05", salary: 5800, status: "재직" },
  { id: 5, name: "최지훈", department: "영업팀", position: "영업 대리", email: "choi.jh@company.com", joinDate: "2021-06-18", salary: 4500, status: "재직" },
  { id: 6, name: "한미래", department: "인사팀", position: "HR 담당자", email: "han.mr@company.com", joinDate: "2022-02-28", salary: 4200, status: "재직" },
  { id: 7, name: "송준호", department: "개발팀", position: "백엔드 개발자", email: "song.jh@company.com", joinDate: "2021-09-12", salary: 5500, status: "휴직" },
  { id: 8, name: "윤서연", department: "디자인팀", position: "UI 디자이너", email: "yoon.sy@company.com", joinDate: "2023-04-03", salary: 4300, status: "재직" },
  { id: 9, name: "임동현", department: "개발팀", position: "프론트엔드 개발자", email: "lim.dh@company.com", joinDate: "2022-08-15", salary: 5200, status: "재직" },
  { id: 10, name: "강유진", department: "마케팅팀", position: "콘텐츠 매니저", email: "kang.yj@company.com", joinDate: "2023-06-20", salary: 4100, status: "재직" },
  { id: 11, name: "오태영", department: "영업팀", position: "영업 과장", email: "oh.ty@company.com", joinDate: "2017-04-10", salary: 6200, status: "재직" },
  { id: 12, name: "서민정", department: "인사팀", position: "인사 팀장", email: "seo.mj@company.com", joinDate: "2016-12-01", salary: 7000, status: "재직" },
  { id: 13, name: "장현우", department: "개발팀", position: "DevOps 엔지니어", email: "jang.hw@company.com", joinDate: "2020-10-22", salary: 6000, status: "재직" },
  { id: 14, name: "배수빈", department: "디자인팀", position: "그래픽 디자이너", email: "bae.sb@company.com", joinDate: "2024-01-08", salary: 3800, status: "재직" },
  { id: 15, name: "노성민", department: "개발팀", position: "QA 엔지니어", email: "noh.sm@company.com", joinDate: "2021-03-25", salary: 4800, status: "퇴직" },
];

export interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  stock: number;
  rating: number;
  status: "판매중" | "품절" | "단종";
}

export const productData: Product[] = [
  { id: 1, name: "무선 블루투스 이어폰", category: "전자제품", price: 89000, stock: 150, rating: 4.5, status: "판매중" },
  { id: 2, name: "스마트 워치 Pro", category: "전자제품", price: 299000, stock: 45, rating: 4.2, status: "판매중" },
  { id: 3, name: "프리미엄 노트북 파우치", category: "액세서리", price: 35000, stock: 0, rating: 4.8, status: "품절" },
  { id: 4, name: "USB-C 멀티 허브", category: "전자제품", price: 52000, stock: 230, rating: 4.1, status: "판매중" },
  { id: 5, name: "기계식 키보드 RGB", category: "전자제품", price: 129000, stock: 78, rating: 4.7, status: "판매중" },
  { id: 6, name: "에르고노믹 마우스", category: "전자제품", price: 68000, stock: 92, rating: 4.3, status: "판매중" },
  { id: 7, name: "27인치 QHD 모니터", category: "전자제품", price: 389000, stock: 12, rating: 4.6, status: "판매중" },
  { id: 8, name: "노이즈캔슬링 헤드폰", category: "전자제품", price: 245000, stock: 0, rating: 4.9, status: "품절" },
  { id: 9, name: "미니 블루투스 스피커", category: "전자제품", price: 45000, stock: 180, rating: 3.8, status: "판매중" },
  { id: 10, name: "4K 웹캠", category: "전자제품", price: 158000, stock: 55, rating: 4.4, status: "판매중" },
  { id: 11, name: "무선 충전 패드", category: "액세서리", price: 28000, stock: 320, rating: 4.0, status: "판매중" },
  { id: 12, name: "태블릿 거치대", category: "액세서리", price: 22000, stock: 0, rating: 3.5, status: "단종" },
];
