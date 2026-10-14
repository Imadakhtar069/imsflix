
import { useState, useEffect } from 'react'
import './App.css'
import { supabase } from './supabase'

export default function App() {
  const [intro, setIntro] = useState(true)
  const [privateOpen, setPrivateOpen] = useState(false)
  const [password, setPassword] = useState('')
  const [unlocked, setUnlocked] = useState(false)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('ALL')

  const [admin, setAdmin] = useState(false)
  const [adminEmail, setAdminEmail] = useState('')
  const [adminPassword, setAdminPassword] = useState('')
  const [adminMessage, setAdminMessage] = useState('')
  const [showAdmin, setShowAdmin] = useState(false)

  const [newTitle, setNewTitle] = useState('')
  const [newYear, setNewYear] = useState('')
  const [newType, setNewType] = useState('ACTION')
  const [newVideoUrl, setNewVideoUrl] = useState('')
  const [movieFile, setMovieFile] = useState(null)

  const [dbMovies, setDbMovies] = useState([])
  const [loadingMovies, setLoadingMovies] = useState(true)

  const categories = ['ALL', 'ACTION', 'SCI-FI', 'THRILLER']

  useEffect(() => {
    const timer = setTimeout(() => setIntro(false), 2500)
    return () => clearTimeout(timer)
  }, [])

  async function loadMovies() {
    setLoadingMovies(true)

    const { data, error } = await supabase
      .from('movies')
      .select('*')
      .eq('published', true)

    if (error) {
      console.error('Movies load error:', error.message)
    } else {
      setDbMovies(data || [])
    }

    setLoadingMovies(false)
  }

  useEffect(() => {
    loadMovies()
  }, [])

  const movies = [
    {
      title: 'Interstellar',
      year: '2014',
      type: 'SCI-FI',
      art: 'poster-one',
    },
    {
      title: 'Inception',
      year: '2010',
      type: 'THRILLER',
      art: 'poster-two',
    },
    {
      title: 'The Dark Knight',
      year: '2008',
      type: 'ACTION',
      art: 'poster-three',
    },
    {
      title: 'Dune: Part Two',
      year: '2024',
      type: 'SCI-FI',
      art: 'poster-four',
    },
    {
      title: 'Liger',
      year: '2022',
      type: 'ACTION',
      art: 'poster-four',
      download: '/movies/liger.mp4.mkv',
    },
  ]

  function unlockPrivate(e) {
    e.preventDefault()

    if (password === '284965') {
      setUnlocked(true)
      setError('')
    } else {
      setError('ACCESS DENIED — TRY AGAIN')
    }
  }

  async function loginAdmin(e) {
    e.preventDefault()
    setAdminMessage('Checking login...')

    const { error } = await supabase.auth.signInWithPassword({
      email: adminEmail,
      password: adminPassword,
    })

    if (error) {
      setAdminMessage('Login failed: ' + error.message)
      return
    }

    setAdmin(true)
    setShowAdmin(true)
    setAdminMessage('Admin login successful')
  }

  async function logoutAdmin() {
    const { error } = await supabase.auth.signOut()

    if (error) {
      setAdminMessage('Logout failed: ' + error.message)
      return
    }

    setAdmin(false)
    setShowAdmin(false)
    setAdminEmail('')
    setAdminPassword('')
    setAdminMessage('')
  }

  async function addMovie(e) {
    e.preventDefault()
    setAdminMessage('Uploading movie...')

    try {
      let videoUrl = newVideoUrl.trim()

      if (movieFile) {
        const safeName = movieFile.name.replace(
          /[^a-zA-Z0-9._-]/g,
          '_'
        )
        const filePath = `${Date.now()}-${safeName}`

        const { error: uploadError } = await supabase.storage
          .from('movies')
          .upload(filePath, movieFile)

        if (uploadError) {
          setAdminMessage('Upload failed: ' + uploadError.message)
          return
        }

        videoUrl = supabase.storage
          .from('movies')
          .getPublicUrl(filePath).data.publicUrl
      }

      if (!newTitle.trim() || !newYear || !videoUrl) {
        setAdminMessage(
          'Movie name, year aur video file ya URL bharo.'
        )
        return
      }

      const { data, error } = await supabase
        .from('movies')
        .insert([
          {
            title: newTitle.trim(),
            year: Number(newYear),
            type: newType,
            published: true,
            video_url: videoUrl,
          },
        ])
        .select()

      if (error) {
        setAdminMessage('Database error: ' + error.message)
        return
      }

      setDbMovies((prev) => [...prev, ...(data || [])])
      setNewTitle('')
      setNewYear('')
      setNewType('ACTION')
      setNewVideoUrl('')
      setMovieFile(null)
      setAdminMessage('Movie added successfully!')
    } catch (err) {
      setAdminMessage('Error: ' + err.message)
    }
  }

  if (intro) {
    return (
      <main className="intro-screen">
        <div className="intro-orbit orbit-one" />
        <div className="intro-orbit orbit-two" />
        <div className="intro-orbit orbit-three" />

        <div className="intro-core">
          <span className="intro-line">
            PREPARE FOR THE EXPERIENCE
          </span>
          <h1>
            A CREATION <span>BY IMS</span>
          </h1>
          <div className="loading-line">
            <i />
          </div>
        </div>
      </main>
    )
  }

  if (privateOpen) {
    return (
      <main className="private-screen">
        <div className="matrix-grid" />

        <button
          className="back-button"
          onClick={() => {
            setPrivateOpen(false)
            setUnlocked(false)
            setPassword('')
            setError('')
          }}
        >
          ← BACK TO HOME
        </button>

        {!unlocked ? (
          <form className="access-panel" onSubmit={unlockPrivate}>
            <div className="security-icon">IMS</div>
            <span className="eyebrow">
              RESTRICTED ZONE / 001
            </span>
            <h1>
              IMS <span>PRIVATE</span>
            </h1>
            <p>FOR NEW RELEASED ONE</p>

            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="ENTER ACCESS CODE"
              maxLength={30}
              autoComplete="off"
            />

            <button className="unlock-button" type="submit">
              UNLOCK ACCESS
            </button>

            {error && (
              <div className="access-error">{error}</div>
            )}
          </form>
        ) : (
          <section className="reveal-panel">
            <div className="reveal-rings">
              <div />
              <div />
              <div />
              <div />
            </div>

            <div className="reveal-content">
              <span className="eyebrow">ACCESS GRANTED</span>
              <h1>LAUDA LE</h1>
              <div
                className="middle-finger"
                role="img"
                aria-label="Middle finger gesture"
              >
                🖕
              </div>
            </div>
          </section>
        )}
      </main>
    )
  }

  const allMovies = [
    ...movies,
    ...dbMovies.map((movie) => ({
      title: movie.title,
      year: String(movie.year || ''),
      type: movie.type || movie.genre || 'ACTION',
      art: 'poster-four',
      download:
        movie.download ||
        movie.video_url ||
        movie.file_url ||
        '',
    })),
  ]

  if (showAdmin) {
    return (
      <main className="private-screen">
        <button
          className="back-button"
          onClick={() => setShowAdmin(false)}
        >
          BACK TO HOME
        </button>

        <section className="access-panel">
          <span className="eyebrow">
            OWNER CONTROL CENTER
          </span>
          <h1>
            IMS <span>ADMIN</span>
          </h1>

          {!admin ? (
            <form onSubmit={loginAdmin}>
              <input
                type="email"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                placeholder="Admin email"
                required
              />

              <input
                type="password"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                placeholder="Admin password"
                required
              />

              <button className="unlock-button" type="submit">
                ADMIN LOGIN
              </button>
            </form>
          ) : (
            <div>
              <p>Admin login successful.</p>
              <p>Owner access enabled.</p>

              <form onSubmit={addMovie}>
                <input
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Movie name"
                  required
                />

                <input
                  value={newYear}
                  onChange={(e) => setNewYear(e.target.value)}
                  placeholder="Release year"
                  type="number"
                  min="1888"
                  max="2100"
                  required
                />

                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value)}
                >
                  <option value="ACTION">ACTION</option>
                  <option value="SCI-FI">SCI-FI</option>
                  <option value="THRILLER">THRILLER</option>
                </select>

                <input
                  value={newVideoUrl}
                  onChange={(e) => setNewVideoUrl(e.target.value)}
                  placeholder="Direct video URL (optional if file selected)"
                  type="url"
                />

                <label>
                  Select movie from laptop
                  <input
                    type="file"
                    accept="video/*,.mkv"
                    onChange={(e) =>
                      setMovieFile(e.target.files?.[0] || null)
                    }
                  />
                </label>

                {movieFile && (
                  <p>Selected: {movieFile.name}</p>
                )}

                <button
                  className="unlock-button"
                  type="submit"
                >
                  ADD MOVIE
                </button>
              </form>

              <button
                className="unlock-button"
                onClick={logoutAdmin}
                type="button"
              >
                LOG OUT
              </button>
            </div>
          )}

          {adminMessage && <p>{adminMessage}</p>}
        </section>
      </main>
    )
  }

  const filteredMovies = allMovies
    .filter(
      (movie) =>
        category === 'ALL' || movie.type === category
    )
    .filter((movie) =>
      movie.title.toLowerCase().includes(search.toLowerCase())
    )

  return (
    <main className="app-shell">
      <header className="topbar">
        <a
          className="brand"
          href="#"
          onClick={(e) => e.preventDefault()}
        >
          <span className="brand-mark">I</span>
          <span>
            IMS<span className="brand-light">FLIX</span>
          </span>
        </a>

        <nav>
          <a className="active" href="#home">HOME</a>
          <a href="#movies">MOVIES</a>
          <a href="#movies">DISCOVER</a>
        </nav>

        <button
          className="private-trigger"
          onClick={() => setPrivateOpen(true)}
        >
          <span className="private-logo">I</span>
          <span>
            <small>IMS PRIVATE</small>
            <strong>NEW RELEASED</strong>
          </span>
        </button>

        <button
          className="private-trigger"
          onClick={() => {
            setAdminMessage('')
            setShowAdmin(true)
          }}
        >
          <span>
            <small>OWNER ACCESS</small>
            <strong>ADMIN PANEL</strong>
          </span>
        </button>
      </header>

      <section className="hero" id="home">
        <div className="hero-glow" />

        <div className="hero-content">
          <span className="eyebrow">
            <i /> THE CINEMA, REIMAGINED
          </span>

          <h1>
            YOUR WORLD.<br />
            <span>YOUR CINEMA.</span>
          </h1>

          <p>
            A universe of stories. One destination.<br />
            Discover your next unforgettable experience.
          </p>

          <a className="explore-button" href="#movies">
            EXPLORE LIBRARY <span>↗</span>
          </a>

          <div className="hero-meta">
            <span>01 / IMS ORIGINAL DESIGN</span>
            <span>FULL HD READY</span>
          </div>
        </div>

        <div className="hero-art" aria-hidden="true">
          <div className="hero-ring ring-a" />
          <div className="hero-ring ring-b" />
          <div className="hero-ring ring-c" />
          <div className="hero-monogram">
            I<span>M</span>S
          </div>
          <div className="floating-label">
            BEYOND<br />THE SCREEN
          </div>
        </div>
      </section>

      <section className="library" id="movies">
        <div className="section-heading">
          <div>
            <span className="eyebrow">
              YOUR MOVIE COLLECTION
            </span>
            <h2>
              Explore <span>the library.</span>
            </h2>
          </div>

          <label className="search-box">
            <span>⌕</span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search titles..."
            />
          </label>
        </div>

        <div className="category-list">
          {categories.map((item) => (
            <button
              key={item}
              className={`category-button ${
                category === item ? 'selected' : ''
              }`}
              onClick={() => setCategory(item)}
            >
              {item}
            </button>
          ))}
        </div>

        {loadingMovies && (
          <p className="demo-note">Loading movie library...</p>
        )}

        <div className="movie-grid">
          {filteredMovies.map((movie, index) => (
            <article className="movie-card" key={movie.title}>
              <div className={`movie-art ${movie.art}`}>
                <span className="movie-type">{movie.type}</span>

                <span className="movie-number">
                  IMS / {String(index + 1).padStart(2, '0')}
                </span>

                <div className="movie-symbol">
                  {movie.title.slice(0, 1)}
                </div>

                <span className="movie-caption">
                  {movie.title}
                </span>
              </div>

              <div className="movie-info">
                <strong>{movie.title}</strong>
                <span>{movie.year} · MOVIE</span>
              </div>

              {movie.download ? (
                <a
                  className="trailer-button download-button"
                  href={movie.download}
                  download
                  target="_blank"
                  rel="noreferrer"
                >
                  DOWNLOAD MOVIE
                </a>
              ) : (
                <button
                  className="trailer-button download-button"
                  onClick={() => {
                    alert(
                      `${movie.title} ki authorized download file abhi add nahi hui hai.`
                    )
                  }}
                >
                  DOWNLOAD UNAVAILABLE
                </button>
              )}
            </article>
          ))}
        </div>

        {filteredMovies.length === 0 && !loadingMovies && (
          <p className="demo-note">
            No movies found. Try another title.
          </p>
        )}

        <p className="demo-note">
          DOWNLOAD LIBRARY · Only available movie files can be downloaded.
        </p>
      </section>

      <footer>
        <span>IMSFLIX</span>
        <span>A CREATION BY IMS</span>
        <span>DESIGNED FOR CINEMA LOVERS</span>
      </footer>
    </main>
  )
}
