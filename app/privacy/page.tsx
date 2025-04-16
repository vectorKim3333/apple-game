import React from 'react';

export default function PrivacyPolicy() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-8">개인정보 처리방침</h1>
      
      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">1. 개인정보의 처리 목적</h2>
        <p className="mb-4">
          본 웹사이트는 사용자의 게임 플레이 경험 개선과 서비스 제공을 위해 필요한 최소한의 개인정보를 수집하고 있습니다.
          수집된 개인정보는 다음의 목적 이외의 용도로는 이용되지 않습니다:
        </p>
        <ul className="list-disc pl-6 mb-4">
          <li>게임 서비스 제공 및 운영</li>
          <li>서비스 이용 기록 분석을 통한 서비스 개선</li>
          <li>광고 서비스 제공 및 운영</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">2. 수집하는 개인정보 항목</h2>
        <p className="mb-4">본 웹사이트는 다음과 같은 정보를 수집할 수 있습니다:</p>
        <ul className="list-disc pl-6 mb-4">
          <li>자동 수집 항목: 접속 IP, 브라우저 종류, 접속 시간</li>
          <li>Google Analytics를 통해 수집되는 사용자 행동 데이터</li>
          <li>광고 서비스 제공을 위한 쿠키 정보</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">3. 개인정보의 보유 및 이용기간</h2>
        <p className="mb-4">
          사용자의 개인정보는 서비스 제공 목적이 달성된 후에는 즉시 파기됩니다.
          단, 관련 법령에 의한 정보보유 사유가 있는 경우에는 해당 기간 동안 보관됩니다.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">4. 쿠키의 설치, 운영 및 거부</h2>
        <p className="mb-4">
          본 웹사이트는 이용자의 편의를 위해 쿠키를 사용합니다. 쿠키는 웹사이트를 운영하는데
          이용되는 서버가 이용자의 브라우저에게 보내는 작은 텍스트 파일로, 이용자의 컴퓨터 하드디스크에 저장됩니다.
        </p>
        <p className="mb-4">
          이용자는 쿠키 설치에 대한 선택권을 가지고 있습니다. 웹브라우저에서 옵션을 설정함으로써
          모든 쿠키를 허용하거나, 쿠키가 저장될 때마다 확인을 거치거나, 모든 쿠키의 저장을 거부할 수 있습니다.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">5. Google AdSense 및 분석 도구 사용</h2>
        <p className="mb-4">
          본 웹사이트는 Google AdSense와 Google Analytics를 사용합니다. 
          이러한 서비스들은 쿠키를 사용하여 비개인화된 방문자 데이터를 수집할 수 있습니다.
        </p>
        <p className="mb-4">
          Google의 광고 쿠키 사용에 대한 자세한 내용은 
          <a href="https://policies.google.com/technologies/ads" 
             className="text-blue-600 hover:text-blue-800 underline"
             target="_blank" 
             rel="noopener noreferrer">
            Google 광고 및 개인정보 보호
          </a>
          에서 확인하실 수 있습니다.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">6. 개인정보 보호책임자</h2>
        <p className="mb-4">
          개인정보 보호책임자: 김벡터<br />
          이메일: vectorkim3333@gmail.com
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-2xl font-semibold mb-4">7. 개인정보처리방침의 변경</h2>
        <p className="mb-4">
          이 개인정보처리방침은 2024년 3월 19일에 제정되었으며, 법령/정책 또는 보안기술의 변경에 따라
          내용의 추가/삭제 및 수정이 있을 시에는 변경사항의 시행 7일 전부터 공지사항을 통해 고지할 것입니다.
        </p>
      </section>
    </div>
  );
} 