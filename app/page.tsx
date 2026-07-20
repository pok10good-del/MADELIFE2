export default function Home() {
  return (
    <div className="stage">
      <div className="stage-bg sharpen-hero" />

      <div className="logo gold-text">
        <svg fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 2l2.4 7.4h7.6l-6.2 4.5 2.4 7.4-6.2-4.5-6.2 4.5 2.4-7.4-6.2-4.5h7.6z"></path>
        </svg>
        MAGIC MADE LIFE
      </div>

      <h1 className="headline">
        매일 저녁 8시,
        <br />
        <span className="gold-text">
          당신의 미래가
          <br />
          배달됩니다.
        </span>
      </h1>

      <p className="lede">
        당신이 살아온 인생을 기록해 주세요.
        <br />
        AI가 당신만의 스토리를 바탕으로
        <br />
        성공으로 이어지는 미래를 그려드립니다.
      </p>

      <a href="/login" className="cta-btn gradient-gold-bg">
        미래로 메시지 보내기
        <svg
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          viewBox="0 0 24 24"
        >
          <path d="M14 5l7 7m0 0l-7 7m7-7H3"></path>
        </svg>
      </a>

      <div className="divider">
        <div className="line" />
        <p>
          당신의 이야기가, <span className="gold-text">인생</span>을 바꿉니다.
        </p>
        <div className="line" />
      </div>

      <div className="cards">
        <div className="card">
          <div className="photo">
            <img className="sharpen-card" src="/img/feature-past.jpg" alt="달빛이 비치는 골목길" />
          </div>
          <div className="caption">
            <div className="icon-wrap gold-text">
              <svg fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path>
              </svg>
            </div>
            <h3>과거의 나</h3>
            <p>어떤 삶을 살아왔나요?</p>
          </div>
        </div>
        <div className="card">
          <div className="photo">
            <img className="sharpen-card" src="/img/feature-diary.jpg" alt="일기를 쓰는 손" />
          </div>
          <div className="caption">
            <div className="icon-wrap gold-text">
              <svg fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
              </svg>
            </div>
            <h3>후회와 다짐</h3>
            <p>바꾸고 싶었던 순간은 언제였나요?</p>
          </div>
        </div>
        <div className="card">
          <div className="photo">
            <img className="sharpen-card" src="/img/feature-crystal.jpg" alt="빛나는 크리스탈 볼" />
          </div>
          <div className="caption">
            <div className="icon-wrap gold-text">
              <svg fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
            </div>
            <h3>매일 저녁 8시</h3>
            <p>매일 저녁 8시가 되면 당신에게 미래일기가 전달됩니다.</p>
          </div>
        </div>
        <div className="card">
          <div className="photo">
            <img className="sharpen-card" src="/img/feature-love.jpg" alt="서로를 안은 커플" />
          </div>
          <div className="caption">
            <div className="icon-wrap gold-text">
              <svg fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path>
              </svg>
            </div>
            <h3>사랑과 관계</h3>
            <p>원하는 관계와 사랑을 이루세요.</p>
          </div>
        </div>
        <div className="card">
          <div className="photo">
            <img className="sharpen-card" src="/img/feature-freedom.jpg" alt="야경이 보이는 요트 파티" />
          </div>
          <div className="caption">
            <div className="icon-wrap gold-text">
              <svg fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path>
              </svg>
            </div>
            <h3>자유와 풍요</h3>
            <p>시간과 돈에서 자유로운 삶을 누리세요.</p>
          </div>
        </div>
      </div>

      <div className="car-strip sharpen-strip" aria-label="자유와 풍요" />
    </div>
  );
}
