import { useMediaQuery } from '@/hooks/useMediaQuery'
import CatalogFiltersDesktop from './CatalogFiltersDesktop'
import { ICatalogFiltersProps } from '@/types/catalog'
import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import {
  $gymManufacturers,
  $partsManufacturers,
  setGymManufacturersFromQuery,
  setPartsManufacturersFromQuery,
} from '@/context/gymParts'
import { useStore } from 'effector-react'
import { useRouter } from 'next/router'
import { getQueryParamOnFirstRender } from '@/utils/common'
import CatalogFiltersMobile from './CatalogFiltersMobile'
import {
  checkQueryParams,
  updateParamsAndFilters,
  updateParamsAndFiltersFromQuery,
} from '@/utils/catalog'

const CatalogFilters = ({
                          priceRange,
                          setPriceRange,
                          setIsPriceRangeChanged,
                          resetFilterBtnDisabled,
                          resetFilters,
                          isPriceRangeChanged,
                          currentPage,
                          setIsFilterInQuery,
                          closePopup,
                          filtersMobileOpen,
                        }: ICatalogFiltersProps) => {
  const isMobile = useMediaQuery(820)
  const [spinner, setSpinner] = useState(false)
  const gymManufacturers = useStore($gymManufacturers)
  const partsManufacturers = useStore($partsManufacturers)
  const router = useRouter()

  useEffect(() => {
    applyFiltersFromQuery()
  }, [])

  const applyFiltersFromQuery = async () => {
    try {
      const {
        isValidGymQuery,
        isValidPartsQuery,
        isValidPriceQuery,
        partsQueryValue,
        priceFromQueryValue,
        gymQueryValue,
        priceToQueryValue,
      } = checkQueryParams(router)

      const gymQuery = `&gym=${getQueryParamOnFirstRender(
        'gym',
        router
      )}`
      const partsQuery = `&parts=${getQueryParamOnFirstRender('parts', router)}`
      const priceQuery = `&priceFrom=${priceFromQueryValue}&priceTo=${priceToQueryValue}`

      if (isValidGymQuery && isValidPartsQuery && isValidPriceQuery) {
        updateParamsAndFiltersFromQuery(() => {
          updatePriceFromQuery(+priceFromQueryValue, +priceToQueryValue)
          setGymManufacturersFromQuery(gymQueryValue)
          setPartsManufacturersFromQuery(partsQueryValue)
        }, `${currentPage}${priceQuery}${gymQuery}${partsQuery}`)
        return
      }

      if (isValidPriceQuery) {
        updateParamsAndFiltersFromQuery(() => {
          updatePriceFromQuery(+priceFromQueryValue, +priceToQueryValue)
        }, `${currentPage}${priceQuery}`)
      }

      if (isValidGymQuery && isValidPartsQuery) {
        updateParamsAndFiltersFromQuery(() => {
          setIsFilterInQuery(true)
          setGymManufacturersFromQuery(gymQueryValue)
          setPartsManufacturersFromQuery(partsQueryValue)
        }, `${currentPage}${gymQuery}${partsQuery}`)
        return
      }

      if (isValidGymQuery) {
        updateParamsAndFiltersFromQuery(() => {
          setIsFilterInQuery(true)
          setGymManufacturersFromQuery(gymQueryValue)
        }, `${currentPage}${gymQuery}`)
      }

      if (isValidPartsQuery) {
        updateParamsAndFiltersFromQuery(() => {
          setIsFilterInQuery(true)
          setPartsManufacturersFromQuery(partsQueryValue)
        }, `${currentPage}${partsQuery}`)
      }

      if (isValidPartsQuery && isValidPriceQuery) {
        updateParamsAndFiltersFromQuery(() => {
          updatePriceFromQuery(+priceFromQueryValue, +priceToQueryValue)
          setPartsManufacturersFromQuery(partsQueryValue)
        }, `${currentPage}${priceQuery}${partsQuery}`)
      }

      if (isValidGymQuery && isValidPriceQuery) {
        updateParamsAndFiltersFromQuery(() => {
          updatePriceFromQuery(+priceFromQueryValue, +priceToQueryValue)
          setGymManufacturersFromQuery(gymQueryValue)
        }, `${currentPage}${priceQuery}${gymQuery}`)
      }
    } catch (error) {
      const err = error as Error

      if (err.message === 'URI malformed') {
        toast.warning('Неправильный url для фильтров')
        return
      }

      toast.error(err.message)
    }
  }

  const updatePriceFromQuery = (priceFrom: number, priceTo: number) => {
    setIsFilterInQuery(true)
    setPriceRange([+priceFrom, +priceTo])
    setIsPriceRangeChanged(true)
  }

  const applyFilters = async () => {
    setIsFilterInQuery(true)
    try {
      setSpinner(true)
      const priceFrom = Math.ceil(priceRange[0])
      const priceTo = Math.ceil(priceRange[1])
      const priceQuery = isPriceRangeChanged
        ? `&priceFrom=${priceFrom}&priceTo=${priceTo}`
        : ''
      const gyms = gymManufacturers
        .filter((item) => item.checked)
        .map((item) => item.title)
      const parts = partsManufacturers
        .filter((item) => item.checked)
        .map((item) => item.title)
      const encodedGymQuery = encodeURIComponent(JSON.stringify(gyms))
      const encodedPartsQuery = encodeURIComponent(JSON.stringify(parts))
      const gymQuery = `&gym=${encodedGymQuery}`
      const partsQuery = `&parts=${encodedPartsQuery}`
      const initialPage = currentPage > 0 ? 0 : currentPage

      if (gyms.length && parts.length && isPriceRangeChanged) {
        updateParamsAndFilters(
          {
            gym: encodedGymQuery,
            parts: encodedPartsQuery,
            priceFrom,
            priceTo,
            offset: initialPage + 1,
          },
          `${initialPage}${priceQuery}${gymQuery}${partsQuery}`,
          router
        )
        return
      }

      if (isPriceRangeChanged) {
        updateParamsAndFilters(
          {
            priceFrom,
            priceTo,
            offset: initialPage + 1,
          },
          `${initialPage}${priceQuery}`,
          router
        )
      }

      if (gyms.length && parts.length) {
        updateParamsAndFilters(
          {
            gym: encodedGymQuery,
            parts: encodedPartsQuery,
            offset: initialPage + 1,
          },
          `${initialPage}${gymQuery}${partsQuery}`,
          router
        )
        return
      }

      if (gyms.length) {
        updateParamsAndFilters(
          {
            gym: encodedGymQuery,
            offset: initialPage + 1,
          },
          `${initialPage}${gymQuery}`,
          router
        )
      }

      if (parts.length) {
        updateParamsAndFilters(
          {
            parts: encodedPartsQuery,
            offset: initialPage + 1,
          },
          `${initialPage}${partsQuery}`,
          router
        )
      }

      if (gyms.length && isPriceRangeChanged) {
        updateParamsAndFilters(
          {
            gym: encodedGymQuery,
            priceFrom,
            priceTo,
            offset: initialPage + 1,
          },
          `${initialPage}${gymQuery}${priceQuery}`,
          router
        )
      }

      if (parts.length && isPriceRangeChanged) {
        updateParamsAndFilters(
          {
            parts: encodedPartsQuery,
            priceFrom,
            priceTo,
            offset: initialPage + 1,
          },
          `${initialPage}${partsQuery}${priceQuery}`,
          router
        )
      }
    } catch (error) {
      toast.error((error as Error).message)
    } finally {
      setSpinner(false)
    }
  }

  return (
    <>
      {isMobile ? (
        <CatalogFiltersMobile
          closePopup={closePopup}
          spinner={spinner}
          applyFilters={applyFilters}
          priceRange={priceRange}
          setIsPriceRangeChanged={setIsPriceRangeChanged}
          setPriceRange={setPriceRange}
          resetFilterBtnDisabled={resetFilterBtnDisabled}
          resetFilters={resetFilters}
          filtersMobileOpen={filtersMobileOpen}
        />
      ) : (
        <CatalogFiltersDesktop
          priceRange={priceRange}
          setPriceRange={setPriceRange}
          setIsPriceRangeChanged={setIsPriceRangeChanged}
          resetFilterBtnDisabled={resetFilterBtnDisabled}
          spinner={spinner}
          resetFilters={resetFilters}
          applyFilters={applyFilters}
        />
      )}
    </>
  )
}

export default CatalogFilters
