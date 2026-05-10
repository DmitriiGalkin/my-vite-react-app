import { useState } from 'react'
import { Link, Route, Routes } from 'react-router-dom'
import ProjectPage from './ProjectPage'
import EditProjectPage from './EditProjectPage'
import PlaceSelectPage from './PlaceSelectPage'
import './App.css'
import type { Project } from './types'
import { useQuery } from '@tanstack/react-query'

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000'

async function fetchProjects(): Promise<Project[]> {
    const response = await fetch(`${API_URL}/projects`)

    if (!response.ok) {
        throw new Error('Не удалось загрузить проекты')
    }

    return response.json()
}

function HomePage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

    const {
        data: projects = [],
        isLoading: isProjectsLoading,
        isError: isProjectsError,
    } = useQuery({
        queryKey: ['projects'],
        queryFn: fetchProjects,
    })

    console.log(projects,'projects')

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

          {isProjectsLoading && <p>Загрузка проектов...</p>}
          {isProjectsError && <p>Не удалось загрузить проекты.</p>}

          {!isProjectsLoading && !isProjectsError && (
          <div className="projects-grid">
          {projects.map((project) => (
              <article className="project-card" key={project.id}>
                <img src={project.image || ''} alt={project.title || ''} />
                <div className="project-card-content">
                  <h3>{project.title} 2</h3>
                  <p>{project.description}</p>
                  <Link to={`/project/${project.id}`}>Подробнее</Link>
                </div>
              </article>
          ))}
        </div>
      )}
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