import { useState } from 'react'
import { Link, Route, Routes } from 'react-router-dom'
import ProjectPage from './ProjectPage'
import EditProjectPage from './EditProjectPage'
import PlaceSelectPage from './PlaceSelectPage'
import './App.css'

const projects = [
  {
    id: 1,
    userId: 101,
    passportId: 1001,
    placeId: 201,
    latitude: '55.755864',
    longitude: '37.617698',
    title: 'Детская робототехника',
    description: 'Проект для детей, которые хотят собрать своего первого робота.',
    image: 'https://thumbs.dreamstime.com/z/none-165853060.jpg',
    ageFrom: 7,
    ageTo: 12,
    deletedA: false,
  },
  {
    id: 2,
    userId: 102,
    passportId: 1002,
    placeId: 202,
    latitude: '59.939095',
    longitude: '30.315868',
    title: 'Творческая мастерская',
    description: 'Рисование, лепка и создание поделок в дружной команде.',
    image: 'https://thumbs.dreamstime.com/z/none-165853060.jpg',
    ageFrom: 5,
    ageTo: 10,
    deletedA: false,
  },
  {
    id: 3,
    userId: 103,
    passportId: 1003,
    placeId: 203,
    latitude: '56.838011',
    longitude: '60.597465',
    title: 'Спортивные встречи',
    description: 'Активные занятия, игры и тренировки на свежем воздухе.',
    image: 'https://thumbs.dreamstime.com/z/none-165853060.jpg',
    ageFrom: 8,
    ageTo: 14,
    deletedA: false,
  },
]

function HomePage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <>
      <header className="home-header">
        <button
          className="home-header-menu-button"
          type="button"
          aria-label={isMenuOpen ? 'Закрыть меню' : 'Открыть меню'}
          aria-expanded={isMenuOpen}
          onClick={() => setIsMenuOpen((isMenuOpen) => !isMenuOpen)}
        >
          {isMenuOpen ? '×' : '☰'}
        </button>

        <div className="home-header-user">
          <img
              src="https://i.pravatar.cc/120?img=5"
              alt="Настя Галкина"
          />
          <span>Настя Галкина</span>
        </div>

        <div className="home-header-ai-actions" aria-label="Общение с АИ">
          <button type="button" aria-label="Чат с АИ">
            🤖
          </button>
          <button type="button" aria-label="Голосовой помощник">
            🎙️
          </button>
          <button type="button" aria-label="Идеи от АИ">
            ✨
          </button>
        </div>
      </header>

      {isMenuOpen && (
        <section className="home-menu">
          <header className="home-menu-header">
            <div className="home-menu-logo">Menu</div>

            <div className="home-menu-profile">
              <img
                  src="https://i.pravatar.cc/120?img=5"
                  alt="Настя Галкина"
              />
              <div>
                <strong>Настя Галкина</strong>
                <span>10 лет</span>
              </div>
            </div>
          </header>

          <div className="home-menu-list">
            <button className="home-menu-item home-menu-item-primary" type="button">
              <span className="home-menu-icon">+</span>
              <span>Новая идея</span>
            </button>

            <Link className="home-menu-item" to="/" onClick={() => setIsMenuOpen(false)}>
              <span className="home-menu-icon">💡</span>
              <span>Мои проекты и идеи</span>
            </Link>

            <Link className="home-menu-item" to="/" onClick={() => setIsMenuOpen(false)}>
              <span className="home-menu-icon">📅</span>
              <span>Календарь</span>
            </Link>
          </div>

          <div className="home-menu-footer">
            <button className="home-menu-item home-menu-item-primary" type="button">
              <span className="home-menu-icon">+</span>
              <span>Новый проект</span>
            </button>

            <Link className="home-menu-item" to="/" onClick={() => setIsMenuOpen(false)}>
              <span className="home-menu-icon">📁</span>
              <span>Мои проекты</span>
            </Link>
          </div>
        </section>
      )}

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
    </>
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
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/project/1" element={<ProjectPage />} />
          <Route path="/project/1/edit" element={<EditProjectPage/>} />
          <Route path="/project/1/edit/place" element={<PlaceSelectPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </>
  )
}

export default App