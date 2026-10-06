const app = document.querySelector("#app");

app.innerHTML = `
<header class="site-header">
  <div class="nav-container">
    <a href="#" class="brand"><img class="brand-mark" src="/static/favicon.svg" alt=""> BodySynk</a>
    <div class="nav-btns">
      <a href="${app.dataset.loginUrl || '/login'}" class="btn-sec">Log in</a>
      <a href="${app.dataset.loginUrl || '/login'}" class="btn-pri">Get started</a>
    </div>
  </div>
</header>

<main>
  <!-- HERO -->
  <section class="hero">
    <div class="container grid-2">
      <div class="hero-text">
        <span class="eyebrow">CRM FOR HUMANS</span>
        <h1>Your personal health story.<br><em>Finally connected.</em></h1>
        <p>Blood tests, medications, wearables, sleep, and nutrition—BodySynk connects the gaps into one unified timeline.</p>
        <div class="cta-row">
          <a href="/signup" class="btn-pri-lg">Get started free &rarr;</a>
          <a href="#" class="btn-out-lg" id="howItWorksBtn">
            &#9654; See how it works
        </a>
        </div>
        <span class="subtext">Encrypted &amp; private. Pat. Pending.</span>
      </div>

      <div class="hero-card">
        <img src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=600&q=80" alt="Health story" />
        <div class="badge top-left"><span class="lbl">HEALTH SCORE</span><strong>87 <small>&uarr; 4</small></strong></div>
        <div class="badge top-right"><span class="lbl">FERRITIN</span><strong>42 <small>3 from 18</small></strong></div>
        <div class="badge bottom-left"><span class="lbl">SLEEP 7-DAY</span><strong>84</strong></div>
        <div class="hero-banner">&ldquo;Your recovery improved as sleep consistency increased.&rdquo;</div>
      </div>
    </div>
  </section>

  <!-- TICKER -->
  <div class="ticker">
    <div class="ticker-items">
      <span>&#10022; HEALTH INSIGHTS</span>
      <span>&#10022; BODY CONTEXT</span>
      <span>&#10022; FOOD SCANNER</span>
      <span>&#10022; LONGEVITY</span>
      <span>&#10022; FITNESS</span>
      <span>&#10022; HEALTH WINGMAN</span>
    </div>
  </div>

  <!-- CONNECTED STORY (ORBIT SECTION) -->
  <section class="dark-section story-sec">
    <div class="container grid-2 align-center">
      <div class="story-text">
        <span class="eyebrow dim">ONE CONNECTED BODY</span>
        <h2>Your doctor knows part of your story.<br><span class="dim">BodySynk connects it all.</span></h2>
        <p class="story-lead">Everything you add joins one health timeline, in context with what came before it.</p>

        <ul class="story-points">
          <li><span class="sp-dot"></span><div><strong>Hydration</strong><small>Daily intake tracked against your goals</small></div></li>
          <li><span class="sp-dot"></span><div><strong>Movement</strong><small>Workouts and steps synced from wearables</small></div></li>
          <li><span class="sp-dot"></span><div><strong>Nutrition</strong><small>Meals scanned and broken into macros</small></div></li>
          <li><span class="sp-dot"></span><div><strong>Recovery</strong><small>Sleep and rest linked to your bloodwork</small></div></li>
        </ul>
      </div>

      <div class="orbit-stage">
        <div class="orbit-ring"></div>
        <div class="orbit-ring orbit-ring-2"></div>
        <div class="orbit-glow"></div>

        <!-- Save your image as figure.png (transparent background works best) -->
        <img src="/static/figure.png" class="orbit-figure" alt="Body in motion" />

        <div class="orbit-label ol-tl">Hydration</div>
        <div class="orbit-label ol-tr">Movement</div>
        <div class="orbit-label ol-bl">Nutrition</div>
        <div class="orbit-label ol-br">Recovery</div>

        <div class="streak-badge"><span>Streak:</span><strong>5 Days</strong></div>
      </div>
    </div>
  </section>

  <!-- AI QA CONSOLE -->
  <section class="dark-section console-sec">
    <div class="container">
      <h2>Ask questions only your synced history can answer.</h2>
      <div class="console-box">
        <div class="console-input">What does my latest bloodwork actually tell?</div>
        <div class="chips">
          <span>Bloodwork</span><span>Trends</span><span>Supplements</span><span>Iron</span>
        </div>
        <div class="console-reply">
          <p>Your latest panel shows <strong>LDL and triglycerides drifting down</strong> while <strong>ferritin is climbing back into range</strong> following your iron supplement regimen started in January.</p>
        </div>
      </div>
    </div>
  </section>

  <!-- BLOODWORK TRENDS -->
  <section class="section">
    <div class="container grid-2 align-center">
      <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80" class="rounded-img" alt="Reviewing trends" />
      <div class="card">
        <span class="eyebrow">BLOODWORK</span>
        <h3>Ferritin Trend (ng/mL)</h3>
        <div class="bar-chart">
          <div class="bar"><span class="val">22</span><div style="height:30%"></div><span class="lbl">2023</span></div>
          <div class="bar"><span class="val">31</span><div style="height:45%"></div><span class="lbl">2024</span></div>
          <div class="bar"><span class="val">48</span><div style="height:65%"></div><span class="lbl">2025</span></div>
          <div class="bar active"><span class="val">74</span><div style="height:90%"></div><span class="lbl">2026</span></div>
        </div>
        <p class="subtext">Each test is compared against previous results and lifestyle factors.</p>
      </div>
    </div>
  </section>

  <!-- MEAL SCANNER -->
  <section class="section">
    <div class="container grid-2 align-center">
      <div class="card">
        <span class="eyebrow">FOOD SCANNER</span>
        <h3>Snap your plate. Get the macro breakdown.</h3>
        <div class="macro-grid">
          <div><span>CALORIES</span><strong>650 kcal</strong></div>
          <div><span>PROTEIN</span><strong>53 g</strong></div>
          <div><span>CARBS</span><strong>64 g</strong></div>
          <div><span>FAT</span><strong>20 g</strong></div>
        </div>
        <ul class="mini-list">
          <li><span>Grilled chicken breast</span><strong>250 kcal</strong></li>
          <li><span>Jasmine rice</span><strong>234 kcal</strong></li>
          <li><span>Vegetables &amp; Olive Oil</span><strong>166 kcal</strong></li>
        </ul>
      </div>
      <img src="https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80" class="rounded-img" alt="Plate scan" />
    </div>
  </section>

</main>
<!-- REFLECT & ADAPT -->
<section class="section reflect-section">
  <div class="container">

    <div class="section-heading">
      <span class="eyebrow">REFLECT &amp; ADAPT</span>
      <h2>Your routine changes.<br><em>BodySynk changes with it.</em></h2>
      <p>
        BodySynk learns from your daily habits and turns your activity,
        meals, hydration, and progress into simple next-step guidance.
      </p>
    </div>

    <div class="adapt-grid">

      <div class="adapt-card">
        <span class="adapt-number">01</span>
        <div class="adapt-icon">◌</div>
        <h3>Reflect</h3>
        <p>
          See what happened today — from meals and movement
          to hydration and recovery.
        </p>
        <div class="adapt-line"></div>
        <small>YOUR DAILY STORY</small>
      </div>

      <div class="adapt-card featured">
        <span class="adapt-number">02</span>
        <div class="adapt-icon">✦</div>
        <h3>Understand</h3>
        <p>
          BodySynk connects your habits and progress to reveal
          patterns you may not notice yourself.
        </p>
        <div class="adapt-line"></div>
        <small>YOUR PATTERNS</small>
      </div>

      <div class="adapt-card">
        <span class="adapt-number">03</span>
        <div class="adapt-icon">↗</div>
        <h3>Adapt</h3>
        <p>
          Get a simple next plan that evolves with your goals,
          routine, and progress.
        </p>
        <div class="adapt-line"></div>
        <small>YOUR NEXT STEP</small>
      </div>

    </div>

  </div>
</section>

<footer class="footer">
  <div class="container footer-content">
    <a href="#" class="brand"><img class="brand-mark" src="/static/favicon.svg" alt=""> BodySynk</a>
    <p>&copy; 2026 BodySynk&trade;. Pat. Pending. All rights reserved.</p>
  </div>
</footer>
`;

// Orbit section scroll reveal (plays once)
const story = document.querySelector(".story-sec");
new IntersectionObserver(([e], obs) => {
  if (e.isIntersecting) { story.classList.add("in-view"); obs.disconnect(); }
}, { threshold: 0.25 }).observe(story);


document.getElementById("howItWorksBtn").addEventListener("click", function (e) {
    e.preventDefault();

    const video = document.createElement("video");
    const closeBtn = document.createElement("button");

    video.src = "/static/how-it-works.mp4";
    video.controls = true;
    video.autoplay = true;
    video.playsInline = true;
    video.className = "body-synk-video";

    closeBtn.innerHTML = "&times;";
    closeBtn.className = "body-synk-video-close";

    document.body.appendChild(video);
    document.body.appendChild(closeBtn);

    function closeVideo() {
        video.pause();
        video.remove();
        closeBtn.remove();
    }

    closeBtn.addEventListener("click", closeVideo);

    video.addEventListener("ended", closeVideo);
});