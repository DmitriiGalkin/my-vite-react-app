import { useState } from 'react'
import { Link, Route, Routes } from 'react-router-dom'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import './App.css'

const projects = [
  {
    id: 1,
    title: 'Детская робототехника',
    description: 'Проект для детей, которые хотят собрать своего первого робота.',
    image: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 2,
    title: 'Творческая мастерская',
    description: 'Рисование, лепка и создание поделок в дружной команде.',
    image: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&w=800&q=80',
  },
  {
    id: 3,
    title: 'Спортивные встречи',
    description: 'Активные занятия, игры и тренировки на свежем воздухе.',
    image: 'https://images.unsplash.com/photo-1472162072942-cd5147eb3902?auto=format&fit=crop&w=800&q=80',
  },
]

function HomePage() {
  const [count, setCount] = useState(0)

  return (
    <>
      <section id="center">
        <div className="hero">
          <img src={heroImg} className="base" width="170" height="179" alt="" />
          <img src={reactLogo} className="framework" alt="React logo" />
          <img src={viteLogo} className="vite" alt="Vite logo" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-blue-600">Tailwind работает</h1>
          <p>
            Edit 5 <code>src/App.tsx</code> and save to test <code>HMR</code>
          </p>
        </div>
        <button
          type="button"
          className="counter"
          onClick={() => setCount((count) => count + 1)}
        >
          Count 3 is {count}
        </button>
      </section>

      <section className="projects-section">
        <h2>Проекты</h2>

        <div className="projects-grid">
          {projects.map((project) => (
            <article className="project-card" key={project.id}>
              <img src={project.image} alt={project.title} />
              <div className="project-card-content">
                <h3>{project.title}</h3>
                <p>{project.description}</p>
                <Link to={`/project/${project.id}`}>Подробнее</Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <div className="ticks"></div>

      <section id="next-steps">
        <div id="social">
          <svg className="icon" role="presentation" aria-hidden="true">
            <use href="/icons.svg#social-icon"></use>
          </svg>
          <h2>Connect with us</h2>
          <p>Join the Vite community</p>
          <ul>
            <li>
              <a href="https://github.com/vitejs/vite" target="_blank">
                <svg className="button-icon" role="presentation" aria-hidden="true">
                  <use href="/icons.svg#github-icon"></use>
                </svg>
                GitHub
              </a>
            </li>
            <li>
              <a href="https://chat.vite.dev/" target="_blank">
                <svg className="button-icon" role="presentation" aria-hidden="true">
                  <use href="/icons.svg#discord-icon"></use>
                </svg>
                Discord
              </a>
            </li>
            <li>
              <a href="https://x.com/vite_js" target="_blank">
                <svg className="button-icon" role="presentation" aria-hidden="true">
                  <use href="/icons.svg#x-icon"></use>
                </svg>
                X.com
              </a>
            </li>
            <li>
              <a href="https://bsky.app/profile/vite.dev" target="_blank">
                <svg className="button-icon" role="presentation" aria-hidden="true">
                  <use href="/icons.svg#bluesky-icon"></use>
                </svg>
                Bluesky
              </a>
            </li>
          </ul>
        </div>
      </section>

      <div className="ticks"></div>
      <section id="spacer"></section>
    </>
  )
}

function AboutPage() {
  return (
      <section id="center">
        <h1 className="text-3xl font-bold text-blue-600">About</h1>
        <p>Это отдельная страница.</p>
      </section>
  )
}

function NotFoundPage() {
  return (
      <section id="center">
        <h1 className="text-3xl font-bold text-red-600">404</h1>
        <p>Страница не найдена.</p>
      </section>
  )
}

function App() {
  return (
      <>
        <nav>
          <Link to="/">Главная</Link>
          {' | '}
          <Link to="/project/1">Проект</Link>
        </nav>

        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/project/1" element={<AboutPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </>
  )
}

export default App