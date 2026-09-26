import { NavLink, Outlet } from 'react-router-dom'

export default function Layout() {
  const classeDoLink = ({ isActive }) => `menu__link${isActive ? ' menu__link--ativo' : ''}`

  return (
    <>
      <header className="topo">
        <NavLink to="/" className="marca">
          Cotador <strong>FIPE</strong>
        </NavLink>
        <nav className="menu">
          <NavLink to="/" end className={classeDoLink}>
            Nova cotação
          </NavLink>
          <NavLink to="/cotacoes" className={classeDoLink}>
            Cotações
          </NavLink>
        </nav>
      </header>

      <main className="conteudo">
        <Outlet />
      </main>
    </>
  )
}
