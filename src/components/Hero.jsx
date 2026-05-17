import './Hero.css'

export default function Hero() {
  return (
    <section className="hero">
      <div className="hero-content">
        <p className="hero-tagline" >توزيعات | لوحات | أثـر </p>
        <h1 className="hero-title">متجر غريم</h1>
        <p className="hero-desc">
         نبتكرُ لِمُناسباتكم الدينية تفاصيل تليق بك
        </p>
        <a href="#products" className="hero-btn">
          <i className="fa-solid fa-bag-shopping" />
          تسوق الآن
        </a>
      </div>
    </section>
  )
}
