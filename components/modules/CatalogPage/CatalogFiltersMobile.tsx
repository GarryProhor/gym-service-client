import { useStore } from 'effector-react'
import { $mode } from '@/context/mode'
import { ICatalogFilterMobileProps } from '@/types/catalog'
import spinnerStyles from '@/styles/spinner/index.module.scss'
import FiltersPopupTop from './FiltersPopupTop'
import styles from '@/styles/catalog/index.module.scss'
import FiltersPopup from './FiltersPopup'
import {
  $gymManufacturers,
  $partsManufacturers,
  setGymManufacturers,
  setPartsManufacturers,
  updateGymManufacturer,
  updatePartsManufacturer,
} from '@/context/gymParts'
import { useState } from 'react'
import Accordion from '@/components/elements/Accordion/Accordion'
import PriceRange from './PriceRange'
import { useMediaQuery } from '@/hooks/useMediaQuery'

const CatalogFiltersMobile = ({
                                spinner,
                                resetFilterBtnDisabled,
                                resetFilters,
                                closePopup,
                                applyFilters,
                                filtersMobileOpen,
                                setIsPriceRangeChanged,
                                priceRange,
                                setPriceRange,
                              }: ICatalogFilterMobileProps) => {
  const mode = useStore($mode)
  const darkModeClass = mode === 'dark' ? `${styles.dark_mode}` : ''
  const gymManufacturers = useStore($gymManufacturers)
  const partsManufacturers = useStore($partsManufacturers)
  const [openGym, setOpenGym] = useState(false)
  const [openParts, setOpenParts] = useState(false)
  const handleOpenGyms = () => setOpenGym(true)
  const handleCloseGyms = () => setOpenGym(false)
  const handleOpenParts = () => setOpenParts(true)
  const handleCloseParts = () => setOpenParts(false)
  const isAnyGymManufacturerChecked = gymManufacturers.some(
    (item) => item.checked
  )
  const isAnyPartsManufacturerChecked = partsManufacturers.some(
    (item) => item.checked
  )
  const isMobile = useMediaQuery(820)

  const resetAllGymManufacturers = () =>
    setGymManufacturers(
      gymManufacturers.map((item) => ({ ...item, checked: false }))
    )

  const resetAllPartsManufacturers = () =>
    setPartsManufacturers(
      partsManufacturers.map((item) => ({ ...item, checked: false }))
    )

  const applyFiltersAndClosePopup = () => {
    applyFilters()
    closePopup()
  }

  return (
    <div
      className={`${styles.catalog__bottom__filters} ${darkModeClass} ${
        filtersMobileOpen ? styles.open : ''
      }`}
    >
      <div>
        <FiltersPopupTop
          resetBtnText="Сбросить все"
          title="Фильтры"
          resetFilters={resetFilters}
          resetFilterBtnDisabled={resetFilterBtnDisabled}
          closePopup={closePopup}
        />
        <div>
          <button
            className={`${styles.filters__manufacturer__btn} ${darkModeClass}`}
            onClick={handleOpenGyms}
          >
            Производитель котлов
          </button>
          <FiltersPopup
            title="Тренажеры"
            resetFilterBtnDisabled={!isAnyGymManufacturerChecked}
            updateManufacturer={updateGymManufacturer}
            setManufacturer={setGymManufacturers}
            applyFilters={applyFiltersAndClosePopup}
            manufacturersList={gymManufacturers}
            resetAllManufacturers={resetAllGymManufacturers}
            handleClosePopup={handleCloseGyms}
            openPopup={openGym}
          />
        </div>
        <div>
          <button
            className={`${styles.filters__manufacturer__btn} ${darkModeClass}`}
            onClick={handleOpenParts}
          >
            Производитель запчастей
          </button>
          <FiltersPopup
            title="Запчасти и аксесуары"
            resetFilterBtnDisabled={!isAnyPartsManufacturerChecked}
            updateManufacturer={updatePartsManufacturer}
            setManufacturer={setPartsManufacturers}
            applyFilters={applyFiltersAndClosePopup}
            manufacturersList={partsManufacturers}
            resetAllManufacturers={resetAllPartsManufacturers}
            handleClosePopup={handleCloseParts}
            openPopup={openParts}
          />
        </div>
        <div className={styles.filters__price}>
          <Accordion
            title="Цена"
            titleClass={`${styles.filters__manufacturer__btn} ${darkModeClass}`}
            hideArrowClass={styles.hide_arrow}
            isMobileForFilters={isMobile}
          >
            <div className={styles.filters__manufacturer__inner}>
              <PriceRange
                priceRange={priceRange}
                setPriceRange={setPriceRange}
                setIsPriceRangeChanged={setIsPriceRangeChanged}
              />
              <div style={{ height: 24 }} />
            </div>
          </Accordion>
        </div>
      </div>
      <div className={styles.filters__actions}>
        <button
          className={styles.filters__actions__show}
          onClick={applyFiltersAndClosePopup}
          disabled={resetFilterBtnDisabled}
        >
          {spinner ? (
            <span
              className={spinnerStyles.spinner}
              style={{ top: 6, left: '47%' }}
            />
          ) : (
            'Показать'
          )}
        </button>
      </div>
    </div>
  )
}

export default CatalogFiltersMobile
