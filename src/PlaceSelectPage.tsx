import { useNavigate } from 'react-router-dom'
import './PlaceSelectPage.css'

const places = [
  {
    id: 1,
    title: 'Лесной дом',
    description: 'Творческое пространство рядом с парком',
    address: 'Москва, Лесная улица, 12',
    price: '1000 ₽/час',
    position: {
      top: '34%',
      left: '46%',
    },
  },
  {
    id: 2,
    title: 'Перекресток',
    description: 'Зал для встреч и мастер-классов',
    address: 'Москва, Тверская улица, 8',
    price: '1500 ₽/час',
    position: {
      top: '48%',
      left: '58%',
    },
  },
  {
    id: 3,
    title: 'Светлая студия',
    description: 'Небольшой зал с окнами и столами',
    address: 'Москва, Арбат, 20',
    price: '1200 ₽/час',
    position: {
      top: '56%',
      left: '38%',
    },
  },
  {
    id: 4,
    title: 'Дом творчества',
    description: 'Подходит для детских занятий',
    address: 'Москва, Покровка, 15',
    price: '900 ₽/час',
    position: {
      top: '42%',
      left: '72%',
    },
  },
]

function PlaceSelectPage() {
  const navigate = useNavigate()

  return (
    <main className="place-select-page">
      <header className="place-select-header">
        <button type="button" onClick={() => navigate(-1)} aria-label="Назад">
          ←
        </button>
        <div>
          <h1>Выбор места</h1>
          <p>Выберите площадку для проведения проекта</p>
        </div>
      </header>

      <section className="place-map-card">
        <iframe
          className="place-map"
          title="Карта мест проведения проектов"
          src="https://www.google.com/maps?q=Moscow&z=12&output=embed"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
        />

        <div className="place-map-markers" aria-label="Места проведения проектов">
          {places.map((place) => (
            <button
              className="place-map-marker"
              style={place.position}
              type="button"
              key={place.id}
              aria-label={place.title}
            >
              📍
            </button>
          ))}
        </div>
      </section>

      <section className="place-list">
        <h2>Доступные места</h2>

        {places.map((place) => (
          <article className="place-card" key={place.id}>
            <div className="place-card-icon">📍</div>

            <div className="place-card-content">
              <h3>{place.title}</h3>
              <p>{place.description}</p>
              <span>{place.address}</span>
            </div>

            <div className="place-card-action">
              <strong>{place.price}</strong>
              <button type="button" onClick={() => navigate('/project/1/edit')}>
                Выбрать
              </button>
            </div>
          </article>
        ))}
      </section>
    </main>
  )
}

export default PlaceSelectPage
