import { getGymPartsFx } from '@/app/api/gymParts'
import FilterSelect from '@/components/modules/CatalogPage/FilterSelect'
import ManufacturersBlock from '@/components/modules/CatalogPage/ManufacturersBlock'
import {
  $gymManufacturers,
  $gymParts,
  $filteredGymParts,
  $partsManufacturers,
  setGymManufacturers,
  setGymParts,
  setPartsManufacturers,
  updateGymManufacturer,
  updatePartsManufacturer,
} from '@/context/gymParts'
import { $mode } from '@/context/mode'
import styles from '@/styles/catalog/index.module.scss'
import { useStore } from 'effector-react'
import { AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import skeletonStyles from '@/styles/skeleton/index.module.scss'
import CatalogItem from '@/components/modules/CatalogPage/CatalogItem'
import ReactPaginate from 'react-paginate'
import { IQueryParams } from '@/types/catalog'
import { useRouter } from 'next/router'
import { IGymParts } from '@/types/gymparts'
import CatalogFilters from '@/components/modules/CatalogPage/CatalogFilters'
import { usePopup } from '@/hooks/usePoup'
import { checkQueryParams } from '@/utils/catalog'
import FilterSvg from '@/components/elements/FilterSvg/FilterSvg'

const CatalogPage = ({ query }: { query: IQueryParams }) => {
  const mode = useStore($mode)
  const gymManufacturers = useStore($gymManufacturers)
  const partsManufacturers = useStore($partsManufacturers)
  const filteredGymParts = useStore($filteredGymParts)
  const gymParts = useStore($gymParts)
  const [spinner, setSpinner] = useState(false)
  const [priceRange, setPriceRange] = useState([1000, 9000])
  const [isFilterInQuery, setIsFilterInQuery] = useState(false)
  const [isPriceRangeChanged, setIsPriceRangeChanged] = useState(false)
  const pagesCount = Math.ceil(gymParts.count / 20)
  const isValidOffset =
    query.offset && !isNaN(+query.offset) && +query.offset > 0
  const [currentPage, setCurrentPage] = useState(
    isValidOffset ? +query.offset - 1 : 0
  )
  const darkModeClass = mode === 'dark' ? `${styles.dark_mode}` : ''
  const router = useRouter()
  const isAnyGymManufacturerChecked = gymManufacturers.some(
    (item) => item.checked
  )
  const isAnyPartsManufacturerChecked = partsManufacturers.some(
    (item) => item.checked
  )
  const resetFilterBtnDisabled = !(
    isPriceRangeChanged ||
    isAnyGymManufacturerChecked ||
    isAnyPartsManufacturerChecked
  )
  const { toggleOpen, open, closePopup } = usePopup()

  useEffect(() => {
    loadGymParts()
  }, [filteredGymParts, isFilterInQuery])

  // console.log(guitarParts.rows)

  const loadGymParts = async () => {
    try {
      setSpinner(true)
      const data = await getGymPartsFx('/gym-parts?limit=20&offset=0')

      if (!isValidOffset) {
        await router.replace({
          query: {
            offset: 1,
          },
        })

        resetPagination(data)
        return
      }

      if (isValidOffset) {
        if (+query.offset > Math.ceil(data.count / 20)) {
          await router.push(
            {
              query: {
                ...query,
                offset: 1,
              },
            },
            undefined,
            {shallow: true}
          )

          setCurrentPage(0)
          setGymParts(isFilterInQuery ? filteredGymParts : data)
          return
        }

        const offset = +query.offset - 1
        const result = await getGymPartsFx(
          `/gym-parts?limit=20&offset=${offset}`
        )

        setCurrentPage(offset)
        setGymParts(isFilterInQuery ? filteredGymParts : result)
        return
      }

      setCurrentPage(0)
      setGymParts(isFilterInQuery ? filteredGymParts : data)
    } catch (error) {
      toast.error((error as Error).message)
    } finally {
      setTimeout(() => setSpinner(false), 1000)
    }
  }

  const resetPagination = (data: IGymParts) => {
    setCurrentPage(0)
    setGymParts(data)
  }

  const handlePageChange = async ({ selected }: { selected: number }) => {
    try {
      setSpinner(true)
      const data = await getGymPartsFx('/gym-parts?limit=20&offset=0')

      if (selected > pagesCount) {
        resetPagination(isFilterInQuery ? filteredGymParts : data)
        return
      }

      if (isValidOffset && +query.offset > Math.ceil(data.count / 2)) {
        resetPagination(isFilterInQuery ? filteredGymParts : data)
        return
      }

      const { isValidGymQuery, isValidPartsQuery, isValidPriceQuery } =
        checkQueryParams(router)

      const result = await getGymPartsFx(
        `/gym-parts?limit=20&offset=${selected}${
          isFilterInQuery && isValidGymQuery
            ? `&gym=${router.query.boiler}`
            : ''
        }${
          isFilterInQuery && isValidPartsQuery
            ? `&parts=${router.query.parts}`
            : ''
        }${
          isFilterInQuery && isValidPriceQuery
            ? `&priceFrom=${router.query.priceFrom}&priceTo=${router.query.priceTo}`
            : ''
        }`
      )

      await router.push(
        {
          query: {
            ...router.query,
            offset: selected + 1,
          },
        },
        undefined,
        {shallow: true}
      )

      setCurrentPage(selected)
      setGymParts(result)
    } catch (error) {
      toast.error((error as Error).message)
    } finally {
      setTimeout(() => setSpinner(false), 1000)
    }
  }

  const resetFilters = async () => {
    try {
      const data = await getGymPartsFx('/gym-parts?limit=20&offset=0')
      const params = router.query

      delete params.gym
      delete params.parts
      delete params.priceFrom
      delete params.priceTo
      params.first = 'cheap'

      await router.push({query: {...params}}, undefined, {shallow: true})

      setGymManufacturers(
        gymManufacturers.map((item) => ({ ...item, checked: false }))
      )

      setPartsManufacturers(
        partsManufacturers.map((item) => ({ ...item, checked: false }))
      )

      setGymParts(data)
      setPriceRange([1000, 9000])
      setIsPriceRangeChanged(false)
    } catch (error) {
      toast.error((error as Error).message)
    }
  }

  return (
    <section className={styles.catalog}>
      <div className={`container`}>
        <h2 className={`${styles.catalog__title} ${darkModeClass}`}>
          Каталог товаров
        </h2>
        <div className={`${styles.catalog__top} ${darkModeClass}`}>
          <AnimatePresence>
            {isAnyGymManufacturerChecked && (
              <ManufacturersBlock
                title="Производитель тренажеров:"
                event={updateGymManufacturer}
                manufacturersList={gymManufacturers}
              />
            )}
          </AnimatePresence>
          <AnimatePresence>
            {isAnyPartsManufacturerChecked && (
              <ManufacturersBlock
                title="Производитель запчастей:"
                event={updatePartsManufacturer}
                manufacturersList={partsManufacturers}
              />
            )}
          </AnimatePresence>
          <div className={styles.catalog__top__inner}>
            <button
              className={`${styles.catalog__top__reset} ${darkModeClass}`}
              disabled={resetFilterBtnDisabled}
              onClick={resetFilters}
            >
              Сбросить фильтр
            </button>
            <button
              className={styles.catalog__top__mobile_btn}
              onClick={toggleOpen}
            >
              <span className={styles.catalog__top__mobile_btn__svg}>
                <FilterSvg />
              </span>
              <span className={styles.catalog__top__mobile_btn__text}>
                Фильтр
              </span>
            </button>
            <FilterSelect setSpinner={setSpinner} />
          </div>
        </div>
        <div className={styles.catalog__bottom}>
          <div className={styles.catalog__bottom__inner}>
            <CatalogFilters
              priceRange={priceRange}
              setIsPriceRangeChanged={setIsPriceRangeChanged}
              setPriceRange={setPriceRange}
              resetFilterBtnDisabled={resetFilterBtnDisabled}
              resetFilters={resetFilters}
              isPriceRangeChanged={isPriceRangeChanged}
              currentPage={currentPage}
              setIsFilterInQuery={setIsFilterInQuery}
              closePopup={closePopup}
              filtersMobileOpen={open}
            />
            {spinner ? (
              <ul className={skeletonStyles.skeleton}>
                {Array.from(new Array(20)).map((_, i) => (
                  <li
                    key={i}
                    className={`${skeletonStyles.skeleton__item} ${
                      mode === 'dark' ? `${skeletonStyles.dark_mode}` : ''
                    }`}
                  >
                    <div className={skeletonStyles.skeleton__item__light} />
                  </li>
                ))}
              </ul>
            ) : (
              <ul className={styles.catalog__list}>
                {gymParts.rows?.length ? (
                  gymParts.rows.map((item) => (
                    <CatalogItem item={item} key={item.id} />
                  ))
                ) : (
                  <span>Список товаров пуст...</span>
                )}
              </ul>
            )}
          </div>
          <ReactPaginate
            containerClassName={styles.catalog__bottom__list}
            pageClassName={styles.catalog__bottom__list__item}
            pageLinkClassName={styles.catalog__bottom__list__item__link}
            previousClassName={styles.catalog__bottom__list__prev}
            nextClassName={styles.catalog__bottom__list__next}
            breakClassName={styles.catalog__bottom__list__break}
            breakLinkClassName={`${styles.catalog__bottom__list__break__link} ${darkModeClass}`}
            breakLabel="..."
            pageCount={pagesCount}
            forcePage={currentPage}
            onPageChange={handlePageChange}
          />
        </div>
      </div>
    </section>
  )
}

export default CatalogPage
