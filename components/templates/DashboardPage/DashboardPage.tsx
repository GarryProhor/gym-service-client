import {useEffect, useState} from 'react'
import {toast} from 'react-toastify'
import {getBestsellersOrNewPartsFx} from '@/app/api/gymParts'
import BrandsSlider from '@/components/modules/DashboardPage/BrandsSlider'
import {IGymParts} from '@/types/gymparts'
import styles from '@/styles/dashboard/index.module.scss'
import {useStore} from 'effector-react'
import {$mode} from '@/context/mode'
import DashboardSlider from '@/components/modules/DashboardPage/DashboardSlider'
import {$shoppingCart} from '@/context/shopping-cart'
import {AnimatePresence, motion} from 'framer-motion'
import CartAlert from '@/components/modules/DashboardPage/CartAlert'

const DashboardPage = () => {
  const [newParts, setNewParts] = useState<IGymParts>({} as IGymParts)
  const [bestsellers, setBestsellers] = useState<IGymParts>(
    {} as IGymParts
  )
  const [spinner, setSpinner] = useState(false)
  const shoppingCart = useStore($shoppingCart)
  const [showAlert, setShowAlert] = useState(!!shoppingCart.length)
  const mode = useStore($mode)
  const darkModeClass = mode === 'dark' ? `${styles.dark_mode}` : ''

  useEffect(() => {
    loadGymParts()
  }, [])

  useEffect(() => {
    if (shoppingCart.length) {
      setShowAlert(true)
      return
    }

    setShowAlert(false)
  }, [shoppingCart.length])

  const loadGymParts = async () => {
    try {
      setSpinner(true)
      const bestsellers = await getBestsellersOrNewPartsFx(
        '/gym-parts/bestsellers'
      )
      const newParts = await getBestsellersOrNewPartsFx('/gym-parts/new')

      setBestsellers(bestsellers)
      setNewParts(newParts)
    } catch (error) {
      toast.error((error as Error).message)
    } finally {
      setSpinner(false)
    }
  }

  const closeAlert = () => setShowAlert(false)

  return (
    <section className={styles.dashboard}>
      <div className={`container ${styles.dashboard__container}`}>
        <AnimatePresence>
          {showAlert && (
            <motion.div
              initial={{opacity: 0}}
              animate={{opacity: 1}}
              exit={{opacity: 0}}
              className={`${styles.dashboard__alert} ${darkModeClass}`}
            >
              <CartAlert
                count={shoppingCart.reduce(
                  (defaultCount, item) => defaultCount + item.count,
                  0
                )}
                closeAlert={closeAlert}
              />
            </motion.div>
          )}
        </AnimatePresence>
        <div className={styles.dashboard__brands}>
          <BrandsSlider/>
        </div>
        <h2 className={`${styles.dashboard__title} ${darkModeClass}`}>
          Запчасти к тренажерам
        </h2>
        <div className={styles.dashboard__parts}>
          <h3 className={`${styles.dashboard__parts__title} ${darkModeClass}`}>
            Хиты продаж
          </h3>
          <DashboardSlider items={bestsellers.rows || []} spinner={spinner}/>
        </div>
        <div className={styles.dashboard__parts}>
          <h3 className={`${styles.dashboard__parts__title} ${darkModeClass}`}>
            Новинки
          </h3>
          <DashboardSlider items={newParts.rows || []} spinner={spinner}/>
        </div>
        <div className={styles.dashboard__about}>
          <h3
            className={`${styles.dashboard__parts__title} ${styles.dashboard__about__title} ${darkModeClass}`}
          >
            О компании
          </h3>
          <p className={`${styles.dashboard__about__text} ${darkModeClass}`}>
            Поскольку многие наши компании-поставщики имеют производства в разных странах Европейского Содружества, а
            также в Латинской Америке, в Юго-Восточной Азии, в Африке и в Австралии, в действительности мы поставляем
            тренажеры и товары со всего мира. Широкий круг постоянных поставщиков позволяет нам
            удовлетворять самые непредсказуемые пожелания наших клиентов.
            Осуществляем доставку по всей Беларуси.
          </p>
        </div>
      </div>
    </section>
  )
}

export default DashboardPage
