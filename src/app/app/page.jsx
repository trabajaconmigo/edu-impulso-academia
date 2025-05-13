import React from 'react'
import Head from 'next/head'
import styles from './Dashboard.module.css'

export default function Dashboard() {
  return (
    <>
      <Head>
        {/* Evitar indexado y seguimiento de enlaces */}
        <meta name="robots" content="noindex, nofollow" />
        <title>MiPresupuesto – Dashboard</title>
      </Head>

      <div className={styles.container}>
        {/* Sidebar */}
        <aside className={styles.sidebar}>
          <div className={styles.logo}>MiPresupuesto</div>
          <nav>
            <ul className={styles.navList}>
              <li className={`${styles.navItem} ${styles.active}`}>Presupuesto</li>
              <li className={styles.navItem}>Plan de Pagos</li>
              <li className={styles.navItem}>Metas</li>
              <li className={styles.navItem}>Transacciones</li>
              <li className={styles.navItem}>Cuentas</li>
              <li className={styles.navItem}>Ajustes</li>
            </ul>
          </nav>
        </aside>

        {/* Main Content */}
        <main className={styles.main}>
          {/* Header */}
          <header className={styles.header}>
            <div>
              <h1 className={styles.headerTitle}>MAYO 2025</h1>
              <p className={styles.headerSubtitle}>
                770 pesos restantes para presupuestar
              </p>
            </div>
            <button className={styles.primaryButton}>+ Nuevo</button>
          </header>

          {/* Cuentas resumen */}
          <section className={styles.summaryCards}>
            <div className={styles.summaryCard}>
              <p>Cuenta Cheques</p>
              <h3>$3,200.00</h3>
            </div>
            <div className={styles.summaryCard}>
              <p>Ahorros</p>
              <h3>$5,000.00</h3>
            </div>
            <div className={styles.summaryCard}>
              <p>Crédito</p>
              <h3>-$1,200.00</h3>
            </div>
          </section>

          {/* Panels principales */}
          <div className={styles.panels}>
            {/* Ingresos */}
            <section className={styles.card}>
              <h2 className={styles.cardTitle}>Ingresos</h2>
              <table className={styles.table}>
                <tbody>
                  <tr>
                    <td>Sueldo 1</td>
                    <td>1.000,00</td>
                    <td>Recibido</td>
                  </tr>
                  <tr>
                    <td>Sueldo 2</td>
                    <td>1.000,00</td>
                    <td>Recibido</td>
                  </tr>
                  <tr className={styles.actionRow}>
                    <td colSpan={3}>
                      <a href="#" className={styles.actionLink}>
                        Añadir ingreso
                      </a>
                    </td>
                  </tr>
                </tbody>
              </table>
            </section>

            {/* Donaciones */}
            <section className={styles.card}>
              <h2 className={styles.cardTitle}>Donaciones</h2>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th></th>
                    <th>Asignado</th>
                    <th>Restante</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Iglesia</td>
                    <td>0,00</td>
                    <td>0,00</td>
                  </tr>
                  <tr>
                    <td>Caridad</td>
                    <td>0,00</td>
                    <td>0,00</td>
                  </tr>
                </tbody>
              </table>
            </section>

            {/* Ahorros */}
            <section className={styles.card}>
              <h2 className={styles.cardTitle}>Ahorros</h2>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th></th>
                    <th>Asignado</th>
                    <th>Restante</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Fondo de emergencia</td>
                    <td>0,00</td>
                    <td>0,00</td>
                  </tr>
                  <tr className={styles.actionRow}>
                    <td colSpan={3}>
                      <a href="#" className={styles.actionLink}>
                        Añadir categoría
                      </a>
                    </td>
                  </tr>
                </tbody>
              </table>
            </section>
          </div>

          {/* Próximos pagos */}
          <section className={styles.card}>
            <h2 className={styles.cardTitle}>Próximos pagos</h2>
            <table className={styles.table}>
              <tbody>
                <tr>
                  <td>Servicio de luz</td>
                  <td>15 Mayo</td>
                  <td>$600.00</td>
                </tr>
                <tr>
                  <td>Renta</td>
                  <td>01 Junio</td>
                  <td>$8,000.00</td>
                </tr>
              </tbody>
            </table>
          </section>

          {/* Metas */}
          <section className={styles.card}>
            <h2 className={styles.cardTitle}>Metas</h2>
            <ul className={styles.goalList}>
              <li>
                <div className={styles.goalInfo}>
                  <span>Viaje a Cancún</span>
                  <span>4,000 / 10,000</span>
                </div>
                <div className={styles.progressBar}>
                  <div className={styles.progressFill} style={{ width: '40%' }} />
                </div>
              </li>
              <li>
                <div className={styles.goalInfo}>
                  <span>Nuevo equipo</span>
                  <span>2,500 / 5,000</span>
                </div>
                <div className={styles.progressBar}>
                  <div className={styles.progressFill} style={{ width: '50%' }} />
                </div>
              </li>
            </ul>
          </section>

          {/* Transacciones recientes */}
          <section className={styles.card}>
            <h2 className={styles.cardTitle}>Transacciones recientes</h2>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Descripción</th>
                  <th>Importe</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>03/05/2025</td>
                  <td>Supermercado</td>
                  <td>-$750.00</td>
                </tr>
                <tr>
                  <td>02/05/2025</td>
                  <td>Cafetería</td>
                  <td>-$120.00</td>
                </tr>
                <tr>
                  <td>01/05/2025</td>
                  <td>Pago nómina</td>
                  <td>$1,000.00</td>
                </tr>
              </tbody>
            </table>
          </section>
        </main>
      </div>
    </>
  )
}
